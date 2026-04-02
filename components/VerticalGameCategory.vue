<template>
  <div class="vertical-game-category-container">
    <div class="category-grid-vertical">
      <a 
        v-for="category in categories" 
        :key="category.key"
        :href="`/category/${category.key}`"
        class="category-item-vertical"
      >
        <div class="category-icon-vertical">
          <img :src="category.icon" :alt="category.name" />
        </div>
        <div class="category-name-vertical">{{ category.name }}</div>
      </a>
    </div>
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
</script>

<style scoped>
.vertical-game-category-container {
  width: 100%;
  padding: 20px 16px;
  background: transparent;
}

.category-grid-vertical {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
  max-width: 280px;
  margin: 0 auto;
}

.category-item-vertical {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  padding: 6px 8px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  min-height: 36px;
  position: relative;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
}

.category-item-vertical::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(60, 168, 193, 0.1), transparent);
  transition: left 0.6s ease;
}

.category-item-vertical:hover::before {
  left: 100%;
}

.category-item-vertical:hover {
  transform: translateY(-1px) scale(1.005);
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-color: #3ca8c1;
  box-shadow: 0 2px 6px rgba(60, 168, 193, 0.15);
}

.category-item-vertical:active {
  transform: translateY(0px) scale(1.002);
  transition: all 0.1s ease;
}

.category-icon-vertical {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 6px;
  margin-right: 6px;
  flex-shrink: 0;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.category-icon-vertical img {
  width: 16px;
  height: 16px;
  object-fit: contain;
  filter: brightness(1) contrast(1.1);
  transition: all 0.3s ease;
}

.category-item-vertical:hover .category-icon-vertical {
  background: linear-gradient(135deg, #3ca8c1 0%, #2d8a9e 100%);
  transform: scale(1.02) rotate(2deg);
  box-shadow: 0 1px 4px rgba(60, 168, 193, 0.3);
}

.category-item-vertical:hover .category-icon-vertical img {
  filter: brightness(1.2) contrast(1.2);
  transform: scale(1.01);
}

.category-name-vertical {
  font-size: 11px;
  font-weight: 600;
  color: #1e293b;
  text-align: left;
  letter-spacing: 0.025em;
  transition: all 0.3s ease;
  line-height: 1.2;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-item-vertical:hover .category-name-vertical {
  color: #3ca8c1;
  transform: translateX(1px);
}

/* 暗色模式适配 */
html.dark-mode .category-item-vertical {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-color: #475569;
  color: #e2e8f0;
}

html.dark-mode .category-item-vertical:hover {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-color: #3ca8c1;
}

html.dark-mode .category-icon-vertical {
  background: linear-gradient(135deg, #334155 0%, #475569 100%);
}

html.dark-mode .category-item-vertical:hover .category-icon-vertical {
  background: linear-gradient(135deg, #3ca8c1 0%, #2d8a9e 100%);
}

html.dark-mode .category-name-vertical {
  color: #e2e8f0;
}

html.dark-mode .category-item-vertical:hover .category-name-vertical {
  color: #3ca8c1;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .vertical-game-category-container {
    padding: 8px 6px;
  }

  .category-grid-vertical {
    gap: 3px;
    max-width: 100%;
  }

  .category-item-vertical {
    padding: 5px 6px;
    min-height: 32px;
    border-radius: 6px;
  }

  .category-icon-vertical {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    margin-right: 4px;
  }

  .category-icon-vertical img {
    width: 14px;
    height: 14px;
  }

  .category-name-vertical {
    font-size: 10px;
    font-weight: 600;
  }

  .category-item-vertical:hover {
    transform: translateY(-0.5px) scale(1.002);
  }

  .category-item-vertical:hover .category-icon-vertical {
    transform: scale(1.01) rotate(1deg);
  }
}

/* 平板适配 */
@media (min-width: 769px) and (max-width: 1024px) {
  .category-grid-vertical {
    max-width: 260px;
    gap: 3px;
  }

  .category-item-vertical {
    padding: 5px 7px;
    min-height: 34px;
    border-radius: 7px;
  }

  .category-icon-vertical {
    width: 22px;
    height: 22px;
    border-radius: 5px;
    margin-right: 5px;
  }

  .category-icon-vertical img {
    width: 15px;
    height: 15px;
  }

  .category-name-vertical {
    font-size: 10.5px;
  }
}

/* 大屏幕优化 */
@media (min-width: 1200px) {
  .category-grid-vertical {
    max-width: 280px;
    gap: 5px;
  }

  .category-item-vertical {
    padding: 7px 9px;
    min-height: 38px;
    border-radius: 9px;
  }

  .category-icon-vertical {
    width: 26px;
    height: 26px;
    border-radius: 7px;
    margin-right: 7px;
  }

  .category-icon-vertical img {
    width: 18px;
    height: 18px;
  }

  .category-name-vertical {
    font-size: 12px;
    font-weight: 600;
  }
}
</style> 