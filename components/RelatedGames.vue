<template>
  <div class="related-games-vertical" ref="scrollArea"
    @mouseenter="enableScroll"
    @mouseleave="disableScroll"
  >
    <a 
      v-for="game in relatedGames" 
      :key="game.app_name"
      :href="`${prefixPath}/detail/${game.app_name}`"
      class="related-game-item"
    >
      <div class="related-game-icon">
        <img 
          :src="processIconUrl(game.icon_url)" 
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
    <div v-if="pending" class="related-loading">
      <img src="/loading2.gif" alt="Loading..." class="loading-img" />
      <p>Loading...</p>
    </div>
    <div v-if="!pending && relatedGames.length === 0" class="related-empty">
      <p>No related games found</p>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

// 相关游戏组件，接收当前分类、当前游戏名、展示数量
const props = defineProps({
  category: {
    type: String,
    required: true
  },
  currentAppName: {
    type: String,
    required: true
  },
  limit: {
    type: Number,
    default: 12
  }
})

const { getGamesByTypeAndCategory } = useSupabase()
const relatedGames = ref([])
const pending = ref(true)
const scrollArea = ref(null)
let scrollEnabled = false

const route = useRoute()
const prefix = Array.isArray(route.params.prefix) ? route.params.prefix[0] : route.params.prefix
const prefixPath = (/^\d{3}$/.test(prefix) ? `/${prefix}` : '')

const enableScroll = () => { scrollEnabled = true }
const disableScroll = () => { scrollEnabled = false }

// 查询同类游戏，排除当前游戏
const loadRelatedGames = async () => {
  pending.value = true
  let games = await getGamesByTypeAndCategory('h5', props.category, props.limit + 1)
  // 排除当前游戏
  games = games.filter(g => g.app_name !== props.currentAppName)
  // 限制数量
  relatedGames.value = games.slice(0, props.limit)
  pending.value = false
}

onMounted(() => {
  loadRelatedGames()
  const onWheel = (e) => {
    if (scrollEnabled && scrollArea.value) {
      e.preventDefault()
      scrollArea.value.scrollTop += e.deltaY
    }
  }
  window.addEventListener('wheel', onWheel, { passive: false })
  onUnmounted(() => {
    window.removeEventListener('wheel', onWheel)
  })
})

watch(() => [props.category, props.currentAppName, props.limit], () => {
  loadRelatedGames()
})

// 处理图片URL
const processIconUrl = (iconUrl) => {
  if (!iconUrl) return '/icon.png'
  if (iconUrl.startsWith('https://') || iconUrl.startsWith('http://')) return iconUrl
  if (iconUrl.startsWith('games.blrssco.com')) return `https://${iconUrl}`
  return `https://games.blrssco.com/${iconUrl}`
}

// 格式化游戏名
const formatGameName = (appName) => {
  if (!appName) return ''
  return appName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// 图片加载失败
const handleImageError = (event) => {
  event.target.src = '/icon.png'
}
</script>

<style scoped>
.related-games-vertical {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0;
  height: auto;
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}
.related-games-vertical::-webkit-scrollbar {
  display: none;
}
.related-game-item {
  width: 100%;
  align-items: center;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  display: block;
}
.related-game-icon {
  width: 100%;
  max-width: 100%;
  aspect-ratio: 1/1;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.18);
  position: relative;
  background: #eee;
  transition: box-shadow 0.3s;
}
.related-game-item:hover .related-game-icon {
  box-shadow: 0 8px 24px rgba(60,168,193,0.18);
}
.related-game-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 14px;
  display: block;
}
.game-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s;
  border-radius: 14px;
}
.related-game-item:hover .game-overlay {
  opacity: 1;
  visibility: visible;
}
.game-title {
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  text-align: center;
  padding: 8px 12px;
  line-height: 1.3;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
  word-break: break-word;
  max-width: 100%;
}
.related-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #888;
  margin-top: 20px;
}
.loading-img {
  width: 48px;
  height: 48px;
  display: block;
  margin: 0 auto 12px auto;
}
.related-empty {
  color: #aaa;
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
}
</style> 