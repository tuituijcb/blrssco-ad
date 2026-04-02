<script setup lang="ts">
import { useRoute } from 'vue-router'
import { usePrefixLink } from '@/composables/usePrefixLink'
const route = useRoute()
const prefix = Array.isArray(route.params.prefix) ? route.params.prefix[0] : route.params.prefix
if (!/^\d{3}$/.test(prefix)) {
  if (process.client) {
    window.location.href = `/detail/${route.params.id}`
  }
}

// 统一用 useSupabase composable
import { useSupabase } from '@/composables/useSupabase.js'
import GameHeroSection from '@/components/gameinfo/GameHeroSection.vue'
import GameDetail from '@/components/gameinfo/GameDetail.vue'
import ArticleSections from '@/components/gameinfo/ArticleSections.vue'
import VerticalGameCategory from '@/components/VerticalGameCategory.vue'
import GameGrid from '@/components/GameGrid.vue'
import AdSense from '@/components/AdSense/AdSense.vue'

// 获取路由参数
const rawId = Array.isArray(route.params.id) ? route.params.id[0] : String(route.params.id)
const appName = decodeURIComponent(rawId)

const { getGameByName } = useSupabase()

// 加载主数据
const { data: app, pending, error } = await useLazyAsyncData(
  `detail-app-${appName}`,
  async () => {
    const result = await getGameByName(appName)
    return result
  }
)

// 自动补全 icon_url 为 https:// 开头的完整 URL
function getFullIconUrl(url: string | undefined) {
  if (!url) return '/default-icon.png'
  if (url.startsWith('http')) return url
  return 'https://' + url
}

const redirectToPrefixApp = () => {
  if (!process.client) return
  const target = `/${prefix}/app/${encodeURIComponent(appName)}`
  if (window.location.pathname !== target) {
    window.location.replace(target)
  }
}

watchEffect(() => {
  if (!app.value) return
  const appType = String(app.value.app_type || '').toLowerCase()
  if (appType !== 'h5') {
    redirectToPrefixApp()
  }
})

// SEO 元数据
watchEffect(() => {
  if (app.value) {
    const title = `${app.value.app_name} - Game Details | H5GamesHub`
    const description = app.value.summary || `Play ${app.value.app_name} online. Discover features, screenshots, and reviews.`
    const keywords = `${app.value.app_name}, online game, mobile game, ${app.value.category || 'games'}`
    const canonical = `https://blrssco.com/detail/${app.value.app_name}`
    useHead({
      title,
      meta: [
        { name: 'robots', content: 'noindex, nofollow' },
        { name: 'description', content: description },
        { name: 'keywords', content: keywords },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'game' },
        { property: 'og:image', content: getFullIconUrl(app.value.icon_url) },
        { name: 'twitter:card', content: 'summary_large_image' },
        { property: 'og:url', content: canonical },
      ],
      link: [
        { rel: 'canonical', href: canonical }
      ]
    })
  }
})

usePrefixLink()
</script>

<template>
  <div class="app-detail-page">
    <div class="page-container">
      <main class="main-content">
        <article>
          <template v-if="pending">
            <div class="loading-container">
              <img src="/loading2.gif" alt="Loading..." class="loading-img" />
              <p>Loading details...</p>
            </div>
          </template>
          <template v-else-if="error || !app">
            <div class="error-container">
              <h3>App Not Found</h3>
              <p>The app you're looking for doesn't exist or has been removed.</p>
              <div class="back-button-container">
                <a href="/" class="back-btn">Back to Home</a>
              </div>
            </div>
          </template>
          <template v-else>
            <header>
              <GameHeroSection :app="{
                id: app.id,
                package_name: app.package_name,
                icon_url: getFullIconUrl(app.icon_url),
                name: app.app_name,
                rating: app.rating,
                developer: app.developer
              }" />
            </header>
            
            <!-- AdSense 广告位 detail1 -->
            <div class="ad-container">
              <AdSense ad-slot="9221321842" />
            </div>
            
            <section>
              <GameDetail
                :version="app.version"
                :updated="app.updated"
                :developer="app.developer"
                :category="app.category"
                :package_name="app.package_name"
                :installs="app.installs"
                :developer_email="app.developer_email"
                :privacy_policy="app.privacy_policy"
              />
            </section>
            
            <!-- AdSense 广告位 detail2 -->
            <div class="ad-container">
              <AdSense ad-slot="5062121967" />
            </div>
            
            <!-- Play For Free Now 按钮 -->
            <div class="play-now-section">
              <a :href="`/games/${app.app_name}`" class="play-now-button">
                <span class="play-icon">🎮</span>
                <span class="button-text">PLAY For Free NOW</span>
                <span class="arrow">→</span>
              </a>
            </div>
            
            <section>
              <ArticleSections 
                :package-name="app.package_name || app.app_name" 
                :app-name="app.app_name" 
                :app-type="app.app_type"
              />
            </section>
          </template>
        </article>
      </main>
      <aside class="desktop-sidebar">
        <!-- AdSense 侧边栏顶部广告位 -->
        <div class="sidebar-ad-container">
          <AdSense ad-slot="3073675229" ad-format="auto" />
        </div>
        <VerticalGameCategory />
        <div class="sidebar-divider"></div>
        <div class="sidebar-games">
          <GameGrid 
            :mode="'fixed'" 
            :max-count="28" 
            :limit="28"
            app-type="h5"
            class="sidebar-grid"
          />
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
/* 广告容器样式 */
.ad-container {
  width: 100%;
  margin: 10px 0;
  padding: 5px;
  text-align: center;
}

/* 侧边栏广告容器样式 */
.sidebar-ad-container {
  width: 100%;
  margin-bottom: 10px;
  padding: 5px;
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.app-detail-page {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%);
  min-height: 100vh;
  color: #1a1a1a;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  display: flex;
  min-height: 100vh;
  box-sizing: border-box;
  gap: 2rem;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.desktop-sidebar {
  width: 280px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.sidebar-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  margin: 8px 0;
}

.sidebar-games {
  padding: 0 16px 16px 16px;
}

/* 控制侧边栏中 VerticalGameCategory 组件的间距 */
.desktop-sidebar :deep(.vertical-category) {
  margin-bottom: 0;
  padding-bottom: 8px;
}

.desktop-sidebar :deep(.vertical-category:last-child) {
  margin-bottom: 0;
}

.sidebar-title {
  color: #1e293b;
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 16px 0;
  text-align: center;
  letter-spacing: 0.025em;
}

html.dark-mode .sidebar-title {
  color: #e2e8f0;
}

html.dark-mode .desktop-sidebar {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 侧边栏游戏网格特殊样式 */
.sidebar-games :deep(.game-grid) {
  grid-template-columns: repeat(2, 1fr) !important;
  gap: 8px !important;
  padding: 0 !important;
}

.sidebar-games :deep(.game-item) {
  width: 100%;
}

.sidebar-games :deep(.game-icon) {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
}

.sidebar-games :deep(.game-title) {
  font-size: 10px !important;
  padding: 4px 6px !important;
  line-height: 1.2 !important;
}

.sidebar-games :deep(.game-overlay) {
  border-radius: 8px;
}

@media (max-width: 768px) {
  .desktop-sidebar {
    display: none;
  }
  .page-container {
    padding: 1rem;
  }

  /* 移动端按钮样式调整 */
  .play-now-button {
    min-width: 240px;
    padding: 16px 28px;
    font-size: 1.1rem;
    gap: 10px;
  }

  .play-now-button .play-icon,
  .play-now-button .arrow {
    font-size: 1.3rem;
  }
}

@media (max-width: 480px) {
  .play-now-button {
    min-width: 200px;
    padding: 14px 24px;
    font-size: 1rem;
    gap: 8px;
  }

  .play-now-button .play-icon,
  .play-now-button .arrow {
    font-size: 1.2rem;
  }
}

html.dark-mode .app-detail-page {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%);
  color: #e2e8f0;
}

/* Play For Free Now 按钮样式 */
.play-now-section {
  margin: 40px 0;
  text-align: center;
  padding: 20px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.play-now-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: #fff;
  text-decoration: none;
  border-radius: 50px;
  padding: 18px 36px;
  font-size: 1.25rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
  border: 3px solid transparent;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  min-width: 280px;
  white-space: nowrap;
}

.play-now-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.6s;
}

.play-now-button:hover::before {
  left: 100%;
}

.play-now-button:hover {
  background: linear-gradient(135deg, #ee5a24 0%, #d63031 100%);
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 15px 35px rgba(255, 107, 107, 0.4);
  border-color: rgba(255, 255, 255, 0.2);
}

.play-now-button:active {
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
}

.play-now-button .play-icon {
  font-size: 1.5rem;
  transition: transform 0.3s;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.play-now-button .button-text {
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.play-now-button .arrow {
  font-size: 1.5rem;
  transition: transform 0.3s;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.play-now-button:hover .arrow {
  transform: translateX(6px) scale(1.1);
}

.play-now-button:hover .play-icon {
  transform: scale(1.1) rotate(5deg);
}

/* 加载和错误状态样式 */
.loading-container,
.error-container {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  margin: 20px 0;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.loading-img {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
}

.error-container h3 {
  color: #1e293b;
  margin-bottom: 12px;
}

.error-container p {
  color: #64748b;
  margin-bottom: 20px;
}

/* 返回按钮样式 */
.back-button-container {
  margin-bottom: 20px;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #1e293b;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  color: #0f172a;
}

/* 游戏信息样式 */
.game-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.game-icon {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
}

.game-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.game-details {
  flex: 1;
}

.game-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.game-category {
  font-size: 1.2rem;
  font-weight: 500;
  color: #64748b;
}

.game-developer {
  font-size: 1.2rem;
  font-weight: 500;
  color: #64748b;
}

.game-stats {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.rating {
  font-size: 1.2rem;
  font-weight: 700;
}

.installs {
  font-size: 1.2rem;
  font-weight: 500;
  color: #64748b;
}


</style> 