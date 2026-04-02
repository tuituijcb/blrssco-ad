<template>
  <div ref="rootEl" class="header-category-nav" :class="{ 'is-mobile': mobile }">
    <template v-if="mobile">
      <div class="mobile-nav-shell" :class="{ 'show-children': mobileSelectedParent === 'unblocked' }">
        <div class="mobile-parent-column">
          <NuxtLink
            :to="trendingTo"
            class="mobile-parent-item"
            :class="{ active: isTrendingActive }"
          >
            <span>Trending Games</span>
            <span class="parent-arrow">↗</span>
          </NuxtLink>

          <button
            type="button"
            class="mobile-parent-item"
            :class="{ active: isUnblockedActive || mobileSelectedParent === 'unblocked' }"
            @click="toggleMobileParent('unblocked')"
          >
            <span>Unblocked Games</span>
            <span class="parent-arrow">›</span>
          </button>
        </div>

        <div class="mobile-children-column" :class="{ visible: mobileSelectedParent === 'unblocked' }">
          <div class="mobile-children-header">
            <span>Unblocked Games</span>
            <button type="button" class="mobile-children-close" @click="mobileSelectedParent = null">✕</button>
          </div>
          <div class="mobile-children-list">
            <NuxtLink
              v-for="category in childCategories"
              :key="category.key"
              :to="getCategoryLink(category.key)"
              class="mobile-child-item"
              :class="{ active: isCurrentCategory(category.key) }"
            >
              <span class="mobile-child-icon-wrap">
                <img :src="category.icon" :alt="category.name" class="mobile-child-icon">
              </span>
              <span class="mobile-child-name">{{ category.name }}</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="desktop-parent-list">
        <NuxtLink
          :to="trendingTo"
          class="parent-link"
          :class="{ active: isTrendingActive }"
        >
          <span class="parent-emoji">🔥</span>
          <span>Trending Games</span>
        </NuxtLink>

        <button
          type="button"
          class="parent-link parent-toggle"
          :class="{ active: isUnblockedActive || showDesktopChildren }"
          @click="toggleDesktopChildren"
        >
          <span class="parent-emoji">🎮</span>
          <span>Unblocked Games</span>
          <span class="parent-chevron" :class="{ open: showDesktopChildren }">▾</span>
        </button>
      </div>

      <div v-if="showDesktopChildren" class="desktop-overlay" @click="showDesktopChildren = false"></div>
      <teleport to="body">
        <div v-if="showDesktopChildren" class="desktop-overlay" @click="showDesktopChildren = false"></div>
      </teleport>

      <transition name="desktop-dropdown">
        <div v-if="showDesktopChildren" class="desktop-children-dropdown">
          <div class="desktop-children-grid">
            <NuxtLink
              v-for="category in childCategories"
              :key="category.key"
              :to="getCategoryLink(category.key)"
              class="desktop-child-item"
              :class="{ active: isCurrentCategory(category.key) }"
            >
              <span class="desktop-child-icon-wrap">
                <img :src="category.icon" :alt="category.name" class="desktop-child-icon">
              </span>
              <span class="desktop-child-name">{{ category.name }}</span>
            </NuxtLink>
          </div>
        </div>
      </transition>
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
  mobile: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()
const rootEl = ref(null)
const showDesktopChildren = ref(false)
const mobileSelectedParent = ref(null)

const childCategories = [
  { key: 'shooting', name: 'Shooting', icon: '/assets/category/shooting.png' },
  { key: 'sort', name: 'Sort', icon: '/assets/category/sort.png' },
  { key: 'boom-blast', name: 'Boom Blast', icon: '/assets/category/boomBlast.png' },
  { key: 'merge', name: 'Merge', icon: '/assets/category/merge.png' },
  { key: 'find-difference', name: 'Find Difference', icon: '/assets/category/findDifference.png' },
  { key: 'match3', name: 'Match3', icon: '/assets/category/match3.png' },
  { key: 'parking', name: 'Parking', icon: '/assets/category/parkingCar.png' },
  { key: 'tower-defense', name: 'Tower Defense', icon: '/assets/category/towerDefense.png' },
  { key: 'music', name: 'Music', icon: '/assets/category/music.png' },
  { key: 'puzzle', name: 'Puzzle', icon: '/assets/category/puzzle.png' },
  { key: 'ball', name: 'Ball', icon: '/assets/category/ball.png' },
  { key: 'running', name: 'Running', icon: '/assets/category/running.png' },
  { key: 'connect', name: 'Connect', icon: '/assets/category/connect.png' }
]

const trendingTo = {
  path: '/999/app/',
  query: { cid: '374' }
}

const normalizePath = (path = '') => {
  const normalized = path.replace(/\/+$/, '')
  return normalized || '/'
}

const currentCategoryKey = computed(() => {
  const category = route.params.category
  return Array.isArray(category) ? category[0] : category || null
})

const isCurrentCategory = (key) => currentCategoryKey.value === key

const isUnblockedActive = computed(() => {
  return !!currentCategoryKey.value && childCategories.some(category => category.key === currentCategoryKey.value)
})

const isTrendingActive = computed(() => {
  return normalizePath(route.path) === '/999/app' && String(route.query.cid || '') === '374'
})

const getCategoryLink = (key) => `/category/${key}`

const toggleDesktopChildren = () => {
  showDesktopChildren.value = !showDesktopChildren.value
}

const toggleMobileParent = (parentKey) => {
  mobileSelectedParent.value = mobileSelectedParent.value === parentKey ? null : parentKey
}

const handleDocumentClick = (event) => {
  if (props.mobile || !showDesktopChildren.value || !rootEl.value) return
  if (!rootEl.value.contains(event.target)) {
    showDesktopChildren.value = false
  }
}

watch(() => route.fullPath, () => {
  showDesktopChildren.value = false
  mobileSelectedParent.value = null
})

onMounted(() => {
  document.addEventListener('mousedown', handleDocumentClick)
  document.addEventListener('touchstart', handleDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleDocumentClick)
  document.removeEventListener('touchstart', handleDocumentClick)
})
</script>

<style scoped>
/* ===== Desktop — flat style like peppagame ===== */
.header-category-nav {
  position: relative;
}

.desktop-parent-list {
  display: flex;
  align-items: center;
  gap: 32px;
}

.parent-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #3ca8c1;
  font-size: 17px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  transition: color 0.15s;
  white-space: nowrap;
  line-height: 52px;
}

.parent-toggle {
  appearance: none;
}

.parent-link:hover {
  color: #2a8fa6;
}

.parent-link.active {
  color: #1a7a8f;
}

.parent-emoji {
  font-size: 20px;
}

.parent-chevron {
  font-size: 12px;
  line-height: 1;
  transition: transform 0.2s ease;
  margin-left: 2px;
}

.parent-chevron.open {
  transform: rotate(180deg);
}

.desktop-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.15);
  z-index: 399;
}

/* PC overlay */
.desktop-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.25);
  z-index: 399;
}

/* Full-width dropdown panel */
.desktop-children-dropdown {
  position: fixed;
  top: 53px;
  left: 0;
  right: 0;
  width: 100vw;
  padding: 16px 24px;
  background: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-top: 1px solid #eee;
  z-index: 400;
}

.desktop-children-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 6px;
}

.desktop-child-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  text-decoration: none;
  color: #333;
  transition: all 0.15s ease;
}

.desktop-child-item:hover {
  background: #f0f9fb;
  color: #3ca8c1;
}

.desktop-child-item.active {
  background: #e6f5f8;
  color: #1a8a9e;
  font-weight: 600;
}

.desktop-child-icon-wrap,
.mobile-child-icon-wrap {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: #f4f4f5;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.desktop-child-icon,
.mobile-child-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.desktop-child-name,
.mobile-child-name {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.25;
}

.desktop-dropdown-enter-active,
.desktop-dropdown-leave-active {
  transition: all 0.18s ease;
}

.desktop-dropdown-enter-from,
.desktop-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ===== Mobile (unchanged) ===== */
.is-mobile {
  width: 100%;
}

.mobile-nav-shell {
  display: flex;
  overflow: hidden;
}

.mobile-nav-shell.show-children .mobile-parent-column {
  flex: 0 0 44%;
  width: 44%;
}

.mobile-nav-shell.show-children .mobile-children-column {
  flex: 1 1 56%;
}

.mobile-parent-column {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 16px 12px;
  flex: 1 1 100%;
  width: 100%;
}

.mobile-parent-item {
  width: 100%;
  min-height: 56px;
  padding: 16px 20px;
  border-radius: 16px;
  border: 1.5px solid #e0e6e8;
  background: #fff;
  color: #184b55;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 17px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.mobile-parent-item.active {
  background: #e8f7f9;
  color: #1a8a9e;
  border-color: #3ca8c1;
}

.parent-arrow {
  font-size: 18px;
  line-height: 1;
  opacity: 0.45;
  color: #184b55;
}

.mobile-children-column {
  opacity: 0;
  transform: translateX(18px);
  pointer-events: none;
  border-left: 1px solid rgba(16, 84, 97, 0.08);
  background: linear-gradient(180deg, #fff 0%, #f6fbfc 100%);
  transition: all 0.24s ease;
  overflow: hidden;
  max-height: 0;
  width: 0;
  padding: 0;
}

.mobile-children-column.visible {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
  max-height: 600px;
  width: auto;
}

.mobile-children-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 14px 10px;
  font-size: 14px;
  font-weight: 800;
  color: #184b55;
}

.mobile-children-close {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: none;
  background: rgba(24, 75, 85, 0.08);
  color: #184b55;
  font-size: 14px;
  cursor: pointer;
}

.mobile-children-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 10px 12px;
  max-height: 360px;
  overflow-y: auto;
}

.mobile-child-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 12px;
  text-decoration: none;
  color: #333;
  background: #fff;
  border: 1px solid rgba(16, 84, 97, 0.06);
}

.mobile-child-item.active {
  color: #0d6e80;
  background: #dff4f7;
  border-color: rgba(60, 168, 193, 0.3);
}

@media (max-width: 768px) {
  .header-category-nav:not(.is-mobile) {
    display: none;
  }
}
</style>
