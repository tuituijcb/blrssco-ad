<template>
  <div :key="(typeof categoryName === 'string' ? categoryName : (Array.isArray(categoryName) ? categoryName[0] : 'all')) || 'all'" class="min-h-screen" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
    <!-- 页面标题区域 -->
    <div class="relative z-10 pt-12 pb-4">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-2">
          <span v-if="categoryName">{{ getCategoryDisplayName(categoryName as any) }} Games</span>
          <span v-else>Free Games Collection</span>
        </h1>
        <p class="text-xl text-white/90 mb-4">
          <span v-if="categoryName">
            Discover amazing {{ getCategoryDisplayName(categoryName as any).toLowerCase() }} games to play for free
          </span>
          <span v-else>
            Discover thousands of amazing games to play for free
          </span>
        </p>
        
        <!-- 返回所有游戏按钮 - 只在有分类时显示 -->
        <div v-if="categoryName" class="mb-4">
          <button 
            @click="navigateTo('/category')"
            class="inline-flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300 backdrop-filter backdrop-blur-sm border border-white/30"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            All Games
          </button>
        </div>
      </div>
    </div>
    
    <!-- AdSense 广告位 category-top -->
    <div class="ad-container">
      <AdSense ad-slot="8474423136" />
    </div>
    
    <!-- 游戏网格 -->
    <div class="relative z-10">
      <div class="container mx-auto px-4 pb-12">
        <GameGrid 
          :key="`${categoryName || 'all'}-h5`"
          app-type="h5"
          :category="dbCategoryName"
          mode="infinite"
          :limit="21"
          :disable-shuffle="true"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from '#app'
import { definePageMeta } from '#imports'
import { useRoute } from 'vue-router'
import { usePrefixLink } from '@/composables/usePrefixLink'
import AdSense from '@/components/AdSense/AdSense.vue'

usePrefixLink()

// 获取路由参数
const route = useRoute()
const prefix = Array.isArray(route.params.prefix) ? route.params.prefix[0] : route.params.prefix
if (!/^\d{3}$/.test(prefix)) {
  if (process.client) {
    window.location.href = `/category/${route.params.category}`
  }
}

const categoryName = computed(() => {
  const val = route.params.category
  return Array.isArray(val) ? val[0] : val || null
})

// 分类名称映射
const categoryDisplayMap: Record<string, string> = {
  'shooting': 'Shooting',
  'sort': 'Sort',
  'boom-blast': 'Boom Blast',
  'merge': 'Merge',
  'find-difference': 'Find Difference',
  'match3': 'Match3',
  'parking': 'Parking',
  'tower-defense': 'Tower Defense',
  'music': 'Music',
  'puzzle': 'Puzzle',
  'ball': 'Ball',
  'running': 'Running',
  'connect': 'Connect'
}

// 分类key到数据库category字段的映射（基于实际数据库值）
const categoryDbMap: Record<string, string> = {
  'shooting': 'shooting',        // 数据库中是小写
  'sort': 'Sort',               // 数据库中是 Sort
  'boom-blast': 'Boom Blast',   // 数据库中是 Boom Blast
  'merge': 'Merge',             // 数据库中是 Merge
  'find-difference': 'Find Difference', // 数据库中是 Find Difference
  'match3': 'Match3',           // 数据库中是 Match3
  'parking': 'Parking',         // 数据库中是 Parking
  'tower-defense': 'Tower Defense', // 数据库中是 Tower Defense
  'music': 'Music',             // 数据库中是 Music
  'puzzle': 'Puzzle',           // 数据库中是 Puzzle
  'ball': 'Ball',               // 暂时没看到，保持原样
  'running': 'Running',         // 暂时没看到，保持原样
  'connect': 'Connect'          // 数据库中是 Connect
}

// 验证分类是否有效（如果有分类参数的话）
const isValidCategory = computed(() => {
  return !categoryName.value || Object.keys(categoryDisplayMap).includes(categoryName.value as string)
})

// 如果分类无效，重定向到游戏首页
if (!isValidCategory.value && process.client) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Category not found'
  })
}

// 获取分类显示名称
const getCategoryDisplayName = (categoryKey: any) => {
  return categoryDisplayMap[categoryKey as string] || categoryKey
}

// 获取数据库分类值
const getCategoryDbValue = (categoryKey: any) => {
  return categoryDbMap[categoryKey as string] || categoryKey
}

// 用于传递给GameGrid的分类值
const dbCategoryName = computed(() => {
  if (!categoryName.value) return null
  return getCategoryDbValue(categoryName.value as any)
})

// 动态 SEO 配置
const seoTitle = computed(() => {
  if (categoryName.value) {
    const categoryDisplayName = getCategoryDisplayName(categoryName.value as any)
    return `${categoryDisplayName} Games - Play Online ${categoryDisplayName} Games`
  }
  return 'Free Games Collection - Play Online Games'
})

const seoDescription = computed(() => {
  if (categoryName.value) {
    const categoryDisplayName = getCategoryDisplayName(categoryName.value as any).toLowerCase()
    return `Play the best ${categoryDisplayName} games online for free. ${categoryDisplayName} games that work on mobile, tablet and desktop. No downloads required!`
  }
  return 'Play the best HTML5 games directly in your browser. No downloads required. Compatible with mobile, tablet and desktop devices.'
})

const seoKeywords = computed(() => {
  if (categoryName.value) {
    const categoryDisplayName = getCategoryDisplayName(categoryName.value as any).toLowerCase()
    return `${categoryDisplayName} games, online ${categoryDisplayName}, free ${categoryDisplayName} games, ${categoryDisplayName} browser games, html5 games, mobile games`
  }
  return 'html5 games, online games, browser games, mobile games, free games, web games'
})

// 动态 SEO 配置
useHead({
  title: seoTitle,
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'description', content: seoDescription },
    { name: 'keywords', content: seoKeywords },
    { property: 'og:title', content: seoTitle },
    { property: 'og:description', content: seoDescription },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: seoTitle },
    { name: 'twitter:description', content: seoDescription }
  ],
  link: [
    {
      rel: 'canonical',
      href: () => {
        const baseUrl = 'https://blrssco.com'
        return categoryName.value ? `${baseUrl}/category/${categoryName.value}` : `${baseUrl}/category`
      }
    }
  ]
})

definePageMeta({
  key: route => route.fullPath
})
</script>

<style scoped>
/* 广告容器样式 */
.ad-container {
  width: 100%;
  margin: 20px 0;
  padding: 10px;
  text-align: center;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 横向滚动容器 */
.horizontal-scroll-container {
  position: relative;
  width: 100%;
}

/* 横向滚动箭头样式 */
.horizontal-scroll-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, rgba(60, 168, 193, 0.9) 0%, rgba(45, 138, 158, 0.9) 100%);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(60, 168, 193, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  z-index: 10;
}

.horizontal-scroll-arrow:hover {
  background: linear-gradient(135deg, rgba(60, 168, 193, 1) 0%, rgba(45, 138, 158, 1) 100%);
  box-shadow: 0 6px 20px rgba(60, 168, 193, 0.4);
  transform: translateY(-50%) scale(1.1);
}

.horizontal-scroll-arrow:active {
  transform: translateY(-50%) scale(0.95);
}

.horizontal-scroll-arrow svg {
  width: 20px;
  height: 20px;
}

.horizontal-scroll-arrow-left {
  left: -10px;
}

.horizontal-scroll-arrow-right {
  right: -10px;
}

/* 分类组件一行排列样式 */
.category-horizontal-wrapper {
  overflow-x: auto;
  overflow-y: hidden;
  padding: 10px 0;
  /* 隐藏滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 和 Edge */
  /* 确保内容从左边开始显示 */
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

/* 隐藏 Webkit 滚动条 */
.category-horizontal-wrapper::-webkit-scrollbar {
  display: none;
}

/* 重写分类组件样式为横向布局 */
.category-horizontal-wrapper :deep(.game-category-container) {
  padding: 0;
  width: 100%;
}

/* 隐藏组件内部的箭头，使用外层控制 */
.category-horizontal-wrapper :deep(.scroll-arrow) {
  display: none;
}

.category-horizontal-wrapper :deep(.category-grid) {
  display: flex;
  flex-wrap: nowrap;
  gap: 12px;
  max-width: none;
  margin: 0;
  padding: 0 20px;
  /* 确保第一个元素从左边开始 */
  justify-content: flex-start;
  align-items: stretch;
}

.category-horizontal-wrapper :deep(.category-item) {
  min-width: 150px;
  flex-shrink: 0;
  padding: 8px 12px;
  gap: 10px;
  scroll-snap-align: start;
}

.category-horizontal-wrapper :deep(.category-icon) {
  width: 45px;
  height: 45px;
}

.category-horizontal-wrapper :deep(.category-icon img) {
  width: 32px;
  height: 32px;
}

.category-horizontal-wrapper :deep(.category-name) {
  font-size: 15px;
  font-weight: 600;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .category-horizontal-wrapper :deep(.category-grid) {
    padding: 0 15px;
    gap: 8px;
  }

  .category-horizontal-wrapper :deep(.category-item) {
    min-width: 130px;
    padding: 6px 10px;
    gap: 8px;
  }

  .category-horizontal-wrapper :deep(.category-icon) {
    width: 35px;
    height: 35px;
  }

  .category-horizontal-wrapper :deep(.category-icon img) {
    width: 25px;
    height: 25px;
  }

  .category-horizontal-wrapper :deep(.category-name) {
    font-size: 13px;
  }

  /* 移动端箭头调整 */
  .horizontal-scroll-arrow {
    width: 35px;
    height: 35px;
  }

  .horizontal-scroll-arrow svg {
    width: 18px;
    height: 18px;
  }

  .horizontal-scroll-arrow-left {
    left: -5px;
  }

  .horizontal-scroll-arrow-right {
    right: -5px;
  }


}

/* 平板适配 */
@media (min-width: 769px) and (max-width: 1024px) {
  .category-horizontal-wrapper :deep(.category-item) {
    min-width: 140px;
  }

  .category-horizontal-wrapper :deep(.category-name) {
    font-size: 14px;
  }
}
</style> 