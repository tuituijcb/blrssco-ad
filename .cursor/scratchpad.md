# H5小游戏网站项目

## 项目背景
创建H5小游戏网站，游戏文件托管在Cloudflare R2存储桶，使用Nuxt.js 3 + Cloudflare Pages。

## 技术架构
- **主站域名**: blrssco.com
- **URL 规范**: 所有网站相关链接、canonical 等 URL 均不带 www，仅用主域名（如 https://blrssco.com）
- **前端**: Nuxt.js 3
  - 游戏页面(/games/[id]): SSG (静态生成，iframe嵌入)
  - 其他页面(首页、列表页): SSR (服务端渲染，SEO优化)
- **部署**: Cloudflare Pages
- **存储**: Cloudflare R2 (自定义域名: games.blrssco.com)
- **游戏加载**: 直接iframe访问R2
  - R2路径: games-blrssco/1000Blocks/index.html
  - 访问URL: https://games.blrssco.com/1000Blocks/index.html

## 项目状态

### ✅ 已完成
- Nuxt.js 3项目搭建和基础页面
- 1000Blocks游戏成功集成 (路径: games-blrssco/1000Blocks/)
- 2048-cards游戏完全上传到R2 (路径: games-blrssco/2048-cards/)
  - ✅ 所有根目录文件: index.html, style.css, sw.js, workermain.js, offline.json, appmanifest.json, data.json
  - ✅ scripts文件夹: c3runtime.js, dispatchworker.js
  - ✅ icons文件夹: 所有图标文件 (icon-16.png, icon-32.png, icon-64.png, icon-256.png, icon-512.png, loading-logo.png)
  - ✅ images文件夹: 所有游戏贴图 (card-sheet0.png, shared-0-sheet0/1/2/3.png, black-sheet0.png等)
  - ✅ media文件夹: 所有音频文件 (背景音乐、音效等mp3文件)
- 2048Fusion游戏完全上传到R2 (路径: games-blrssco/2048Fusion/)
  - ✅ 139个文件，总大小7.7MB
  - ✅ js文件夹: pixi.min.js, game.js, howler.core.min.js
  - ✅ assets文件夹: fonts, gameplay, loading, sounds, sprites, tutorial等所有资源
  - ✅ h5games_sdks文件夹: developer_v2.js
- 游戏直接从R2加载，无需API代理
- 响应式设计和全屏功能

### 🔄 当前任务
- ✅ 上传2048-cards游戏到R2存储桶 (API完整上传完成 - 42个文件，3.5MB)
- ✅ 将游戏添加到games.js数据文件中
- ✅ 修复本地文件缺失icon-128.png的问题
- ✅ 使用Node.js脚本通过wrangler API完整上传所有文件
- ✅ 上传2048Fusion游戏到R2存储桶 (139个文件，7.7MB)
- ✅ 将2048Fusion游戏添加到games.js数据文件中
- ✅ 开发新的应用展示功能 (数据库集成版本)
  - ✅ 创建useSupabase.js - Supabase客户端配置
  - ✅ 创建useApps.js - 数据库查询composable (含工具函数)
  - ✅ 重构/apps/[id].vue应用详情页面 (集成Supabase动态查询)
  - ✅ 重新创建/apps/index.vue应用列表页面 (Supabase集成版本)
  - ⚠️ 需要配置环境变量 (SUPABASE_URL, SUPABASE_ANON_KEY)
  - 🔄 待测试数据库连接和页面功能
- 测试两个游戏在R2上的运行状况
- 🔄 当前任务：创建游戏分类组件
  **任务描述**：根据用户提供的设计图片和 `public/assets/category` 文件夹中的图片资源，创建游戏分类组件

  **分析已有资源**：
  - 📁 分类图片：13个分类图标 (shooting, sort, merge, ball, puzzle, connect, music, match3, findDifference, parkingCar, boomBlast, running, towerDefense)
  - 🎨 图片格式：PNG格式，大小在14KB-129KB之间
  - 📱 设计要求：参考用户提供的样式图片

  **执行计划**：
  1. ✅ 分析可用的分类图片资源
  2. 🔄 创建 `components/GameCategory.vue` 组件
  3. 🔄 设计分类网格布局（响应式）
  4. 🔄 实现分类点击跳转功能
  5. 🔄 添加悬停效果和动画
  6. 🔄 集成到相关页面中

  **下一步行动**：创建游戏分类组件

### 🔄 待处理
- 添加更多游戏
- SEO优化
- 性能监控

## 执行者反馈或请求帮助

### ⚠️ 紧急修复：Supabase Composable 错误已解决
**问题**：收到 500 错误 - `useRuntimeConfig()` 在 Vue setup 函数外被调用

**原因**：在 `composables/useSupabase.js` 顶层直接调用了 `useRuntimeConfig()`

**解决方案**：✅ 已修复
- 将 `useRuntimeConfig()` 调用移到 `useSupabase()` 函数内部
- 在 composable 内部进行 Supabase 客户端初始化

### 当前状态：等待环境变量配置
**下一步行动需求**：
- ⚠️ **紧急**: 需要配置环境变量
  - `SUPABASE_URL` - Supabase 项目 URL
  - `SUPABASE_ANON_KEY` - Supabase 匿名访问密钥
- 🔄 需要测试修复后的页面功能
- 🔄 需要验证数据库连接
- 🔄 需要验证 iframe 嵌入 Google Play 链接功能

### 技术修复详情
已成功修复的问题：
- ✅ useRuntimeConfig 作用域错误
- ✅ Nuxt配置中更新游戏路由（移除旧的应用路由）
- ✅ composable 在正确的上下文中执行

### 游戏功能已重构为Supabase数据库集成版本
执行者已完成以下改造：

1. **明确需求和重构方向**
   - ✅ 删除不需要的应用功能页面（/apps/）
   - ✅ 专注于游戏功能：/games/app_name 页面
   - ✅ 参考 Yapigames Saloon 页面布局
   - ✅ 从 Supabase 根据 app_name 查询 Google_link

2. **Supabase游戏数据集成**
   - ✅ 更新 `composables/useSupabase.js`：
     - 添加 `getGameByName()` 函数根据app_name查询数据
     - 添加 URL slug 转换工具函数
   - ✅ 重构 `/games/[id].vue` 游戏详情页面：
     - 参考 Yapigames 布局设计
     - iframe 嵌入 Google_link
     - 完整的游戏信息展示和全屏功能
   - ✅ 重新创建 `/games/index.vue` 游戏列表页面：
     - 从 Supabase 查询所有游戏数据
     - 搜索和分类过滤功能
     - 现代化卡片设计

3. **功能特性**
   - ✅ 响应式设计和移动端支持
   - ✅ 全屏游戏模式
   - ✅ SEO 优化配置
   - ✅ 错误处理和加载状态
   - ✅ URL 友好的路由（app_name -> slug）

4. **下一步行动需求**
   - ⚠️ 需要配置环境变量：`SUPABASE_URL` 和 `SUPABASE_ANON_KEY`
   - 🔄 需要测试数据库连接和页面功能
   - 🔄 需要验证 iframe 嵌入 Google Play 链接功能

所有代码已重构完成，专注于游戏功能实现，等待环境变量配置和功能测试。

### ✅ 已完成：创建游戏分类组件
**任务描述**：根据用户提供的设计图片和 `public/assets/category` 文件夹中的图片资源，创建游戏分类组件

**已完成的工作**：
1. ✅ 分析可用的分类图片资源（13个分类图标）
2. ✅ 创建 `components/GameCategory.vue` 组件
   - 现代化毛玻璃效果设计
   - 响应式网格布局（桌面端3列，平板2列，移动端1列）
   - 悬停动画效果（图标旋转、卡片提升、光效掠过）
   - 点击跳转到分类页面功能
3. ✅ 更新 `pages/games/index.vue` 游戏列表页面
   - 支持分类筛选功能
   - 动态页面标题和描述
   - 分类筛选指示器
   - 清除筛选功能
   - 路由变化监听和自动重新加载
4. ✅ 创建 `pages/test-category.vue` 测试页面
   - 展示分类组件效果
   - 渐变背景设计
   - SEO优化配置

**技术特性**：
- 🎨 现代化UI设计：毛玻璃效果、渐变色、阴影
- 📱 完全响应式：适配桌面/平板/移动端
- ⚡ 流畅动画：悬停效果、过渡动画
- 🔗 完整导航：分类筛选、页面跳转
- 🎯 SEO友好：动态标题、Meta标签

**测试方式**：
访问 `/test-category` 页面查看分类组件效果

### ✅ 已完成：集成GameGrid组件到游戏列表页面
**任务描述**：修改 `pages/games/index.vue` 使用 `GameGrid` 组件，支持分类筛选参数

**已完成的工作**：
1. ✅ 重构 `pages/games/index.vue` 页面结构
   - 移除原有的手动游戏网格代码
   - 集成 `GameGrid` 组件，利用其无限滚动功能
   - 统一使用渐变背景设计
2. ✅ 更新页面头部样式
   - 改为白色文字配合渐变背景
   - 增强分类筛选指示器的视觉效果
   - 添加毛玻璃效果和阴影
3. ✅ 简化脚本逻辑
   - 移除重复的数据加载代码
   - 保留分类显示名称映射功能
   - 保留分类筛选清除功能
4. ✅ 确认 `useSupabase.js` 支持
   - 验证 `getGamesByTypeAndCategoryWithOffset` 函数存在
   - 支持分页和分类筛选参数

**技术优势**：
- 🎮 复用GameGrid组件的所有功能（无限滚动、响应式、错误处理）
- 🎨 统一的视觉设计语言
- 📱 完整的移动端支持
- 🔄 自动分类筛选功能
- ⚡ 性能优化的数据加载

**使用方式**：
- 访问 `/games` 查看所有游戏
- 访问 `/games?category=shooting` 查看射击类游戏
- 点击分类组件自动跳转到对应筛选页面

### ✅ 已完成：首页集成分类组件展示
**任务描述**：在首页添加游戏分类展示区域，提供完整的用户导航体验

**已完成的工作**：
1. ✅ 在首页添加游戏分类展示区域
   - 使用与分类页面一致的渐变背景设计
   - 嵌入完整的 GameCategory 组件
   - 添加引导性标题和描述文字
2. ✅ 更新首页导航链接
   - 修改"View Categories"按钮链接到 `/test-category`
   - 添加"View All Categories"按钮在分类区域底部
3. ✅ 保持设计一致性
   - 统一的毛玻璃效果按钮样式
   - 一致的渐变背景色彩方案
   - 响应式布局适配

**完整的用户体验流程**：
1. 用户访问首页 `/` 
2. 浏览游戏分类展示区域，选择感兴趣的分类
3. 点击分类自动跳转到 `/games?category=xxx` 筛选页面
4. 在筛选页面查看该分类的所有游戏（无限滚动）
5. 点击游戏进入详情页面开始游戏

**项目整体状态**：游戏分类系统已完全实现并集成到网站各个页面中！

### ✅ 已完成：SSR 支持优化和动态 SEO
**任务描述**：优化页面的 SSR 支持和 SEO 配置

**SSR 支持现状分析**：
1. ✅ **`pages/games/index.vue`** - 完全支持 SSR
   - 服务端渲染，搜索引擎友好
   - 动态 SEO 标题和描述（根据分类变化）
   - 动态 canonical URL 配置
2. ✅ **`pages/index.vue`** - 完全支持 SSR
   - 静态内容，SEO 优化完整
3. ✅ **`pages/test-category.vue`** - 完全支持 SSR
   - 静态内容，SEO 配置完整
4. ⚠️ **`pages/games/[id].vue`** - 强制 SPA 模式
   - 设置 `definePageMeta({ mode: 'spa' })` 支持动态路由
   - 适合游戏页面的客户端渲染需求

**SEO 优化改进**：
1. ✅ 动态页面标题
   - 通用页面：`HTML5 Games Collection - Play Online Games`
   - 分类页面：`Shooting Games - Play Online Shooting Games`
2. ✅ 动态 Meta 描述
   - 根据分类自动生成相关描述
   - 包含关键词优化
3. ✅ 动态关键词
   - 分类相关关键词自动生成
   - 提升搜索排名潜力
4. ✅ Canonical URL 配置
   - 防止重复内容问题
   - 指向正确的规范 URL

**技术优势**：
- 🎯 完整的 SSR 支持（除游戏详情页）
- 📈 动态 SEO 优化，提升搜索排名
- 🔗 规范 URL 配置，避免 SEO 问题
- 📱 保持响应式和用户体验

## GameGrid 组件使用说明

### 组件功能
`components/GameGrid.vue` - 通用游戏网格展示组件，支持：
- 🎯 两种显示模式：无限滚动模式 & 固定个数模式
- 🎮 应用类型筛选：h5, android, ios, windows 等
- 🏷️ 分类筛选：puzzle, action, arcade 等
- 📱 完全响应式设计：桌面端自适应 / 移动端固定4列
- 🖱️ 悬停效果：图标上层显示格式化游戏名称
- 🔄 无限滚动：自动加载更多游戏
- 🎨 现代化 UI：圆角设计、阴影效果、平滑动画

### 插入方式

#### 1. 基础使用（默认无限模式）
```vue
<template>
  <div>
    <!-- 显示所有H5游戏，支持无限滚动 -->
    <GameGrid />
  </div>
</template>
```

#### 2. 首页推荐游戏（固定8个）
```vue
<template>
  <div>
    <h2>推荐游戏</h2>
    <GameGrid 
      app-type="h5" 
      mode="fixed"
      :limit="8"
    />
  </div>
</template>
```

#### 3. 分类页面（无限滚动特定分类）
```vue
<template>
  <div>
    <h2>益智游戏</h2>
    <GameGrid 
      app-type="h5" 
      category="puzzle"
      mode="infinite"
      :limit="12"
    />
  </div>
</template>
```

#### 4. 游戏详情页相关游戏（固定6个）
```vue
<template>
  <div>
    <h3>更多H5游戏</h3>
    <GameGrid 
      app-type="h5" 
      mode="fixed"
      :limit="6"
    />
  </div>
</template>
```

### 参数配置

| 参数名 | 类型 | 默认值 | 说明 | 示例 |
|--------|------|---------|------|------|
| `app-type` | String | 'h5' | 应用类型筛选 | 'h5', 'android', 'ios', 'windows' |
| `category` | String | null | 分类筛选 | 'puzzle', 'action', 'arcade', 'racing' |
| `mode` | String | 'infinite' | 显示模式 | 'infinite' 无限滚动 / 'fixed' 固定个数 |
| `limit` | Number | 21 | 数量控制 | 无限模式：每次加载量 / 固定模式：总显示量 |
| `max-count` | Number | null | 最大显示数（仅固定模式） | 覆盖 limit 参数 |

### 配置示例

#### 场景1：首页游戏推荐
```vue
<!-- 显示8个最新H5游戏 -->
<GameGrid 
  app-type="h5" 
  mode="fixed"
  :limit="8"
/>
```

#### 场景2：分类页面
```vue
<!-- 动作游戏分类，无限滚动 -->
<GameGrid 
  app-type="h5" 
  category="action"
  mode="infinite"
  :limit="15"
/>
```

#### 场景3：多平台展示
```vue
<!-- Android游戏，固定显示12个 -->
<GameGrid 
  app-type="android" 
  mode="fixed"
  :limit="12"
/>

<!-- iOS游戏，固定显示10个 -->
<GameGrid 
  app-type="ios" 
  mode="fixed"
  :limit="10"
/>
```

#### 场景4：侧边栏相关游戏
```vue
<!-- 相关游戏，使用maxCount覆盖limit -->
<GameGrid 
  app-type="h5" 
  mode="fixed"
  :limit="6"
  :max-count="4"
/>
```

### 响应式行为

#### 桌面端（>768px）
- 自适应列数，最小宽度160px
- 悬停效果：图标放大、阴影增强
- 游戏名称在图标上层显示

#### 移动端（≤768px）
- 固定4列布局，占满屏幕宽度
- 间距和圆角适配小屏幕
- 触摸友好的交互体验

#### 超小屏幕优化
- ≤480px：进一步减小间距和字体
- ≤320px：最小化间距，确保在窄屏设备上正常显示

### 数据来源
- 从 Supabase `appinfo` 表查询数据
- 支持分页查询（无限模式）
- 自动处理图片URL格式（R2存储桶）
- 游戏名称格式化：连字符转空格，首字母大写

### 使用建议
1. **首页推荐**：使用固定模式，8-12个游戏
2. **分类浏览**：使用无限模式，12-15个每次加载
3. **相关游戏**：使用固定模式，4-6个游戏
4. **完整列表**：使用无限模式，提供完整浏览体验

### 集成示例（完整页面）
```vue
<template>
  <div class="game-page">
    <!-- 推荐游戏区域 -->
    <section class="featured-section">
      <h2>推荐游戏</h2>
      <GameGrid 
        app-type="h5" 
        mode="fixed"
        :limit="8"
      />
    </section>

    <!-- 益智游戏区域 -->
    <section class="puzzle-section">
      <h2>益智游戏</h2>
      <GameGrid 
        app-type="h5" 
        category="puzzle"
        mode="fixed"
        :limit="12"
      />
    </section>

    <!-- 所有游戏（无限滚动） -->
    <section class="all-games-section">
      <h2>所有游戏</h2>
      <GameGrid 
        app-type="h5" 
        mode="infinite"
        :limit="15"
      />
    </section>
  </div>
</template>
```

## 核心经验
- 最简单的方案往往最有效：直接iframe访问R2比复杂API代理更可靠
- R2 + 自定义域名完美解决相对路径问题
- 保持代码简洁，专注核心功能
- 游戏文件完整性很重要：检查index.html、appmanifest.json、offline.json中的文件引用
- 从静态数据到动态数据库的重构：composable模式让代码更加模块化和可维护

# 背景和动机
用户希望移动端header体验与PC端一致，提升交互效率和美观。

# 关键挑战和分析
- 需要在移动端header实现logo居中，左右按钮分工明确。
- 搜索按钮点击后header原地展开输入框+下拉实时结果，交互与PC端一致。
- 左侧按钮点击后header下方展开GameCategory分类下拉菜单，再次点击或点外部收起。
- 兼容PC端逻辑，保证两端体验一致。

# 高层任务拆分
- [ ] 1. 移动端header结构调整，logo居中，左右按钮分工明确
- [ ] 2. 搜索按钮点击后header原地展开输入框+下拉实时结果，复用PC端逻辑
- [ ] 3. 左侧按钮点击后header下方展开GameCategory分类下拉菜单，支持收起
- [ ] 4. 样式适配移动端，保证交互流畅
- [ ] 5. 自测交互和样式，确保无bug

# 项目状态看板
- [ ] 移动端header结构和交互优化

# 执行者反馈或请求帮助
等待用户确认计划后，按步骤推进。

# 经验教训
- header交互需兼容PC和移动端，避免影响原有逻辑。
- 分类菜单下拉需防止遮挡主内容，交互需流畅。
- 【重要】GameGrid.vue 加载动画图片路径异常：
  - 按照 Nuxt/Vue 标准，public 目录下静态资源应通过 /loading2.gif 访问。
  - 实际本地开发环境中，/loading2.gif 裂图，/public/loading2.gif 正常。
  - 其他组件用 /loading2.gif 可正常显示，唯独 GameGrid.vue 需加 public/ 前缀。
  - 推测为本地静态资源映射或服务器根目录配置异常，建议后续如遇类似问题，优先排查静态资源路径和服务器配置。

# 项目状态看板
- [ ] 移动端header结构和交互优化

### 🔄 新任务：创建 /contact 页面
**任务描述**：实现一个简洁的联系页面，只显示一句英文提示，邮箱为 contact@blrssco.com，样式参考用户截图。

**执行计划**：
1. 创建 pages/contact.vue 页面文件
2. 页面内容居中显示一句英文：If you have any questions or inquiries, please reach us via contact@blrssco.com.
3. 邮箱为可点击 mailto 链接，字体加粗
4. 背景色为淡蓝色，参考截图
5. 保持与主站风格一致，内容全英文
6. 自测响应式和可访问性
7. 等待用户验收

**成功标准**：
- 页面路径为 /contact
- 只显示一句英文，邮箱为 contact@blrssco.com
- 样式与截图一致，居中、加粗、淡蓝色背景
- 邮箱可点击，跳转到邮箱客户端
- 代码风格与项目一致 

### 🔄 新任务：创建 /privacy-policy 页面
**任务描述**：创建隐私政策页面，内容照抄 https://www.yapigames.com/privacy ，将所有网站名替换为 Blrsscogames/blrsscogames.com/Blrsscogames Site/Blrsscogames。

**执行计划**：
1. 创建 pages/privacy-policy.vue 页面文件
2. 复制 yapigames.com/privacy 的英文内容，全部替换为 Blrsscogames 相关名称
3. 保持原文格式、标题、段落、列表等结构
4. 页面内容全英文，风格与主站一致
5. 自测响应式和可访问性
6. 等待用户验收

**成功标准**：
- 页面路径为 /privacy-policy
- 内容与 yapigames.com/privacy 一致，所有品牌名已替换为 Blrsscogames
- 英文、格式规范、可读性好
- 代码风格与项目一致 

### 🔄 新任务：创建 /terms-of-service 页面
**任务描述**：创建服务条款页面，内容照抄 https://www.yapigames.com/legalterms ，将所有网站名替换为 Blrsscogames/blrsscogames.com/Blrsscogames Site/Blrsscogames。

**执行计划**：
1. 创建 pages/terms-of-service.vue 页面文件
2. 复制 yapigames.com/legalterms 的英文内容，全部替换为 Blrsscogames 相关名称
3. 保持原文格式、标题、段落、列表等结构
4. 页面内容全英文，风格与主站一致
5. 自测响应式和可访问性
6. 等待用户验收

**成功标准**：
- 页面路径为 /terms-of-service
- 内容与 yapigames.com/legalterms 一致，所有品牌名已替换为 Blrsscogames
- 英文、格式规范、可读性好
- 代码风格与项目一致 