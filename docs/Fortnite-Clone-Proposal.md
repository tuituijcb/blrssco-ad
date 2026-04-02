# Fortnite 详情页 1:1 像素级复刻执行方案

## 一、项目背景与目标
将 Yapigames 上的 `Fortnite` 详情页在 `blrssco-cf` 项目中进行高还原度复刻。
* **目标框架**：Nuxt 3 + Vue 3 + Tailwind CSS（复用项目现有架构）
* **数据来源**：全部从 Supabase 的现有数据库表读取
* **核心原则**：不修改 Supabase 表结构，最大化复用 `components/gameinfo` 现有组件，静态资源（如图标和截图）存放至 Cloudflare R2。

## 二、页面模块与技术拆解对齐

目标页面由 6 大模块组成，我们通过以下组件映射实现复刻：

### 1. 顶部全局导航 (Header)
* **实现方案**：直接复用项目中现有的全局布局组件（如 `layouts/default.vue` 或 `AppHeader.vue`），不做特殊修改。

### 2. 顶部推荐模块 (Top Recommend)
* **目标呈现**：横向滚动的 12 格小游戏卡片。
* **数据来源**：调用 `useSupabase.js`，写一个 `getRandomGames(12)` 方法（使用 `ORDER BY RANDOM() LIMIT 12` 语法）读取 `appinfo` 表真实数据。
* **组件选用**：复用项目现存的 `components/gameinfo/TopRecommend.vue` 或新建一个简单的横向滑动列表，传入随机数据。

### 3. 主体游戏信息区 (Main Info Card)
* **目标呈现**：大号 Icon、游戏名称、评分、厂商、核心参数（分类、安装量等）及下载按钮。
* **数据来源**：`appinfo` 表（基于当前路由传递的 `package_name` 获取）。
  * _注意_：原版有 `content_rating`（年龄分级），而我们库里只有 `category`。方案约定：直接隐藏该参数或写死占位符（如 "Everyone"）。
* **组件选用**：直接复用并微调 `components/gameinfo/GameHeroSection.vue` 以及 `GameDetail.vue`。
* **关键变更**：
  * 将 `GameHeroSection` 里的 "Play" 按钮改成 "Download APK"。
  * 下载按钮点击事件直接**新开窗口跳转外部链接**（取 `appinfo.Google_link` 或 `appinfo.apple_link`），不做本地包托管。

### 4. 截图与多媒体区 (Screenshots)
* **目标呈现**：支持手指滑动或点击箭头的横滑截图墙。
* **数据来源**：通过 `package_name` 关联查询 `images` 表获取所有 `public_url`。
* **组件选用**：需**全新实现** `components/gameinfo/ScreenshotCarousel.vue`。建议引入基于 Vue 的 `Swiper` 或 `vue3-carousel` 库，避免原生写大量触摸事件逻辑。
* **静态资源流转**：原页面的截图已下载至本地临时目录 `temp_assets/`，后续由脚本统一上传至 R2，再将链接灌入 `images` 库中即可。

### 5. 详情描述与玩法介绍 (Editor Reviews / How to play)
* **数据来源**：通过 `package_name` 关联查询 `articles` 表，提取 `editors_review` 和 `how_to_use` 字段的 HTML/文本内容。
* **组件选用**：直接复用现有的 `components/gameinfo/ArticleSections.vue`。

### 6. 右侧边栏/底部推荐 (Aside / Recommends)
* **数据来源**：与顶部推荐一样，随机从 `appinfo` 拉取批量数据。
* **组件选用**：复用现有的 `components/VerticalGameCategory.vue` 或相关组件。通过 CSS Grid 分配 Layout 占比（PC端 左70% 右30%，移动端转为 100% 堆叠）。

### 7. 砍掉的模块 (Out of Scope)
* ❌ **版本历史下载列表 (Version History)**：由于本次需求要求点击直接外跳 Google Play / App Store，历史包列表缺乏业务价值，直接从 UI 中剔除。

---

## 三、代码执行流向建议 (供 Agent 参考)

1. **清理工作（已完成）**：回滚所有未经授权的代码改动（`git restore`），删除错误创建的冗余组件。
2. **数据接入准备**：
   * 在 `composables/useSupabase.js` 中补齐通过 `package_name` 同时查询 `appinfo`, `articles`, `images` 这 3 张表的异步方法。
   * 新增一个拉取全局随机推荐列表的方法。
3. **UI 拼装**：
   * 在 `pages/detail/[id].vue` 中，按照原网页的 DOM 树层级和 Tailwind 类名，将现成的 Vue 组件像搭积木一样排列：
     ```html
     <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
       <!-- 左侧主体 -->
       <div class="lg:col-span-8">
          <GameHeroSection />
          <GameDetail />
          <ScreenshotCarousel />  <!-- 唯一需要新建的交互组件 -->
          <ArticleSections />
       </div>
       <!-- 右侧边栏 -->
       <div class="hidden lg:block lg:col-span-4">
          <VerticalGameCategory />
       </div>
     </div>
     ```
4. **样式精修**：以 Yapigames 为视觉基准，精调边距、圆角与阴影。

## 四、当前可用的静态物料
目标页面的相关图标、截图均已完成无损抓取。
存放位置：`/Users/tuitui/.openclaw/workspace/blrssco-cf/temp_assets/`
用途：供上传 R2 存储桶和写入 Supabase `images` 表进行前端联调使用。
