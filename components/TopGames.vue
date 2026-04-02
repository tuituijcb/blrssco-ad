<template>
  <div class="top-games-container">
    <!-- 始终显示游戏网格 -->
    <div class="top-games-wrapper">
      <div class="top-games-grid">
        <a
          v-for="(game, index) in displayGames"
          :key="game?.app_name || `placeholder-${index}`"
          :href="game?.app_name ? `${prefixPath}/detail/${game.app_name}` : '#'"
          :class="['game-item', { 'featured-game': index === 0 }]"
          @click="game?.app_name ? null : $event.preventDefault()"
        >
          <div class="game-icon">
            <!-- 如果是占位符，显示 loading2.gif 作为背景 -->
            <div v-if="!game" class="placeholder-loading-gif"></div>
            <!-- 如果有游戏数据，显示图片 -->
            <img
              v-else
              :src="getGameIconSrc(game)"
              :alt="game.app_name"
              @error="handleImageError"
            />
            <div class="game-overlay" v-if="game?.app_name">
              <div class="game-title">
                {{ formatGameName(game.app_name) }}
              </div>
            </div>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { nextTick } from 'vue'

// 定义组件 props
const props = defineProps({
  // 自定义游戏列表配置
  customGames: {
    type: Array,
    default: () => []
    // 格式: [{ app_name: 'fortnite', priority: 1 }, { app_name: 'minecraft', priority: 2 }]
  },
  // 如果没有自定义列表，从数据库获取的分类
  category: {
    type: String,
    default: null
  },
  appType: {
    type: String,
    default: 'h5'
  },
  // 移动端和PC端的固定数量
  mobileCount: {
    type: Number,
    default: 18
  },
  pcCount: {
    type: Number,
    default: 97
  }
})

// 获取 Supabase 实例
const { getGamesByTypeAndCategoryWithOffset, getGameByName } = useSupabase()

// 状态管理
const games = ref([])
const loading = ref(false)

// 状态：用于跟踪是否已经在客户端洗牌
const isShuffled = ref(false)

// 响应式检测
const isMobile = ref(false)

// 计算显示的游戏数量
const displayCount = computed(() => {
  return isMobile.value ? props.mobileCount : props.pcCount
})

// 计算要显示的游戏列表
const displayGames = computed(() => {
  const actualGames = games.value.slice(0, displayCount.value)
  
  // 如果实际游戏数量少于需要显示的数量，用占位符填充
  if (actualGames.length < displayCount.value) {
    const placeholders = Array(displayCount.value - actualGames.length).fill(null)
    return [...actualGames, ...placeholders]
  }
  
  return actualGames
})

const route = useRoute()
const prefix = Array.isArray(route.params.prefix) ? route.params.prefix[0] : route.params.prefix
const prefixPath = (/^\d{3}$/.test(prefix) ? `/${prefix}` : '')

// 加载游戏数据
const loadGames = async () => {
  try {
    loading.value = true

    let gamesList = []

    // 直接使用 topGames.json 中的前17个游戏
    try {
      // 直接导入 JSON 文件
      const topGamesModule = await import('@/data/topGames.json')
      const topGamesList = topGamesModule.default || []
      
      // 取前17个游戏
      const topGamesNames = topGamesList.slice(0, 17)

      // 逐个获取这些游戏的详细数据
      for (const gameName of topGamesNames) {
        try {
          const gameData = await getGameByName(gameName)
          if (gameData) {
            gamesList.push(gameData)
          }
        } catch (err) {
          // 静默处理错误
        }
      }
    } catch (err) {
      // 静默处理错误，回退到其他方法
    }

    // 如果从 topGames.json 加载的游戏不够，再考虑其他来源
    if (gamesList.length < displayCount.value) {
      if (props.customGames && props.customGames.length > 0) {
        // 使用自定义游戏列表作为补充

        // 按优先级排序
        const sortedCustomGames = [...props.customGames].sort((a, b) => (a.priority || 0) - (b.priority || 0))

        // 逐个获取游戏数据，但要过滤掉已经存在的
        const existingAppNames = new Set(gamesList.map(g => g.app_name))
        
        for (const customGame of sortedCustomGames) {
          if (gamesList.length >= displayCount.value) break
          if (existingAppNames.has(customGame.app_name)) continue
          
          try {
            const gameData = await getGameByName(customGame.app_name)
            if (gameData) {
              gamesList.push(gameData)
              existingAppNames.add(customGame.app_name)
            }
          } catch (err) {
            // 静默处理错误
          }
        }
      }

      // 如果还是不够，从数据库补充
      if (gamesList.length < displayCount.value) {
        const additionalCount = displayCount.value - gamesList.length
        
        const additionalGames = await getGamesByTypeAndCategoryWithOffset(
          props.appType,
          props.category,
          additionalCount * 2, // 获取更多以便过滤
          0
        )

        if (additionalGames && additionalGames.length > 0) {
          // 过滤掉已经存在的游戏
          const existingAppNames = new Set(gamesList.map(g => g.app_name))
          const filteredAdditional = additionalGames.filter(g => !existingAppNames.has(g.app_name))

          // 服务端不洗牌，保持原始顺序
          const finalAdditional = filteredAdditional.slice(0, additionalCount)
          gamesList.push(...finalAdditional)
        }
      }
    }

    games.value = gamesList
    isShuffled.value = false // 重置洗牌状态

  } catch (err) {
    console.error('Error loading games:', err)
  } finally {
    loading.value = false
  }
}

// 客户端洗牌函数 - 只洗牌第18个游戏之后的部分
const shuffleGamesOnClient = () => {
  if (process.client && !isShuffled.value && games.value.length > 17) {
    const topGames = games.value.slice(0, 17) // 前17个固定不动
    const additionalGames = games.value.slice(17) // 第18个开始的游戏
    
    if (additionalGames.length > 0) {
      const shuffledAdditional = shuffleArray([...additionalGames])
      
      // 合并：前17个 + 洗牌后的额外游戏
      games.value = [...topGames, ...shuffledAdditional]
      isShuffled.value = true
    }
  }
}

// 洗牌算法
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

// 检测设备类型
const checkDevice = () => {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth <= 768
  }
}

// 处理图片URL，确保正确的格式
const processIconUrl = (iconUrl) => {
  if (!iconUrl) {
    return '/iconloading.gif' // 默认图片
  }

  // 如果已经是完整的 https URL，直接返回
  if (iconUrl.startsWith('https://') || iconUrl.startsWith('http://')) {
    return iconUrl
  }

  // 如果以 games.blrssco.com 开头，添加 https://
  if (iconUrl.startsWith('games.blrssco.com')) {
    const fullUrl = `https://${iconUrl}`
    return fullUrl
  }

  // 如果是其他格式，假设是相对路径，添加完整域名
  const fullUrl = `https://games.blrssco.com/${iconUrl}`
  return fullUrl
}

// 格式化游戏名称：将连字符替换为空格，单词首字母大写
const formatGameName = (appName) => {
  if (!appName) return ''

  return appName
    .replace(/-/g, ' ') // 将连字符替换为空格
    .replace(/\b\w/g, letter => letter.toUpperCase()) // 单词首字母大写
}

// 处理图片加载错误
const handleImageError = (event) => {
  // 使用默认图片替换加载失败的图片
  event.target.src = '/iconloading.gif'
}

// 根据 icon_url 返回合适的图片 src
function getGameIconSrc(game) {
  if (!game.icon_url) {
    return '/iconloading.gif'
  }
  return processIconUrl(game.icon_url)
}

// 预加载 loading2.gif
const preloadLoadingGif = () => {
  if (typeof window !== 'undefined') {
    const img = new Image()
    img.src = '/loading2.gif'
    // 预加载完成后立即释放引用
    img.onload = () => {
      // 图片已缓存，可以立即使用
    }
  }
}

// 初始化
onMounted(() => {
  // 立即预加载loading2.gif
  preloadLoadingGif()
  
  checkDevice()
  loadGames()
  
  // 在客户端挂载后执行洗牌
  shuffleGamesOnClient()

  // 监听窗口大小变化
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', checkDevice)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', checkDevice)
  }
})

// 监听属性变化，重新加载数据
watch([() => props.customGames, () => props.appType, () => props.category], () => {
  loadGames()
  // 属性变化后，在下一个 tick 中重新洗牌
  nextTick(() => {
    shuffleGamesOnClient()
  })
}, { deep: true })
</script>

<style scoped>
.top-games-container {
  width: 100%;
}

/* 占位符加载gif */
.placeholder-loading-gif {
  width: 100%;
  height: 100%;
  background-image: url('/loading2.gif');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 12px;
}


/* 游戏网格 */
.top-games-grid {
  display: grid;
  gap: 15px;
  padding: 20px;
  max-width: 100%;
}

/* PC和Pad端布局 - 10列固定布局 */
@media (min-width: 769px) {
  .top-games-grid {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    grid-auto-rows: minmax(100px, auto);
    gap: 15px;
    padding: 20px;
  }

  .featured-game {
    grid-column: span 2;
    grid-row: span 2;
  }
}

/* 移动端布局 - 3列网格，第一个占据2x2 */
@media (max-width: 768px) {
  .top-games-container {
    width: 100vw;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
  }

  .top-games-grid {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(auto, 1fr);
    gap: 8px;
    padding: 10px;
    width: 100%;
    box-sizing: border-box;
  }

  .featured-game {
    grid-column: span 2;
    grid-row: span 2;
  }
}

/* 游戏项目 */
.game-item {
  position: relative;
  cursor: pointer;
  transition: transform 0.3s ease;
  text-decoration: none;
  color: inherit;
  display: block;
}

.game-item:hover {
  transform: translateY(-5px);
  text-decoration: none;
  color: inherit;
}

/* 游戏图标 */
.game-icon {
  width: 100%;
  aspect-ratio: 1; /* 保证正方形 */
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: box-shadow 0.3s ease;
  position: relative;
}

/* PC端图标大小适应10列布局 */
@media (min-width: 769px) {
  .game-icon {
    width: 100%;
    aspect-ratio: 1;
  }

  .featured-game .game-icon {
    width: 100%;
    aspect-ratio: 1;
  }
}

.game-item:hover .game-icon {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.game-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.game-item:hover .game-icon img {
  transform: scale(1.05);
}

/* 游戏标题覆盖层 */
.game-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  border-radius: 12px;
}

.game-item:hover .game-overlay {
  opacity: 1;
  visibility: visible;
}

.game-title {
  color: white;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  padding: 8px 12px;
  line-height: 1.3;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  word-break: break-word;
  max-width: 100%;
}

/* 特色游戏（第一个）的特殊样式 */
.featured-game .game-title {
  font-size: 18px;
  font-weight: 700;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .game-icon {
    border-radius: 8px; /* 移动端稍小的圆角 */
  }

  .game-overlay {
    border-radius: 8px;
  }

  .placeholder-loading-gif {
    border-radius: 8px; /* 移动端占位符圆角 */
  }

  .game-title {
    font-size: 11px;
    padding: 4px 6px;
    line-height: 1.2;
    font-weight: 500;
  }

  .featured-game .game-title {
    font-size: 14px;
    font-weight: 600;
  }
}

/* 超小屏幕优化 */
@media (max-width: 480px) {
  .top-games-grid {
    gap: 6px;
    padding: 8px;
  }

  .game-title {
    font-size: 10px;
    padding: 3px 4px;
  }

  .featured-game .game-title {
    font-size: 12px;
  }
}

/* 确保在非常窄的屏幕上也能显示 */
@media (max-width: 320px) {
  .top-games-grid {
    gap: 4px;
    padding: 6px;
  }

  .game-title {
    font-size: 9px;
    padding: 2px 3px;
  }

  .featured-game .game-title {
    font-size: 11px;
  }
}
</style>