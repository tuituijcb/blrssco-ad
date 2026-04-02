<template>
  <div class="game-index-page">
    <!-- 热门游戏组件 -->
    <div class="top-games-section">
      <TopGames
        :mobile-count="30"
        :pc-count="97"
        app-type="h5"
      />
    </div>

    <!-- AdSense 广告位 home1 -->
    <div class="ad-container">
      <AdSense ad-slot="1974207126" />
    </div>

    <!-- 更多游戏 -->
    <div class="more-games-section">
      <GameGrid
        mode="infinite"
        :limit="21"
        app-type="h5"
      />
    </div>

    <!-- AdSense 广告位 home2 -->
    <div class="ad-container home2-ad">
      <AdSense ad-slot="9675257926" />
    </div>


  </div>
</template>

<script setup lang="ts">
// 导入组件
import TopGames from '@/components/TopGames.vue'
import GameGrid from '@/components/GameGrid.vue'
import AdSense from '@/components/AdSense/AdSense.vue'

// 路由前缀处理
const route = useRoute()
const prefix = route.params.prefix

// 验证前缀格式
if (!/^\d{3}$/.test(prefix)) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found'
  })
}

// 使用前缀链接处理
usePrefixLink()

// 页面元数据
useHead({
  title: 'Top Games - Best H5 Games Collection',
  meta: [
    { name: 'description', content: 'Discover the most popular H5 games. Play instantly in your browser without downloads.' },
    { name: 'keywords', content: 'top games, popular games, h5 games, browser games, online games' },
    { name: 'robots', content: 'noindex, nofollow' } // 不索引带前缀的页面
  ],
  link: [
    { rel: 'canonical', href: 'https://blrssco.com/' } // canonical指向无prefix版本
  ]
})

// TopGames 组件现在会自动从 /data/topGames.json 加载前17个热门游戏


</script>

<style scoped>
/* 广告容器样式 */
.ad-container {
  width: 100%;
  margin: 20px 0;
  padding: 10px;
  text-align: center;
}

/* home2广告特殊样式 */
.home2-ad {
  min-height: 90px;
  display: block;
  clear: both;
}

.game-index-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* 页面头部 */
.page-header {
  text-align: center;
  padding: 60px 20px 40px;
  background: rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0 0 16px 0;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.page-subtitle {
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.9;
  font-weight: 300;
}

/* 热门游戏区域 */
.top-games-section {
  margin: 0;
}

/* 更多游戏区域 */
.more-games-section {
  padding: 20px 0;
}

/* 最新游戏区域 */
.latest-games-section {
  padding: 60px 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    padding: 40px 20px 30px;
  }

  .page-title {
    font-size: 2.5rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .category-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .category-card {
    padding: 24px 20px;
  }

  .category-icon {
    font-size: 2.5rem;
  }

  .category-name {
    font-size: 1.3rem;
  }

  .other-categories,
  .latest-games-section {
    padding: 40px 20px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 2rem;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .category-card {
    padding: 20px 16px;
  }
}
</style> 