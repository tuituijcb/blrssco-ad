# TopGames 组件使用说明

## 概述

TopGames.vue 是一个专门设计的游戏网格组件，具有以下特点：

- **特色布局**：左上角第一个游戏图标占据四个格子大小（2x2）
- **响应式设计**：移动端固定显示18个游戏，PC端固定显示17个游戏
- **自定义配置**：支持自定义每个游戏的app_name和优先级
- **自动填充**：如果自定义游戏不足，会自动从数据库获取其他游戏填充

## 组件属性 (Props)

### customGames
- **类型**: Array
- **默认值**: []
- **说明**: 自定义游戏列表配置
- **格式**: 
```javascript
[
  { app_name: 'game1', priority: 1 },
  { app_name: 'game2', priority: 2 }
]
```

### category
- **类型**: String
- **默认值**: null
- **说明**: 如果没有自定义列表，从数据库获取的分类

### appType
- **类型**: String
- **默认值**: 'h5'
- **说明**: 应用类型筛选

### mobileCount
- **类型**: Number
- **默认值**: 18
- **说明**: 移动端显示的游戏数量

### pcCount
- **类型**: Number
- **默认值**: 17
- **说明**: PC端显示的游戏数量

## 使用示例

### 基本使用（自动从数据库获取）
```vue
<template>
  <TopGames 
    :mobile-count="18"
    :pc-count="17"
    app-type="h5"
  />
</template>
```

### 使用自定义游戏列表
```vue
<template>
  <TopGames 
    :custom-games="featuredGames"
    :mobile-count="18"
    :pc-count="17"
    app-type="h5"
  />
</template>

<script setup>
const featuredGames = ref([
  { app_name: '1000blocks', priority: 1 },
  { app_name: '2048-cards', priority: 2 },
  { app_name: '2048fusion', priority: 3 }
])
</script>
```

### 按分类获取游戏
```vue
<template>
  <TopGames 
    category="puzzle"
    :mobile-count="18"
    :pc-count="17"
    app-type="h5"
  />
</template>
```

## 布局说明

### PC端布局 (>768px)
- 6列网格布局
- 第一个游戏占据2x2格子（特色游戏）
- 其余游戏各占1x1格子
- 总共显示17个游戏

### 移动端布局 (≤768px)
- 6列网格布局
- 第一个游戏占据2x2格子（特色游戏）
- 其余游戏各占1x1格子
- 总共显示18个游戏

## 样式特点

- **特色游戏**：第一个游戏有更大的字体和更突出的显示效果
- **悬停效果**：游戏图标有悬停动画和标题覆盖层
- **响应式间距**：不同屏幕尺寸有不同的间距和圆角
- **加载状态**：显示加载动画和错误状态

## 数据要求

组件期望从数据库获取的游戏数据格式：
```javascript
{
  app_name: "游戏应用名称",
  icon_url: "游戏图标URL",
  category: "游戏分类",
  app_type: "应用类型"
}
```

## 注意事项

1. **app_name 必须准确**：自定义游戏列表中的 app_name 必须与数据库中的完全匹配
2. **优先级排序**：priority 数值越小，优先级越高
3. **自动填充**：如果自定义游戏数量不足，组件会自动从数据库获取其他游戏填充
4. **错误处理**：如果某个自定义游戏在数据库中不存在，会在控制台显示警告但不会中断加载

## 在 gameindex.vue 中的使用

当前在 `pages/gameindex.vue` 中已经集成了 TopGames 组件，配置如下：

```vue
<TopGames 
  :custom-games="featuredGames"
  :mobile-count="18"
  :pc-count="17"
  app-type="h5"
/>
```

可以通过修改 `featuredGames` 数组来自定义显示的热门游戏。
