<script setup lang="ts">
interface Props {
  id: number
  name: string
  package_name: string
  icon_url?: string
  rating?: number
  downloads?: number
  size?: 'small' | 'medium' | 'large'
  showDownloads?: boolean
  className?: string
  developer?: string
}

const props = withDefaults(defineProps<Props>(), {
  rating: 0,
  size: 'medium',
  showDownloads: false,
  className: '',
  developer: ''
})

// 不同尺寸的配置
const sizeConfig = {
  small: {
    iconSize: 48,
    titleSize: '0.85rem',
    padding: '0.5rem',
    gap: '0.5rem'
  },
  medium: {
    iconSize: 64,
    titleSize: '0.9rem',
    padding: '0.75rem',
    gap: '0.75rem'
  },
  large: {
    iconSize: 80,
    titleSize: '1rem',
    padding: '1rem',
    gap: '1rem'
  }
}

const config = sizeConfig[props.size]

// 格式化下载量
const formatDownloads = (num?: number): string => {
  if (!num) return '0'
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

// 首字母大写函数
function capitalizeFirstLetter(str: string) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// 生成星星评分数据
const fullStars = Math.floor(props.rating)
const hasHalfStar = props.rating - fullStars >= 0.5
const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
</script>

<template>
  <div :class="['app-card-simple', className]" class="app-card">
    <div class="app-card-icon">
      <img 
        :src="icon_url || '/default-icon.png'" 
        :alt="name" 
        class="app-icon"
      />
    </div>
    
    <div class="app-card-content">
      <h1 class="app-card-title">
        {{ capitalizeFirstLetter(name) }}
      </h1>
      
      <div class="app-card-rating-section">
        <div class="stars">
          <!-- 满星 -->
          <span v-for="i in fullStars" :key="`full-${i}`" class="star">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="#FFD700">
              <polygon points="10,1 12.6,7.5 19.5,7.5 14,12 16,19 10,15 4,19 6,12 0.5,7.5 7.4,7.5"/>
            </svg>
          </span>
          
          <!-- 半星 -->
          <span v-if="hasHalfStar" class="star">
            <svg width="18" height="18" viewBox="0 0 20 20">
              <defs>
                <linearGradient id="half-star">
                  <stop offset="50%" stop-color="#FFD700"/>
                  <stop offset="50%" stop-color="#e0e0e0"/>
                </linearGradient>
              </defs>
              <polygon 
                points="10,1 12.6,7.5 19.5,7.5 14,12 16,19 10,15 4,19 6,12 0.5,7.5 7.4,7.5" 
                fill="url(#half-star)"
              />
            </svg>
          </span>
          
          <!-- 空星 -->
          <span v-for="i in emptyStars" :key="`empty-${i}`" class="star">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="#e0e0e0">
              <polygon points="10,1 12.6,7.5 19.5,7.5 14,12 16,19 10,15 4,19 6,12 0.5,7.5 7.4,7.5"/>
            </svg>
          </span>
        </div>
        
        <span class="app-card-rating">{{ rating.toFixed(1) }}</span>
      </div>
      
      <h2 class="app-card-developer">
        {{ capitalizeFirstLetter(developer) }}
      </h2>
    </div>
  </div>
</template>

<style scoped>
.app-card {
  display: flex;
  align-items: center;
}

.app-card-icon {
  flex-shrink: 0;
  border-radius: 24px;
  width: 128px;
  height: 128px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-icon {
  width: 120px;
  height: 120px;
  border-radius: 24px;
  background: transparent;
  object-fit: cover;
}

.app-card-content {
  margin-left: 15px;
  flex: 1;
  min-width: 0;
}

.app-card-title {
  font-weight: 700;
  font-size: 1.5rem;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: inherit;
}

.app-card-rating-section {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.stars {
  display: flex;
  align-items: center;
  gap: 2px;
}

.star {
  display: inline-block;
}

.app-card-rating {
  font-size: 1.1rem;
  margin-left: 8px;
  color: inherit;
}

.app-card-developer {
  font-size: 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #666;
}

html.dark-mode .app-card-developer {
  color: #94a3b8;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .app-card {
    flex-direction: column;
    text-align: center;
  }
  
  .app-card-content {
    margin-left: 0;
    margin-top: 1rem;
  }
  
  .app-card-icon {
    width: 96px;
    height: 96px;
  }
  
  .app-icon {
    width: 88px;
    height: 88px;
  }
  
  .app-card-title {
    font-size: 1.25rem;
  }
}
</style> 