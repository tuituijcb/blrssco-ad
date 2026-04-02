<template>
  <div>
    <!-- PC 版本导航栏 -->
    <div class="pc-header" :class="{ 'no-category-mode': props.hideCategory }">
      <div class="header" :class="{ 'no-category-mode': props.hideCategory }" :style="{ backgroundColor: headerBgColor }">
        <div class="top" :class="{ 'no-category-mode': props.hideCategory }" :style="{ backgroundColor: headerBgColor }">
          <div class="top_logo left">
            <a :href="resolvedLogoHref">
              <img :src="currentLogo" alt="Logo" @error="handleLogoError">
            </a>
          </div>
          <!-- 分类条横向一行，替换原菜单 -->
          <div v-if="!props.hideCategory" class="top_category">
            <HeaderCategoryNav />
          </div>
          <div class="top_search right">
            <template v-if="showSearchInput">
              <div class="header-search-box" @mousedown.stop>
                <input
                  ref="searchInputRef"
                  v-model="searchQuery"
                  class="header-search-input"
                  type="search"
                  placeholder="Search..."
                  @input="handleHeaderInput"
                  @keyup.enter="handleHeaderSearch"
                  @blur="closeHeaderSearch"
                >
                <button class="header-search-btn" @mousedown.prevent="handleHeaderSearch">
                  <img src="/assets/sousuoicon-DGtnZBWY.png" alt="Search">
                </button>
                <div v-if="searchQuery && headerSearchResults.length > 0" class="header-search-dropdown">
                  <div class="header-search-result-item" v-for="result in headerSearchResults" :key="result.id" @mousedown.prevent="jumpToGame(result.app_name)">
                    {{ result.app_name }}
                  </div>
                </div>
                <div v-else-if="searchQuery && headerSearchResults.length === 0" class="header-search-dropdown header-search-noresult">
                  No results found
                </div>
              </div>
            </template>
            <template v-else>
              <img src="/assets/sousuo-51fZRPP2.png" alt="Search" @click.stop="toggleHeaderSearch">
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 移动版本导航栏 -->
    <div class="mobile-header" :class="{ 'no-category-mode': props.hideCategory }" :style="{ backgroundColor: headerBgColor }">
      <div class="move_header" :class="{ 'no-category-mode': props.hideCategory }" :style="{ backgroundColor: headerBgColor }">
        <div v-if="!props.hideCategory" class="header_left" @click="toggleMobileCategoryMenu">
          <img src="/assets/menu-RayvOsUX.png" alt="Menu">
        </div>
        <div class="header_middle">
          <a :href="resolvedLogoHref">
            <img :src="currentLogo" alt="Logo" @error="handleLogoError">
          </a>
        </div>
        <div class="header_right">
          <template v-if="showMobileSearchInput">
            <div class="header-search-box" @mousedown.stop>
              <input
                ref="mobileSearchInputRef"
                v-model="mobileSearchQuery"
                class="header-search-input"
                type="search"
                placeholder="Search..."
                @input="handleMobileHeaderInput"
                @keyup.enter="handleMobileHeaderSearch"
                @blur="closeMobileHeaderSearch"
              >
              <button class="header-search-btn" @mousedown.prevent="handleMobileHeaderSearch">
                <img src="/assets/sousuoicon-DGtnZBWY.png" alt="Search">
              </button>
              <div v-if="mobileSearchQuery && mobileHeaderSearchResults.length > 0" class="header-search-dropdown">
                <div class="header-search-result-item" v-for="result in mobileHeaderSearchResults" :key="result.id" @mousedown.prevent="jumpToGame(result.app_name)">
                  {{ result.app_name }}
                </div>
              </div>
              <div v-else-if="mobileSearchQuery && mobileHeaderSearchResults.length === 0" class="header-search-dropdown header-search-noresult">
                No results found
              </div>
            </div>
          </template>
          <template v-else>
            <img src="/assets/sousuoicon-DGtnZBWY.png" alt="Search" @click.stop="toggleMobileSearchInput">
          </template>
        </div>
      </div>
      <div v-if="!props.hideCategory && showMobileCategoryMenu" class="mobile-category-dropdown">
        <HeaderCategoryNav mobile />
      </div>
    </div>
    <!-- 移动端分类遮罩（放在 mobile-header 外面，避免 stacking context 限制） -->
    <div v-if="!props.hideCategory && showMobileCategoryMenu" class="mobile-category-overlay" @click="showMobileCategoryMenu = false"></div>

    <!-- 搜索弹窗 (PC端) -->
    <div v-if="showSearch" class="search-overlay pc-search" @click="closeSearch">
      <div class="search-container" @click.stop>
        <div class="search-header">
          <img src="/icon.png" class="search-logo" alt="Logo">
          <button class="close-btn" @click="closeSearch">×</button>
        </div>
        <div class="search-input-container">
          <input 
            v-model="searchQuery"
            placeholder="What are you going to play today？" 
            type="search" 
            class="search-input"
            @keyup.enter="performSearch"
          >
          <div class="search-icon" @click="performSearch">
            <img src="/assets/sousuoicon-DGtnZBWY.png" alt="Search">
          </div>
        </div>
        <div class="search-results" v-if="searchResults.length > 0">
          <div class="search-result-item" v-for="result in searchResults" :key="result.id">
            <a :href="`/games/${result.app_name}`" @click="closeSearch">
              {{ result.app_name }}
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索弹窗 (移动端) -->
    <div v-if="showMobileSearch" class="search-overlay mobile-search" @click="closeMobileSearch">
      <div class="mobile-search-container" @click.stop>
        <div class="mobile-search-header">
          <button class="back-btn" @click="closeMobileSearch">
            <img src="/assets/guanbi-SP546PSv.png" alt="Close">
            清空
          </button>
          <img src="/icon.png" class="search-logo" alt="Logo">
        </div>
        <div class="mobile-search-input-container">
          <input 
            v-model="mobileSearchQuery"
            placeholder="search result" 
            type="search" 
            class="mobile-search-input"
            @keyup.enter="performMobileSearch"
          >
        </div>
        <div class="mobile-search-results" v-if="mobileSearchResults.length > 0">
          <div class="mobile-search-result-item" v-for="result in mobileSearchResults" :key="result.id">
            <a :href="`/games/${result.app_name}`" @click="closeMobileSearch">
              {{ result.app_name }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import HeaderCategoryNav from './HeaderCategoryNav.vue'

const props = defineProps({
  hideCategory: {
    type: Boolean,
    default: false
  },
  headerBgColor: {
    type: String,
    default: ''
  },
  logoHref: {
    type: String,
    default: ''
  }
})

const headerBgColor = computed(() => props.headerBgColor || '#ffffff')
const resolvedLogoHref = computed(() => props.logoHref || '/')

const { searchGames, getGameByName } = useSupabase()
const route = useRoute()

// 状态管理
const showSearch = ref(false)
const showMobileSearch = ref(false)
const showMobileCategoryMenu = ref(false)
const searchQuery = ref('')
const mobileSearchQuery = ref('')
const searchResults = ref([])
const mobileSearchResults = ref([])

// 新增PC端header搜索展开状态
const showSearchInput = ref(false)
const searchInputRef = ref(null)

// 新增移动端header搜索展开状态
const showMobileSearchInput = ref(false)
const mobileSearchInputRef = ref(null)
const mobileHeaderSearchResults = ref([])

// 动态logo状态
const currentGameIcon = ref(null)
const defaultLogo = '/logo.png'

// 计算当前应该显示的logo
const currentLogo = computed(() => {
  return currentGameIcon.value || defaultLogo
})

// 根据当前路由获取游戏图标
const loadGameIcon = async () => {
  // 检查是否在游戏详情页面 (不是分类页面)
  if (route.path.startsWith('/games/') && route.params.id && !route.params.category) {
    try {
      console.log('正在加载游戏图标，app_name:', route.params.id)
      const gameData = await getGameByName(route.params.id)
      if (gameData && gameData.icon_url) {
        currentGameIcon.value = gameData.icon_url
        console.log('成功加载游戏图标:', gameData.icon_url)
      } else {
        currentGameIcon.value = null
        console.log('未找到游戏图标，使用默认logo')
      }
    } catch (error) {
      console.error('加载游戏图标失败:', error)
      currentGameIcon.value = null
    }
  } else {
    // 不在游戏详情页面，使用默认logo
    currentGameIcon.value = null
  }
}

// 监听路由变化
watch(() => route.path, () => {
  loadGameIcon()
}, { immediate: true })

// PC端搜索功能
const toggleHeaderSearch = () => {
  showSearchInput.value = !showSearchInput.value
  if (showSearchInput.value) {
    nextTick(() => {
      if (searchInputRef.value) searchInputRef.value.focus()
    })
  }
}

const closeHeaderSearch = () => {
  showSearchInput.value = false
}

const performSearch = async () => {
  if (searchQuery.value.trim()) {
    try {
      const results = await searchGames(searchQuery.value)
      searchResults.value = results.slice(0, 10) // 限制显示10个结果
    } catch (error) {
      console.error('Search error:', error)
      searchResults.value = []
    }
  }
}

// 移动端搜索功能
const toggleMobileSearch = () => {
  showMobileSearch.value = !showMobileSearch.value
  if (showMobileSearch.value) {
    mobileSearchQuery.value = ''
    mobileSearchResults.value = []
  }
}

const closeMobileSearch = () => {
  showMobileSearch.value = false
  mobileSearchQuery.value = ''
  mobileSearchResults.value = []
}

const performMobileSearch = async () => {
  if (mobileSearchQuery.value.trim()) {
    try {
      const results = await searchGames(mobileSearchQuery.value)
      mobileSearchResults.value = results.slice(0, 10)
    } catch (error) {
      console.error('Mobile search error:', error)
      mobileSearchResults.value = []
    }
  }
}

// 移动端菜单功能
const toggleMobileCategoryMenu = () => {
  showMobileCategoryMenu.value = !showMobileCategoryMenu.value
}

// 处理logo图片加载错误
const handleLogoError = (event) => {
  console.warn('Logo加载失败，使用默认logo')
  event.target.src = defaultLogo
  currentGameIcon.value = null
}

// 监听搜索输入变化
watch(searchQuery, (newValue) => {
  if (newValue.trim()) {
    performSearch()
  } else {
    searchResults.value = []
  }
})

watch(mobileSearchQuery, (newValue) => {
  if (newValue.trim()) {
    performMobileSearch()
  } else {
    mobileSearchResults.value = []
  }
})

// 关闭所有弹窗当路由变化时
watch(() => route.fullPath, () => {
  closeSearch()
  closeMobileSearch()
  closeMobileCategoryMenu()
})

const headerSearchResults = ref([])

async function handleHeaderInput() {
  if (searchQuery.value.trim()) {
    try {
      const results = await searchGames(searchQuery.value)
      headerSearchResults.value = results.slice(0, 10)
    } catch (error) {
      headerSearchResults.value = []
    }
  } else {
    headerSearchResults.value = []
  }
}

function jumpToGame(appName) {
  closeHeaderSearch()
  navigateTo(`/games/${appName}`)
}

function handleHeaderSearch() {
  if (headerSearchResults.value.length > 0) {
    jumpToGame(headerSearchResults.value[0].app_name)
  } else {
    closeHeaderSearch()
  }
}

function toggleMobileSearchInput() {
  showMobileSearchInput.value = !showMobileSearchInput.value
  if (showMobileSearchInput.value) {
    nextTick(() => {
      if (mobileSearchInputRef.value) mobileSearchInputRef.value.focus()
    })
  }
}

function closeMobileHeaderSearch() {
  showMobileSearchInput.value = false
}

async function handleMobileHeaderInput() {
  if (mobileSearchQuery.value.trim()) {
    try {
      const results = await searchGames(mobileSearchQuery.value)
      mobileHeaderSearchResults.value = results.slice(0, 10)
    } catch (error) {
      mobileHeaderSearchResults.value = []
    }
  } else {
    mobileHeaderSearchResults.value = []
  }
}

function handleMobileHeaderSearch() {
  if (mobileHeaderSearchResults.value.length > 0) {
    jumpToGame(mobileHeaderSearchResults.value[0].app_name)
  } else {
    closeMobileHeaderSearch()
  }
}

// 监听点击外部收起移动端分类菜单
onMounted(() => {
  function handleClickOutside(event) {
    const dropdown = document.querySelector('.mobile-category-dropdown')
    const menuBtn = document.querySelector('.header_left')
    if (
      showMobileCategoryMenu.value &&
      dropdown &&
      !dropdown.contains(event.target) &&
      menuBtn &&
      !menuBtn.contains(event.target)
    ) {
      showMobileCategoryMenu.value = false
    }
  }
  document.addEventListener('mousedown', handleClickOutside)
  document.addEventListener('touchstart', handleClickOutside)
  onUnmounted(() => {
    document.removeEventListener('mousedown', handleClickOutside)
    document.removeEventListener('touchstart', handleClickOutside)
  })
})
</script>

<style scoped>
/* PC 版本导航栏样式 */
.pc-header {
  display: block;
}

.mobile-header {
  display: none;
}

.header {
  background: #3ca8c1;
  position: relative;
  z-index: 100;
}

.header.no-category-mode {
  background: #fff;
}

.top {
  display: flex;
  align-items: center;
  padding: 6px 20px;
  background: #fff;
  height: 52px;
  border-bottom: 1px solid #eee;
}

.top.no-category-mode {
  border-bottom: none;
}

.top_logo {
  flex: 0 0 auto;
}

.top.no-category-mode .top_logo {
  margin-right: 12px;
}

.top_logo img {
  height: 32px;
  display: block;
}

.top_category {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.top_search {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.top.no-category-mode .top_search .header-search-box {
  background: #fff;
  border-color: rgba(44, 62, 80, 0.2);
}

.top_search img {
  width: 150px;
  height: 24px;
}

.left {
  float: left;
}

.right {
  float: right;
}

/* 移动端导航栏样式 */
@media (max-width: 768px) {
  .pc-header {
    display: none;
  }
  
  .mobile-header {
    display: block;
    width: 100%;
    background: #3ca8c1;
    position: relative;
    z-index: 200;
  }
}

.move_header {
  display: flex;
  align-items: center;
  padding: 6px 0;
  position: relative;
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #eee;
}

.mobile-header.no-category-mode {
  background: #fff;
}

.move_header.no-category-mode {
  background: #fff;
  padding: 6px 12px;
}

.move_header.no-category-mode .header_middle {
  justify-content: flex-start;
}

.move_header.no-category-mode .header_right {
  margin-left: auto;
}

.header_left, .header_right {
  flex: 0 0 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  height: 36px;
}
.header_left img, .header_right img {
  filter: brightness(0) saturate(100%) invert(45%) sepia(60%) saturate(500%) hue-rotate(155deg);
}

.header_middle {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header_middle img {
  height: 28px;
}

.mobile-category-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 199;
}

.mobile-category-dropdown {
  width: 100vw;
  background: #fff;
  box-shadow: 0 4px 16px rgba(0,60,71,0.10);
  position: absolute;
  left: 0;
  top: 100%;
  z-index: 300;
  padding: 10px 0 6px 0;
  border-radius: 0 0 16px 16px;
  animation: dropdownIn 0.2s;
}

@keyframes dropdownIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* PC端搜索弹窗样式 */
.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pc-search {
  display: flex;
}

.mobile-search {
  display: none;
}

.search-container {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
}

.search-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.search-logo {
  height: 32px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-input-container {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.search-input {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 12px 16px;
  font-size: 16px;
  outline: none;
}

.search-input:focus {
  border-color: #3ca8c1;
}

.search-icon {
  margin-left: 12px;
  cursor: pointer;
  padding: 8px;
}

.search-icon img {
  width: 150px !important;
  height: auto;
}

.search-results {
  max-height: 300px;
  overflow-y: auto;
}

.search-result-item {
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item a {
  color: #333;
  text-decoration: none;
  display: block;
}

.search-result-item:hover {
  background: #f8f9fa;
}

/* 移动端搜索弹窗样式 */
@media (max-width: 768px) {
  .pc-search {
    display: none;
  }
  
  .mobile-search {
    display: flex;
  }
  
  .mobile-search-container {
    background: white;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .mobile-search-header {
    display: flex;
    align-items: center;
    padding: 15px;
    border-bottom: 1px solid #eee;
    background: #3ca8c1;
  }
  
  .back-btn {
    background: none;
    border: none;
    color: white;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    cursor: pointer;
  }
  
  .back-btn img {
    width: 16px;
    height: 16px;
  }
  
  .mobile-search-header .search-logo {
    height: 24px;
    margin-left: auto;
    margin-right: auto;
  }
  
  .mobile-search-input-container {
    padding: 20px;
    border-bottom: 1px solid #eee;
  }
  
  .mobile-search-input {
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 12px 16px;
    font-size: 16px;
    outline: none;
  }
  
  .mobile-search-input:focus {
    border-color: #3ca8c1;
  }
  
  .mobile-search-results {
    flex: 1;
    overflow-y: auto;
  }
  
  .mobile-search-result-item {
    padding: 15px 20px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .mobile-search-result-item:last-child {
    border-bottom: none;
  }
  
  .mobile-search-result-item a {
    color: #333;
    text-decoration: none;
    display: block;
  }
  
  .mobile-search-result-item:active {
    background: #f8f9fa;
  }
}

/* 全局覆盖样式 */
.search-overlay * {
  box-sizing: border-box;
}

.header-category-bar {
  width: 100%;
  background: #3ca8c1;
  padding: 0 0 0 0;
  margin: 0;
  border-bottom: 1.5px solid rgba(0,60,71,0.12);
  box-shadow: 0 2px 8px rgba(0,60,71,0.04);
  display: block;
}
@media (max-width: 768px) {
  .header-category-bar {
    display: none;
  }
}

.header-search-box {
  position: relative;
  display: flex;
  align-items: center;
  background: #f0f5f6;
  border-radius: 24px;
  box-shadow: none;
  padding: 0;
  width: 200px;
  height: 38px;
  border: none;
  transition: background 0.2s, box-shadow 0.2s;
}
.header-search-box:focus-within {
  background: #e8f4f6;
  box-shadow: 0 0 0 2px rgba(60, 168, 193, 0.25);
}
.header-search-input {
  border: none;
  outline: none;
  font-size: 14px;
  background: transparent;
  flex: 1;
  min-width: 0;
  color: #333;
  padding: 0 6px 0 16px;
}
.header-search-input::placeholder {
  color: #999;
}
.header-search-btn {
  background: #3ca8c1;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  margin-right: 2px;
  transition: background 0.15s;
}
.header-search-btn:hover {
  background: #2a8fa6;
}
.header-search-btn img {
  width: 18px;
  height: 18px;
  display: block;
  filter: brightness(10);
}
.header-search-btn:active img {
  filter: brightness(8);
}
.header-search-dropdown {
  position: absolute;
  left: 0;
  top: 100%;
  width: 100%;
  background: #fff;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 16px rgba(0,60,71,0.10);
  z-index: 100;
  max-height: 260px;
  overflow-y: auto;
  margin-top: 2px;
  font-size: 15px;
  color: #2c3e50;
}
.header-search-result-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}
.header-search-result-item:hover {
  background: #f0f8fa;
  color: #3ca8c1;
}
.header-search-noresult {
  color: #aaa;
  text-align: center;
  padding: 10px 0;
  background: #fff;
  border-radius: 0 0 8px 8px;
}
</style> 