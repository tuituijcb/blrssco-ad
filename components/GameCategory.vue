<template>
  <div class="game-category-container">
    <!-- 左侧阴影 -->
    <div v-if="showLeftShadow" class="category-shadow-left" />
    <!-- 横向单行滚动分类条，无箭头 -->
    <div 
      ref="categoryGrid"
      class="category-grid horizontal-scroll"
      @wheel="handleWheel"
      @scroll="handleScroll"
    >
      <a 
        v-for="category in categories" 
        :key="category.key"
        :href="`/category/${category.key}`"
        class="category-item"
      >
        <div class="category-icon">
          <img :src="category.icon" :alt="category.name" />
        </div>
        <div class="category-name">{{ category.name }}</div>
      </a>
    </div>
    <!-- 右侧阴影 -->
    <div v-if="showRightShadow" class="category-shadow-right" />
  </div>
</template>

<script setup>
// 定义分类数据
const categories = [
  {
    key: 'shooting',
    name: 'Shooting',
    icon: '/assets/category/shooting.png'
  },
  {
    key: 'sort',
    name: 'Sort',
    icon: '/assets/category/sort.png'
  },
  {
    key: 'boom-blast',
    name: 'Boom Blast',
    icon: '/assets/category/boomBlast.png'
  },
  {
    key: 'merge',
    name: 'Merge',
    icon: '/assets/category/merge.png'
  },
  {
    key: 'find-difference',
    name: 'Find Difference',
    icon: '/assets/category/findDifference.png'
  },
  {
    key: 'match3',
    name: 'Match3',
    icon: '/assets/category/match3.png'
  },
  {
    key: 'parking',
    name: 'Parking',
    icon: '/assets/category/parkingCar.png'
  },
  {
    key: 'tower-defense',
    name: 'Tower Defense',
    icon: '/assets/category/towerDefense.png'
  },
  {
    key: 'music',
    name: 'Music',
    icon: '/assets/category/music.png'
  },
  {
    key: 'puzzle',
    name: 'Puzzle',
    icon: '/assets/category/puzzle.png'
  },
  {
    key: 'ball',
    name: 'Ball',
    icon: '/assets/category/ball.png'
  },
  {
    key: 'running',
    name: 'Running',
    icon: '/assets/category/running.png'
  },
  {
    key: 'connect',
    name: 'Connect',
    icon: '/assets/category/connect.png'
  }
]

// 滚动逻辑
const categoryGrid = ref(null)

// 滚轮事件
const handleWheel = (e) => {
  if (!categoryGrid.value) return
  
  e.preventDefault()
  
  // 水平滚动
  const scrollAmount = e.deltaY > 0 ? 200 : -200
  
  categoryGrid.value.scrollTo({
    left: categoryGrid.value.scrollLeft + scrollAmount,
    behavior: 'smooth'
  })
}

const showLeftShadow = ref(false)
const showRightShadow = ref(false)

const updateShadows = () => {
  if (!categoryGrid.value) return
  const el = categoryGrid.value
  showLeftShadow.value = el.scrollLeft > 0
  showRightShadow.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
}

const handleScroll = () => {
  updateShadows()
}

onMounted(() => {
  updateShadows()
  window.addEventListener('resize', updateShadows)
  // 可能初次渲染后内容宽度才变化，延迟再检测一次
  setTimeout(updateShadows, 200)
})
onUnmounted(() => {
  window.removeEventListener('resize', updateShadows)
})
</script>

<style scoped>
.game-category-container {
  width: 100%;
  padding: 0 0 0 0;
  position: relative;
  background: transparent;
}

.category-grid.horizontal-scroll {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 24px;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
  padding: 0 0 0 0;
  margin: 0;
  width: 100%;
  min-height: 30px;
  background: transparent;
}
.category-grid.horizontal-scroll::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}
.category-item {
  flex: 0 0 auto;
  min-width: 80px;
  max-width: 100px;
  margin: 0;
  display: flex;
  flex-direction: column; /* 改为垂直布局 */
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 8px 6px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  color: inherit;
  gap: 8px; /* 图标和文字之间的间距 */
}
.category-item:hover {
  transform: translateY(-3px) scale(1.04);
  background: rgba(255,255,255,0.08);
  box-shadow: 0 2px 8px rgba(60,168,193,0.08);
}
.category-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border-radius: 8px;
  box-shadow: none;
  margin-bottom: 0;
}
.category-icon img {
  width: 24px;
  height: 24px;
  object-fit: contain;
  filter: brightness(1.1) contrast(1.1);
  transition: all 0.2s;
}
.category-name {
  font-size: 11px;
  font-weight: 600;
  color: #2c3e50;
  text-shadow: none;
  flex: none;
  transition: all 0.2s;
  white-space: nowrap;
  background: transparent;
  margin-top: 0;
  line-height: 1.2;
  text-align: center; /* 文字居中 */
}
.category-item:hover .category-name {
  color: #3ca8c1;
  transform: translateY(-1px) scale(1.04);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .game-category-container {
    padding: 10px 8px;
  }

  .category-item {
    min-width: 70px;
    max-width: 90px;
    padding: 6px 4px;
    gap: 6px;
  }

  .category-icon {
    width: 28px;
    height: 28px;
  }

  .category-icon img {
    width: 20px;
    height: 20px;
  }

  .category-name {
    font-size: 10px;
  }
}

.category-shadow-left {
  position: absolute;
  left: 0;
  top: 0;
  width: 28px;
  height: 100%;
  pointer-events: none;
  z-index: 2;
  background: linear-gradient(to right, rgba(0,0,0,0.12), rgba(0,0,0,0));
}
.category-shadow-right {
  position: absolute;
  right: 0;
  top: 0;
  width: 28px;
  height: 100%;
  pointer-events: none;
  z-index: 2;
  background: linear-gradient(to left, rgba(0,0,0,0.12), rgba(0,0,0,0));
}
.game-category-container {
  position: relative;
}
</style> 