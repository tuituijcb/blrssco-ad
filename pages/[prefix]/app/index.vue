<script setup lang="ts">
import { useRoute } from 'vue-router'
import { usePrefixLink } from '@/composables/usePrefixLink'
import { createClient } from '@supabase/supabase-js'
import AdSense from '@/components/AdSense/AdSense.vue'

definePageMeta({
  layout: false
})

const route = useRoute()
const prefix = Array.isArray(route.params.prefix) ? route.params.prefix[0] : route.params.prefix

if (!/^\d{3}$/.test(prefix)) {
  if (process.client) {
    window.location.href = '/app'
  }
}

usePrefixLink()

const supabase = createClient(
  'https://hsduzwtocjaqxwtlpkpd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzZHV6d3RvY2phcXh3dGxwa3BkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNTI3MzQsImV4cCI6MjA2MDYyODczNH0.-z3VfIYbAJIZpKoFeREXUwZmJZkj-PQ0RV8x58vkkuc'
)

const toAbsUrl = (url?: string) => {
  if (!url) return '/icon.png'
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('//')) return `https:${url}`
  return `https://${url.replace(/^\/+/, '')}`
}

const sanitizeText = (value?: string | null) => (value || '').trim()

const cid = computed(() => String(route.query.cid || '').trim())

const { data, pending } = await useAsyncData(`replica-app-list-${prefix}-${cid.value || 'all'}`, async () => {
  const cidId = /^\d+$/.test(cid.value) ? Number(cid.value) : null
  const listLimit = 220

  const [rowsRes, featuredRes] = await Promise.all([
    supabase
      .from('appinfo')
      .select('id, app_name, package_name, icon_url, developer, rating, category, app_type')
      .eq('app_type', 'game')
      .order('id', { ascending: false })
      .limit(listLimit),
    cidId
      ? supabase
          .from('appinfo')
          .select('id, app_name, package_name, icon_url, developer, rating, category, app_type')
          .eq('id', cidId)
          .limit(1)
      : Promise.resolve({ data: [] as any[] })
  ])

  const rows = rowsRes.data || []
  const featured = featuredRes.data?.[0] || null
  const listRaw = rows.filter((x: any) => sanitizeText(x.app_name))

  if (featured && sanitizeText(featured.app_name)) {
    const featureKey = featured.package_name || featured.app_name || String(featured.id)
    const deduped = listRaw.filter((x: any) => {
      const key = x.package_name || x.app_name || String(x.id)
      return x.id !== featured.id && key !== featureKey
    })

    return { list: [featured, ...deduped].slice(0, listLimit) }
  }

  return { list: listRaw.slice(0, listLimit) }
})

const games = computed(() => data.value?.list || [])

const loadedIcons = ref<Record<string, boolean>>({})
const iconKey = (item: any, idx: number) => `${item?.id || item?.package_name || item?.app_name || 'unknown'}:${idx}`
const isIconLoaded = (key: string) => Boolean(loadedIcons.value[key])
const markIconLoaded = (key: string) => {
  if (!loadedIcons.value[key]) loadedIcons.value[key] = true
}

const handleIconError = (event: Event, key: string) => {
  const img = event.target as HTMLImageElement
  if (img && img.src !== '/iconloading.gif') img.src = '/iconloading.gif'
  markIconLoaded(key)
}

const syncLoadedIconsFromDom = () => {
  if (!process.client) return
  const nodes = document.querySelectorAll('img[data-icon-key]')
  nodes.forEach((node) => {
    const img = node as HTMLImageElement
    const key = img.getAttribute('data-icon-key')
    if (!key) return
    if (img.complete || img.naturalWidth > 0) markIconLoaded(key)
  })
}

const currentColumns = ref(4)
const calcColumns = (w: number) => {
  if (w >= 1440) return 10
  if (w >= 1366) return 9
  if (w >= 1200) return 8
  if (w >= 900) return 6
  if (w >= 720) return 5
  return 4
}

const updateColumns = () => {
  if (!process.client) return
  currentColumns.value = calcColumns(window.innerWidth)
}

onMounted(() => {
  updateColumns()
  window.addEventListener('resize', updateColumns)
  nextTick(() => syncLoadedIconsFromDom())
})

onUpdated(() => {
  syncLoadedIconsFromDom()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateColumns)
})

// 第一个卡片是 2x2（占 4 格），相比普通卡片多占 3 格。
// 为了让广告出现在“满 10 行”之后，插入位置要减去这 3 格对应的卡片数。
const adInsertAfterCount = computed(() => Math.max(1, currentColumns.value * 10 - 3))
const gamesWithAppAd = computed(() => {
  const list = games.value
  const insertAfter = adInsertAfterCount.value

  if (!insertAfter || list.length <= insertAfter) {
    return list.map((game: any) => ({ type: 'game' as const, game }))
  }

  const rows: Array<{ type: 'game', game: any } | { type: 'ad' }> = []
  list.forEach((game: any, index: number) => {
    rows.push({ type: 'game', game })
    if (index + 1 === insertAfter) rows.push({ type: 'ad' })
  })
  return rows
})

const buildAppLink = (item: any) => {
  const id = item.package_name || item.app_name
  return `/${prefix}/app/${encodeURIComponent(id)}`
}

useHead({
  title: 'Free mobile games on BLRSSCO',
  meta: [
    { name: 'description', content: 'Discover and explore mobile games at BLRSSCO.' },
    { name: 'robots', content: 'noindex, nofollow' }
  ],
  link: [
    { rel: 'canonical', href: `https://blrssco.com/${prefix}/app` }
  ]
})
</script>

<template>
  <div class="replica-app-list">

    <main id="page">
      <div v-if="pending" class="page-loading">
        <img src="/loading2.gif" alt="Loading..." class="loading-img" />
        <p>Loading games...</p>
      </div>

      <ul id="game-list" v-else-if="games.length">
        <li
          v-for="(item, idx) in gamesWithAppAd"
          :key="item.type === 'game' ? `game-${item.game.id}` : `app-ad-${idx}`"
          :class="['game-item', { 'app-ad-item': item.type === 'ad' }]"
        >
          <a v-if="item.type === 'game'" class="game-card" :href="buildAppLink(item.game)">
            <div class="card-content">
              <div class="img-box" :class="{ 'is-loaded': isIconLoaded(iconKey(item.game, idx)) }">
                <img
                  class="image-content"
                  :src="toAbsUrl(item.game.icon_url)"
                  :alt="item.game.app_name"
                  :data-icon-key="iconKey(item.game, idx)"
                  loading="lazy"
                  @load="markIconLoaded(iconKey(item.game, idx))"
                  @error="handleIconError($event, iconKey(item.game, idx))"
                />
                <div class="image-loading" aria-hidden="true">
                  <img src="/iconloading.gif" alt="" />
                </div>
              </div>
              <p class="game-title">{{ item.game.app_name }}</p>
              <div class="game-base" aria-hidden="true">
                <div>{{ item.game.developer }}</div>
                <div>{{ item.game.package_name }}</div>
                <div>{{ Number(item.game.rating || 0).toFixed(1) }}</div>
              </div>
            </div>
          </a>

          <div v-else class="app-ad-unit">
            <AdSense ad-slot="3092398589" />
          </div>
        </li>
      </ul>

      <section id="desc">
        <div class="desc-box">
          Welcome to BLRSSCO. Here you can find popular mobile games, explore game details, and jump to official download pages quickly and safely.
        </div>

        <div class="questions">
          <p>1. What is an APK file?</p>
          <p>
            APK (Android Package Kit) is the install package format for Android apps. Similar to how .exe works on Windows,
            APK helps install apps on Android devices.
          </p>
          <p>2. Are the games free to download?</p>
          <p>
            Most listings can be browsed freely, and we provide official store links when available.
          </p>
          <p>3. Are the games safe to use?</p>
          <p>
            We prioritize reliable sources and provide references to official channels whenever possible.
          </p>
        </div>

        <div class="disclaimer">
          <p>1. BLRSSCO does not represent any developer, nor is it the developer of any game.</p>
          <p>2. App information and assets are for reference purposes.</p>
          <p>3. All trademarks, logos, and brand names belong to their respective owners.</p>
          <p>
            4. If you believe any content should be updated or removed, please contact
            <a :href="`/${prefix}/contact`">our team</a>.
          </p>
        </div>
      </section>
    </main>

    <footer>
      <ul>
        <li><a :href="`/${prefix}/contact`">Contact Us</a></li>
        <li><a :href="`/${prefix}/privacy-policy`">Privacy Policy</a></li>
        <li><a :href="`/${prefix}/terms-of-service`">Legal Terms</a></li>
      </ul>
    </footer>
  </div>
</template>

<style scoped>
.replica-app-list {
  --content: calc(100% - 30px);
  --column: 4;
  min-height: 100vh;
  background: #f2f5f9;
  font-family: 'Poppins', sans-serif, Roboto, Arial, Helvetica;
}

.list-header {
  display: flex;
  width: 100%;
  height: 50px;
  background: #fff;
  padding: 0 12px;
  box-sizing: border-box;
  align-items: center;
  justify-content: space-between;
}

.logo-link {
  display: inline-flex;
  align-items: center;
  height: 80%;
}

.logo-link img {
  height: 100%;
  display: block;
}

.list-header input {
  border: 0;
  width: 52%;
  height: 34px;
  padding: 0 12px;
  background-color: #e6e6e6;
  border-radius: 28px;
  color: #999;
}

#page {
  width: var(--content);
  margin: 0 auto;
  padding-top: 0;
}

.page-loading {
  width: 100%;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #678;
  gap: 8px;
}

.loading-img {
  width: 72px;
  height: 72px;
  object-fit: contain;
}

#game-list {
  width: 100%;
  list-style: none;
  margin: 0;
  padding: 15px 0 20px;
  display: grid;
  grid-template-columns: repeat(var(--column), calc((100% - 15px * (var(--column) - 1)) / var(--column)));
  gap: 15px;
}

.game-item {
  display: block;
}

.app-ad-item {
  grid-column: 1 / -1;
}

.app-ad-unit {
  width: 100%;
  min-height: 100px;
  border-radius: 4px;
  border: 1px solid #c7d6ea;
  background: #f7fbff;
  padding: 6px;
  box-sizing: border-box;
}

.game-item:first-child {
  grid-column: 1 / span 2;
  grid-row: 1 / span 2;
}

.game-card {
  display: block;
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
  text-decoration: none;
}

.game-card:hover {
  transform-origin: center center;
  transform: scale(1.1);
  transition: all 0.5s cubic-bezier(0.175, 0.585, 0.12, 1.575);
  z-index: 99;
}

.game-card:hover .game-title {
  visibility: visible !important;
}

.card-content {
  overflow: hidden;
  border-radius: 4px;
  position: relative;
}

.img-box {
  width: 100%;
  height: 0;
  position: relative;
  padding-bottom: 100%;
  background-color: #e8e8e8;
}

.image-content {
  display: block;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transform: scale(0);
}

.image-loading {
  position: absolute;
  inset: 0;
}

.image-loading img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.img-box {
  transition: all cubic-bezier(0.95, 0.05, 0.795, 0.035) 0.3s;
}

.img-box.is-loaded .image-loading {
  opacity: 0;
  transform: scale(0.2);
  transition: all cubic-bezier(0.95, 0.05, 0.795, 0.035) 0.2s;
}

.img-box.is-loaded .image-content {
  opacity: 1;
  transform: scale(1);
  transition: all cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.3s;
  z-index: 2;
}

.game-title {
  width: 100%;
  height: 6.5rem;
  visibility: hidden;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(0, 0, 0, 0.5));
  position: absolute;
  bottom: 0;
  left: 0;
  margin: 0;
  box-sizing: border-box;
  color: #fff;
  display: flex;
  overflow: hidden;
  padding: 0 0.5rem;
  font-size: 1.4rem;
  line-height: 1.5;
  font-weight: 500;
  align-items: center;
  z-index: 9;
  text-align: center;
  justify-content: center;
}

.game-base {
  position: absolute;
  inset: 0;
  height: 0;
  visibility: hidden;
  overflow: hidden;
  z-index: -1;
}

#desc {
  margin-top: 10px;
}

.desc-box,
.questions,
.disclaimer {
  padding: 0;
  color: #666;
  font-size: 16px;
  font-weight: 300;
  margin-bottom: 10px;
  line-height: 1.6;
}

.questions p,
.disclaimer p {
  margin: 0 0 10px;
}

.disclaimer a {
  color: #2968ca;
}

footer {
  width: 100%;
  padding-top: 20px;
}

footer ul {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  min-height: 88px;
  flex-wrap: wrap;
  gap: 14px 30px;
}

footer ul li a {
  color: #6e6e6e;
  font-size: 14px;
  line-height: 1.8;
  text-decoration: none;
}

@media (min-width: 720px) {
  .replica-app-list {
    --column: 5;
    --content: calc(100% - 60px);
  }
}

@media (min-width: 900px) {
  .replica-app-list {
    --column: 6;
  }
}

@media (min-width: 1200px) {
  .replica-app-list {
    --column: 8;
  }
}

@media (min-width: 1366px) {
  .replica-app-list {
    --column: 9;
  }
}

@media (min-width: 1440px) {
  .replica-app-list {
    --column: 10;
  }
}

@media (max-width: 640px) {
  .game-title {
    display: none;
  }

  .game-card:hover {
    transform: none;
  }

  .desc-box,
  .questions,
  .disclaimer {
    font-size: 12px;
  }

  footer ul li a {
    font-size: 12px;
  }
}
</style>
