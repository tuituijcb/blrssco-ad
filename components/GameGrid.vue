<template>
  <div class="game-grid-container">
    <!-- 加载状态 -->
    <div v-if="pending" class="loading">
      <img src="public/loading2.gif" alt="Loading..." class="loading-img" />
      <p>Loading games...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error">
      <p>Failed to load games</p>
    </div>

    <!-- 游戏网格 -->
    <div v-else ref="scrollContainer" class="game-grid-wrapper">
      <div class="game-grid">
        <a 
          v-for="game in games" 
          :key="game.app_name + '-' + game.icon_url"
          :href="`${prefixPath}/detail/${game.app_name}`"
          class="game-item"
        >
          <div class="game-icon">
            <img 
              :src="getGameIconSrc(game)"
              :alt="game.app_name"
              @error="handleImageError"
            />
            <div class="game-overlay">
              <div class="game-title">
                {{ formatGameName(game.app_name) }}
              </div>
            </div>
          </div>
        </a>
      </div>
      
      <!-- 加载更多状态（仅无限模式） -->
      <div v-if="$props.mode === 'infinite' && loading && games.length > 0" class="load-more">
        <img src="public/loading2.gif" alt="Loading..." class="loading-img" />
        <p>Loading more games...</p>
      </div>
      
      <!-- 没有更多数据提示（仅无限模式） -->
      <div v-else-if="$props.mode === 'infinite' && !hasMore && games.length > 0" class="no-more">
        <p>No more games to load</p>
      </div>
      
      <!-- 空状态 -->
      <div v-else-if="!loading && games.length === 0" class="empty-state">
        <p>No games found</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { nextTick } from 'vue'

// 定义组件 props
const props = defineProps({
  category: {
    type: String,
    default: null
  },
  appType: {
    type: String,
    default: 'h5' // 默认查询H5游戏
  },
  limit: {
    type: Number,
    default: 21 // 每次加载的游戏数量（无限模式）或总显示数量（固定模式）
  },
  mode: {
    type: String,
    default: 'infinite', // 'infinite' 无限模式 | 'fixed' 固定个数模式
    validator: (value) => ['infinite', 'fixed'].includes(value)
  },
  maxCount: {
    type: Number,
    default: null // 固定模式下的最大显示数量，为null时使用limit
  },
  disableShuffle: {
    type: Boolean,
    default: false // 是否禁用洗牌功能
  }
})

// 获取 Supabase 实例
const { getGamesByTypeAndCategoryWithOffset } = useSupabase()

// 无限滚动状态
const games = ref([])
const loading = ref(false)
const hasMore = ref(true)
const offset = ref(0)
const error = ref(null)

// 初始加载状态
const pending = ref(true)

// 计算实际的显示数量和加载数量
const getDisplayCount = () => {
  return props.mode === 'fixed' ? (props.maxCount || props.limit) : null
}

const getLoadLimit = () => {
  if (props.mode === 'fixed') {
    const displayCount = getDisplayCount()
    // 固定模式下，一次性加载所需的数量
    return displayCount
  }
  return props.limit // 无限模式下使用原始的limit
}

// 标准 Fisher-Yates 洗牌算法
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 状态：用于跟踪是否已经在客户端洗牌
const isShuffled = ref(false)

// 加载游戏数据
const loadGames = async (isLoadMore = false) => {
  if (loading.value || (!isLoadMore && !hasMore.value)) return
  
  // 固定模式下不允许加载更多
  if (props.mode === 'fixed' && isLoadMore) return
  
  try {
    loading.value = true
    if (!isLoadMore) {
      pending.value = true
      offset.value = 0
      games.value = []
      hasMore.value = props.mode === 'infinite' // 只有无限模式才有更多数据
      isShuffled.value = false // 重置洗牌状态
    }
    
    const loadLimit = getLoadLimit()
    
    // 使用修改后的查询方法，支持 offset
    const result = await getGamesByTypeAndCategoryWithOffset(
      props.appType, 
      props.category, 
      loadLimit, 
      offset.value
    )
    
    if (result && result.length > 0) {
      // 服务端渲染时不洗牌，保持原始顺序
      let finalResult = result
      
      if (isLoadMore) {
        games.value.push(...finalResult)
      } else {
        games.value = finalResult
      }
      offset.value += result.length
      
      if (props.mode === 'infinite') {
        // 无限模式：如果返回的数量少于请求的数量，说明没有更多数据了
        if (result.length < props.limit) {
          hasMore.value = false
        }
      } else {
        // 固定模式：已经加载了指定数量，不需要更多数据
        hasMore.value = false
      }
    } else {
      hasMore.value = false
    }
    
    error.value = null
  } catch (err) {
    error.value = err
  } finally {
    loading.value = false
    pending.value = false
  }
}

// 客户端洗牌函数
const shuffleGamesOnClient = () => {
  if (!props.disableShuffle && process.client && !isShuffled.value && games.value.length > 0) {
    games.value = shuffleArray([...games.value])
    isShuffled.value = true
  }
}

// 初始加载
await loadGames(false)

// 滚动监听
const scrollContainer = ref(null)

// 检查是否需要加载更多
const checkLoadMore = () => {
  // 只有无限模式才支持加载更多
  if (props.mode !== 'infinite' || loading.value || !hasMore.value) return

  const container = scrollContainer.value
  if (!container) return

  // 获取容器的最后一行游戏元素
  const gameItems = container.querySelectorAll('.game-item')
  if (gameItems.length === 0) return

  // 找到最后一行的游戏元素
  const lastItem = gameItems[gameItems.length - 1]
  const lastItemRect = lastItem.getBoundingClientRect()
  const windowHeight = window.innerHeight

  // 当最后一行的游戏元素进入视口时触发加载
  if (lastItemRect.top <= windowHeight) {
    loadGames(true)
  }
}

// 监听属性变化，重新加载数据
watch([() => props.appType, () => props.category, () => props.mode, () => props.maxCount], () => {
  loadGames(false)
  // 属性变化后，在下一个 tick 中重新洗牌
  nextTick(() => {
    shuffleGamesOnClient()
  })
})

// 挂载和卸载滚动监听
onMounted(() => {
  // 在客户端挂载后执行洗牌
  shuffleGamesOnClient()
  
  if (props.mode === 'infinite') {
    window.addEventListener('scroll', checkLoadMore)
    window.addEventListener('resize', checkLoadMore)
  }
})

onUnmounted(() => {
  if (props.mode === 'infinite') {
    window.removeEventListener('scroll', checkLoadMore)
    window.removeEventListener('resize', checkLoadMore)
  }
})

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

// 新增：根据 icon_url 返回合适的图片 src
function getGameIconSrc(game) {
  if (!game.icon_url) {
    return '/iconloading.gif'
  }
  return processIconUrl(game.icon_url)
}

const route = useRoute()
const prefix = Array.isArray(route.params.prefix) ? route.params.prefix[0] : route.params.prefix
const prefixPath = (/^\d{3}$/.test(prefix) ? `/${prefix}` : '')
</script>

<style scoped>
.game-grid-container {
  width: 100%;
}

/* 加载状态 */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: white;
}

.loading-img {
  width: 48px;
  height: 48px;
  display: block;
  margin: 0 auto 12px auto;
}

/* 错误状态 */
.error {
  text-align: center;
  padding: 40px;
  color: #ff6b6b;
}

/* 游戏网格 */
.game-grid {
  display: grid;
  gap: 15px;
  padding: 20px;
  max-width: 100%;
}

/* PC端布局 - 10列固定布局 */
@media (min-width: 769px) {
  .game-grid {
    grid-template-columns: repeat(10, 1fr);
    gap: 15px;
  }
}

/* 平板端布局 */
@media (min-width: 600px) and (max-width: 768px) {
  .game-grid {
    grid-template-columns: repeat(6, 1fr);
    gap: 12px;
  }
}

/* 移动端布局 */
@media (max-width: 599px) {
  .game-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    padding: 10px;
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

/* 加载更多和状态样式 */
.game-grid-wrapper {
  width: 100%;
}

.load-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: white;
}

.no-more {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 18px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .game-grid-container {
    width: 100vw;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .game-icon {
    border-radius: 8px; /* 移动端稍小的圆角 */
  }
  
  .game-overlay {
    border-radius: 8px;
  }
  
  .game-title {
    font-size: 11px;
    padding: 4px 6px;
    line-height: 1.2;
    font-weight: 500;
  }
  
  .load-more {
    padding: 20px 10px;
  }
  
  .no-more, .empty-state {
    padding: 20px 10px;
    font-size: 14px;
  }
}

/* 超小屏幕优化 */
@media (max-width: 480px) {
  .game-grid {
    gap: 6px;
    padding: 8px;
  }
  
  .game-title {
    font-size: 10px;
    padding: 3px 4px;
  }
}

/* 确保在非常窄的屏幕上也能显示 */
@media (max-width: 320px) {
  .game-grid {
    gap: 4px;
    padding: 6px;
  }
  
  .game-title {
    font-size: 9px;
    padding: 2px 3px;
  }
}
</style> 