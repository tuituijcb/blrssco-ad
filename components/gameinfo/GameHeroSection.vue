<script setup lang="ts">
import AppCard from './GameCard.vue'

interface App {
  id: number
  package_name: string
  icon_url: string
  name: string
  rating?: number
  developer?: string
}

interface Props {
  app: App
}

const props = defineProps<Props>()

// 滚动到 Play For Free Now 按钮的函数
const scrollToPlayButton = () => {
  const playButton = document.querySelector('.play-now-button')
  if (playButton) {
    playButton.scrollIntoView({
      behavior: 'smooth',
      block: 'center', // 滚动到视口中央
      inline: 'nearest'
    })
  }
}
</script>

<template>
  <div class="app-hero-section">
    <div class="app-hero-card">
      <AppCard
        :id="app.id"
        :package_name="app.package_name"
        :icon_url="app.icon_url"
        :name="app.name"
        :rating="app.rating"
        :developer="app.developer"
      />
      <slot />
      
      <!-- Play 按钮 - 右侧对齐 -->
      <div class="play-button-container">
        <button class="play-button" @click="scrollToPlayButton">
          <svg class="play-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
          </svg>
          Play
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-hero-section {
  margin-bottom: 2.5rem;
}

.app-hero-card {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.play-button-container {
  margin-left: auto;
  flex-shrink: 0;
}

.play-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #3ca8c1 0%, #2d8a9e 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(60, 168, 193, 0.3);
}

.play-button:hover {
  background: linear-gradient(135deg, #2d8a9e 0%, #236b7a 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(60, 168, 193, 0.4);
}

.play-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(60, 168, 193, 0.3);
}

.play-icon {
  width: 40px;
  height: 20px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .app-hero-card {
    flex-direction: column;
    gap: 1rem;
  }
  
  .play-button-container {
    margin-left: 0;
    width: 100%;
    display: flex;
    justify-content: center;
  }
  
  .play-button {
    width: 200px;
    justify-content: center;
  }
}
</style> 