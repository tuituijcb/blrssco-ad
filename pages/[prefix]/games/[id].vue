<template>
            <div>
    <!-- 加载状态 -->
    <div v-if="pending" class="loading-container">
      <img src="public/loading2.gif" alt="Loading..." class="loading-img" />
      <p>Loading game...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <h3>Game Not Found</h3>
      <p>The game you're looking for doesn't exist or has been removed.</p>
      <a href="/" class="back-btn">Back to Home</a>
    </div>



    <!-- 游戏内容 -->
    <div v-else-if="gameData" class="content">
      <div class="details">
        <!-- 四栏布局：左广告 + 相关游戏 + 主游戏区 + 右广告 -->
        <div class="play_game">
          <!-- 左侧广告位 game-pc1 -->
          <div class="left_game">
            <AdSense ad-slot="8950679013" ad-format="fixed" style="width:160px;height:600px;display:block" />
          </div>

          <!-- 相关游戏区域 -->
          <div class="related_games" style="width:66%;max-width:100px;margin:0 auto;">
            <RelatedGames 
              v-if="gameData && gameData.category && gameData.app_name"
              :category="gameData.category"
              :currentAppName="gameData.app_name"
              :limit="12"
            />
          </div>

          <!-- 主游戏区域 -->
          <div class="play">
            <div class="game-iframe-container" :class="{ 'portrait': showPortrait }">
              <iframe 
                v-if="gameUrl"
                :src="gameUrl" 
                width="100%" 
                height="100%" 
                :title="gameData.app_name"
                allowfullscreen
                loading="lazy"
                @load="adjustIframeScale"
                @error="handleIframeError">
              </iframe>
              <div v-else class="no-game">
                <p>Game link not available</p>
              </div>
              <!-- 横竖屏切换按钮（仅图标，无文字） -->
              <button @click="toggleOrientation" class="orientation-btn" :aria-label="showPortrait ? 'Switch to landscape' : 'Switch to portrait'">
                <span v-if="showPortrait">
                  <!-- 横屏图标 -->
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="7" width="20" height="10" rx="2"/>
                    <circle cx="5" cy="12" r="1" fill="currentColor"/>
                  </svg>
                </span>
                <span v-else>
                  <!-- 竖屏图标 -->
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="7" y="2" width="10" height="20" rx="2"/>
                    <circle cx="12" cy="19" r="1" fill="currentColor"/>
                  </svg>
                </span>
              </button>
            </div>
            
            <!-- 底部横向广告单元 PC: game-pc2, Mobile: game-m-1 -->
            <div class="bottom-ad-unit">
              <!-- PC端广告 -->
              <div class="desktop-only">
                <AdSense ad-slot="3716416555" ad-format="rectangle" style="width:728px;height:188px;display:block" />
              </div>
              <!-- 移动端广告 -->
              <div class="mobile-only">
                <AdSense ad-slot="7913051558" ad-format="auto" style="display:block" />
              </div>
            </div>
          </div>

          <!-- 右侧广告位 game-pc3 -->
          <div class="right_game">
            <AdSense ad-slot="6387614251" ad-format="fixed" style="width:160px;height:600px;display:block" />
          </div>
        </div>
        
        <!-- 游戏分类组件 - 桌面端显示 -->
        <div class="category-section desktop-category">
          <div class="container mx-auto px-4">
            <GameCategory />
          </div>
        </div>
        
        <!-- 底部区域 -->
        <div class="bottom_game">
          <!-- PC端：所有游戏（无限滚动），移动端：更多H5游戏（固定12个） -->
          <div class="more-games-section">
            <!-- PC端：无限滚动所有游戏 -->
            <div class="desktop-games">
              <GameGrid 
                app-type="h5" 
                mode="infinite"
              />
            </div>
            
            <!-- 移动端：固定12个游戏 -->
            <div class="mobile-games">
              <GameGrid 
                app-type="h5" 
                mode="fixed"
                :limit="12"
              />
            </div>

            <!-- 移动端16:9广告位 game-m-2 -->
            <div class="mobile-bottom-ad">
              <AdSense ad-slot="4877037441" ad-format="auto" style="display:block" />
            </div>
          </div>
          
          <!-- 游戏分类组件 - 移动端显示在最底部 -->
          <div class="category-section mobile-category">
            <div class="container mx-auto px-4">
              <GameCategory />
            </div>
          </div>
        </div>
        


        <div class="backToTop">
          <img src="data:image/webp;base64,UklGRsgAAABXRUJQVlA4TLwAAAAvO0AMEEdAkG1Tf5i7nWAaBNk29Ye52wlGkG1Tf5i7nWAG2UYqwqEc2qk/wQf8/0plGxyKYHAbSZLbvAcf9QlgHhEgAw0EgGIGymQQLAaufyjdiP4rcNtGSXdixj+E8zhkaz2E48UJKzaD0nZxnEbHOvx01TxUa/nC5jsHKKJsHcDuRGd85dXllarL9ysoQfi3Xr6fmmwvAg0koM1tJd0kgD11nd2Ff0kEaD86+SfIvqL2Bbavt3355a8RAA==" alt="">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import RelatedGames from '~/components/RelatedGames.vue'
import AdSense from '@/components/AdSense/AdSense.vue'
import { usePrefixLink } from '@/composables/usePrefixLink'
import portraitGames from '@/data/portraitGames.json'

usePrefixLink()

// 从 Supabase 获取游戏数据
const { getGameByName } = useSupabase()

// 获取路由参数
const route = useRoute()
const appName = route.params.id

// 只允许三位数字的 prefix
const prefix = Array.isArray(route.params.prefix) ? route.params.prefix[0] : route.params.prefix
if (!/^\d{3}$/.test(prefix)) {
  if (process.client) {
    window.location.href = `/games/${route.params.id}`
  }
}

// 从 Supabase 查询游戏数据
const { data: gameData, pending, error } = await useLazyAsyncData(
  `game-${appName}`,
  async () => {
    try {
      const result = await getGameByName(appName)
      return result
    } catch (err) {
      throw err
    }
  },
  {
    server: false // 客户端渲染以支持动态路由
  }
)

// 处理游戏 URL - 确保是完整的 https URL
const gameUrl = computed(() => {
  if (!gameData.value?.Google_link) {
    return null
  }
  
  const link = gameData.value.Google_link
  
  // 如果已经是完整的 URL，直接返回
  if (link.startsWith('http://') || link.startsWith('https://')) {
    return link
  }
  
  // 如果是相对路径，添加 https://
  const fullUrl = link.startsWith('games.blrssco.com') 
    ? `https://${link}` 
    : `https://games.blrssco.com/${link}`
  
  return fullUrl
})

const userOrientation = ref<string|null>(null) // 用户手动切换的方向

const isPortraitGame = computed(() => {
  // 1. 优先接口字段
  if (gameData.value?.orientation) {
    return gameData.value.orientation === 'portrait'
  }
  // 2. 配置兜底
  return portraitGames.includes(gameData.value?.app_name)
})

// 3. 最终显示方向：用户优先，否则自动
const showPortrait = computed(() => {
  if (userOrientation.value) return userOrientation.value === 'portrait'
  return isPortraitGame.value
})

function toggleOrientation() {
  userOrientation.value = showPortrait.value ? 'landscape' : 'portrait'
}

// 处理 iframe 错误
const handleIframeError = () => {
  console.warn('Game iframe failed to load')
}

// 确保iframe完全适应容器
const adjustIframeScale = () => {
  const iframe = document.querySelector('.game-iframe-container iframe') as HTMLElement | null
  const container = document.querySelector('.game-iframe-container') as HTMLElement | null
  
  if (!iframe || !container) return
  // 确保iframe完全填满容器
  iframe.style.width = '100%'
  iframe.style.height = '100%'
  iframe.style.objectFit = 'cover'
}



// SEO 配置
watchEffect(() => {
  if (gameData.value) {
    useHead({
      title: `${gameData.value.app_name} - Play Online Game`,
      meta: [
        { name: 'robots', content: 'noindex, nofollow' },
        { name: 'description', content: gameData.value.summary || `Play ${gameData.value.app_name} online game for free. Compatible with mobile, tablet and desktop devices.` },
        { name: 'keywords', content: `${gameData.value.app_name}, online game, mobile game, ${gameData.value.category || 'games'}` },
        { property: 'og:title', content: `${gameData.value.app_name} - Play Online Game` },
        { property: 'og:description', content: gameData.value.summary || `Play ${gameData.value.app_name} online for free` },
        { property: 'og:type', content: 'game' },
        { property: 'og:image', content: gameData.value.icon_url },
        { name: 'twitter:card', content: 'summary_large_image' }
      ],
      link: [
        { rel: 'canonical', href: `https://blrssco.com/games/${appName}` }
      ]
    })
  }
})

// 组件挂载后处理
onMounted(() => {
  // 延迟调整iframe缩放（确保iframe已加载）
  setTimeout(() => {
    adjustIframeScale()
  }, 1000)
  
  // 监听窗口大小变化
  window.addEventListener('resize', adjustIframeScale)
})

onUnmounted(() => {
  window.removeEventListener('resize', adjustIframeScale)
})

// 定义页面模式
definePageMeta({
  mode: 'spa' // 单页应用模式以支持动态路由
})

// 回到顶部方法
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>


/* 加载状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #003c47;
  color: white;
}

.loading-img {
  width: 48px;
  height: 48px;
  display: block;
  margin: 0 auto 12px auto;
}

/* 错误状态样式 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #003c47;
  color: white;
  text-align: center;
  padding: 20px;
}

.back-btn {
  background: #3ca8c1;
  color: white;
  padding: 12px 24px;
  border-radius: 6px;
  text-decoration: none;
  margin-top: 20px;
  transition: background-color 0.3s;
}

.back-btn:hover {
  background: #2d8a9e;
}

/* 主内容区域 */
.content {
  margin-top: 0px;
  height: auto !important;
}

.details {
  height: auto !important;
}

/* 四栏布局 */
.play_game {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 15px;
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

/* 左侧广告位 */
.left_game {
  width: 180px;
  height: 620px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  background: #e3f2fd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

/* 广告占位符 */
.ad-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.ad-placeholder::before {
  content: "Ad Space";
}

/* 广告标签 */
.ad-label {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 1px;
}

/* 相关游戏区域 */
.related_games {
  width: calc(100vh * 4 / 15);
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.related-games-header {
  padding: 15px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  background: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  text-align: center;
}

.related-games-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px;
  flex: 1;
  counter-reset: game-counter;
}

.game-placeholder {
  width: 100%;
  height: 80px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 10px;
  gap: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  counter-increment: game-counter;
}

.game-placeholder:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.game-icon-placeholder {
  width: 60px;
  height: 60px;
  background: linear-gradient(45deg, #ddd, #bbb);
  border-radius: 8px;
  flex-shrink: 0;
}

.game-title-placeholder {
  color: #333;
  font-size: 14px;
  font-weight: 500;
  flex: 1;
}

.game-title-placeholder::before {
  content: "Game Title " counter(game-counter);
}

/* 主游戏区域 */
.play {
  width: 80vw;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 15px;
}

.game-iframe-container {
  aspect-ratio: 16 / 9;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
}
.game-iframe-container.portrait {
  aspect-ratio: 9 / 16;
  max-width: 400px;
  min-height: 500px;
}

.game-iframe-container iframe {
  /* 严格限制iframe尺寸，不能超过容器 */
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  
  /* 强制iframe内容适应容器尺寸 */
  object-fit: cover;
  
  /* 防止iframe内容溢出 */
  overflow: hidden;
  
  /* 确保iframe不会改变容器大小 */
  position: absolute;
  top: 0;
  left: 0;
}
  
  /* 移动端iframe特殊处理 */
  @media (max-width: 768px) {
    .game-iframe-container iframe {
      /* 移动端保持完整尺寸 */
      object-fit: cover;
    }
  }
  
  /* 小屏幕桌面端 */
  @media (min-width: 769px) and (max-width: 1024px) {
    .game-iframe-container iframe {
      object-fit: cover;
    }
  }

.no-game {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: white;
  font-size: 18px;
  background: #003c47;
}

/* 右侧广告位 */
.right_game {
  width: 180px;
  height: 620px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  background: #e3f2fd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

/* 底部区域 */
.bottom_game {
  margin-top: 1px;
  padding: 0 20px;
}

/* 游戏分类区域 */
.bottom_list {
  text-align: center;
  margin-bottom: 40px;
}

.title {
  color: white;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.game_type {
  min-height: 100px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 20px;
}

/* 更多游戏区域 */
.more-games-section {
  margin-bottom: 40px;
  padding: 0 20px;
}

/* PC端显示无限滚动，隐藏移动端固定模式 */
.desktop-games {
  display: block;
}

.mobile-games {
  display: none;
}



/* 固定位置按钮 */
.backtogame {
  position: fixed;
  bottom: 10px;
  left: 50%;
  right: auto;
  transform: translateX(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3ca8c1 0%, #2d8a9e 100%);
  box-shadow: 0 4px 12px rgba(60,168,193,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.backtogame img {
  width: 32px;
  height: 32px;
  margin: 0;
  display: block;
}

.backtogame:hover {
  opacity: 0.8;
}

.debug-toggle {
  position: fixed;
  bottom: 120px;
  left: 30px;
  width: 50px;
  height: 50px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  transition: all 0.3s;
  border: 2px solid #3ca8c1;
}

.debug-toggle:hover {
  background: rgba(60, 168, 193, 0.8);
  transform: scale(1.1);
}

.backToTop {
  position: fixed;
  bottom: 60px;
  right: 30px;
  cursor: pointer;
  z-index: 1000;
  transition: opacity 0.3s;
}

.backToTop:hover {
  opacity: 0.8;
}



/* 底部横向广告单元 */
.bottom-ad-unit {
  width: 748px;
  height: 208px;
  position: relative;
  background: #e3f2fd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.bottom-ad-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.bottom-ad-placeholder::before {
  content: "728 × 188 Ad Space";
}

.bottom-ad-label {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 1px;
}

/* 游戏分类区域样式 */
.category-section {
  margin: 10px 0;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  padding: 2px 0;
}

.category-section .container {
  max-width: 1200px;
}

/* 桌面端显示桌面分类，隐藏移动分类 */
.desktop-category {
  display: block;
}

.mobile-category {
  display: none;
}

/* PC和移动端广告显示控制 */
.desktop-only {
  display: block;
}

.mobile-only {
  display: none;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .content {
    padding: 0;
    margin: 0;
  }

  .details {
    padding: 0;
    margin: 0;
  }

  .play_game {
    flex-direction: column;
    gap: 1px;
    padding: 5px;
    min-height: auto; /* 移除最小高度限制 */
    justify-content: flex-start;
    margin: 0;
  }

  /* 隐藏左右广告位和相关游戏区域 */
  .left_game,
  .right_game,
  .related_games {
    display: none;
  }

  .play {
    width: 100%;
    order: 1;
    gap: 5px;
    margin: 0;
    padding: 0;
  }

  .game-iframe-container {
    aspect-ratio: 16 / 9;
    width: 100%;
    max-width: 100%;
    margin: 0;
  }

      .bottom-ad-unit {
      width: calc(100vw - 10px); /* 减去左右边距 */
      aspect-ratio: 16 / 9;
      height: auto; /* 让高度由aspect-ratio控制 */
      margin: 0 10px; /* 添加左右边距 */
      border-radius: 8px; /* 保持圆角 */
      position: relative;
      left: 50%;
      transform: translateX(-50%); /* 居中显示 */
    }

    .bottom-ad-placeholder {
      font-size: 16px;
    }

    .bottom-ad-placeholder::before {
      content: "Mobile Ad 16:9";
    }

  /* 移动端样式调整 */
  .bottom_game {
    margin-top: 1px;
    padding: 0;
  }
  
  .more-games-section {
    padding: 0 10px;
    margin-bottom: 1px;
  }
  
  /* 移动端显示固定模式，隐藏PC端无限滚动 */
  .desktop-games {
    display: none;
  }
  
  .mobile-games {
    display: block;
  }



  /* 移动端分类区域样式调整 */
  .category-section {
    margin: 8px 0;
    padding: 6px 0;
    background: rgba(255, 255, 255, 0.08);
  }
  
  /* 移动端隐藏桌面分类，显示移动分类 */
  .desktop-category {
    display: none;
  }
  
  .mobile-category {
    display: block;
    margin: 4px 0 0 0;
    padding: 4px 0;
  }

  /* 移动端广告显示控制 */
  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: block;
    width: 95%;
    max-width: 95vw;
    min-height: calc(95vw * 9 / 16);
    margin: 12px auto;
    background: #e3f2fd;
    border-radius: 8px;
    overflow: hidden;
  }

  /* 移动端按钮位置调整 */
  .backtogame {
    bottom: 60px;
    right: 10px;
    width: 40px;
    height: 40px;
  }

  .backToTop {
    bottom: 10px;
    right: 10px;
    width: 40px;
    height: 40px;
  }
}

/* 平板横屏适配 */
@media (min-width: 769px) and (max-width: 1366px) {
  .play_game {
    gap: 10px;
    padding: 15px;
  }

  /* 隐藏右侧广告位和相关游戏区域 */
  .right_game,
  .related_games {
    display: none;
  }

  .left_game {
    width: calc(100vh * 4 / 15);
    height: 100vh;
  }

  .play {
    width: calc(100% - 100vh * 4 / 15 - 20px);
  }

  .game-iframe-container {
    aspect-ratio: 16 / 9;
  }

  .bottom-ad-unit {
    width: calc(100% - 10px); /* 减去左右边距 */
    max-width: 728px;
    margin: 0 10px; /* 添加左右边距 */
  }

  /* 平板端更多游戏区域样式 */
  .more-games-section {
    padding: 0 15px;
    margin-bottom: 30px;
  }


}

/* 移动端广告样式 */
.mobile-bottom-ad {
  display: block;
  width: 95%;
  max-width: 95vw;
  min-height: calc(95vw * 9 / 16);
  margin: 12px auto;
  padding: 0;
  background: #e3f2fd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  position: relative;
  overflow: hidden;
}
.mobile-bottom-ad .bottom-ad-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  background: transparent;
}
.mobile-bottom-ad .bottom-ad-placeholder::before {
  content: "Mobile Ad 16:9";
}
/* 只在移动端显示 */
@media (min-width: 769px) {
  .mobile-bottom-ad { display: none; }
}

/* 移动端底部backtogame按钮样式 */
.mobile-backtogame {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 16px 0 8px 0;
  width: 100%;
}
.mobile-backtogame img {
  display: block;
}
@media (min-width: 769px) {
  .mobile-backtogame { display: none; }
}

.orientation-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  background: #3ca8c1;
  color: #fff;
  border: none;
  border-radius: 50%;
  padding: 7px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  transition: background 0.2s, color 0.2s;
}
.orientation-btn:hover {
  background: #2d8a9e;
  color: #ffe082;
}
</style> 