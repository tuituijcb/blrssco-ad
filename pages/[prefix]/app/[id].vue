<script setup lang="ts">
import { useRoute } from 'vue-router'
import { usePrefixLink } from '@/composables/usePrefixLink'
import { createClient } from '@supabase/supabase-js'
import AdSense from '@/components/AdSense/AdSense.vue'
import AppHeader from '@/components/AppHeader.vue'

definePageMeta({
  layout: false
})

const route = useRoute()
const prefix = Array.isArray(route.params.prefix) ? route.params.prefix[0] : route.params.prefix
const rawId = Array.isArray(route.params.id) ? route.params.id[0] : String(route.params.id)
const routeId = decodeURIComponent(rawId)

if (!/^\d{3}$/.test(prefix)) {
  if (process.client) {
    window.location.href = `/detail/${routeId}`
  }
}

const supabase = createClient(
  'https://hsduzwtocjaqxwtlpkpd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzZHV6d3RvY2phcXh3dGxwa3BkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNTI3MzQsImV4cCI6MjA2MDYyODczNH0.-z3VfIYbAJIZpKoFeREXUwZmJZkj-PQ0RV8x58vkkuc'
)

const toAbsUrl = (url?: string) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('//')) return `https:${url}`
  return `https://${url.replace(/^\/+/, '')}`
}

const formatName = (name?: string) => {
  if (!name) return 'Unknown'
  return name.replace(/[_-]+/g, ' ')
}

const parseSize = (value?: string | number) => {
  if (value === undefined || value === null || value === '') return '--'

  const toPretty = (num: number) => {
    if (!Number.isFinite(num) || num <= 0) return '--'
    if (num >= 1024 * 1024 * 1024) return `${(num / (1024 * 1024 * 1024)).toFixed(1)}GB`
    if (num >= 1024 * 1024) return `${(num / (1024 * 1024)).toFixed(1)}MB`
    if (num >= 1024) return `${(num / 1024).toFixed(1)}KB`
    return `${num}B`
  }

  if (typeof value === 'number') return toPretty(value)

  const raw = String(value).trim()
  if (!raw) return '--'
  if (/^\d+(\.\d+)?$/.test(raw)) return toPretty(Number(raw))
  return raw
}

const onlyDbText = (value?: string | null) => (value && value.trim() ? value : '')

const { data, pending, error } = await useAsyncData(`replica-app-${prefix}-${routeId}`, async () => {
  if (!supabase) return null

  // 1) main app
  let app: any = null

  const byPackage = await supabase
    .from('appinfo')
    .select('*')
    .eq('package_name', routeId)
    .limit(1)

  if (byPackage.data?.[0]) {
    app = byPackage.data[0]
  } else {
    const byName = await supabase
      .from('appinfo')
      .select('*')
      .eq('app_name', routeId)
      .limit(1)

    app = byName.data?.[0] || null
  }

  if (!app) return null

  const pkg = app.package_name || routeId

  // 2) 并行查询：article、screenshots、推荐游戏池
  const [articleByPackage, articleByType, imagesRes, similarRes, onlineRes, byCategory] = await Promise.all([
    supabase
      .from('articles')
      .select('editors_review, features, how_to_use, faq, user_reviews')
      .eq('package_name', pkg)
      .limit(1),
    app.app_type
      ? supabase
          .from('articles')
          .select('editors_review, features, how_to_use, faq, user_reviews')
          .eq('app_type', app.app_type)
          .limit(1)
      : Promise.resolve({ data: [] as any[] }),
    supabase
      .from('images')
      .select('public_url')
      .eq('package_name', pkg)
      .order('id', { ascending: true })
      .limit(12),
    supabase
      .from('appinfo')
      .select('id, app_name, package_name, icon_url, rating, app_type')
      .eq('app_type', 'game')
      .neq('package_name', pkg)
      .limit(72),
    supabase
      .from('appinfo')
      .select('id, app_name, package_name, icon_url, rating, app_type')
      .eq('app_type', 'h5')
      .neq('package_name', pkg)
      .limit(36),
    app.category
      ? supabase
          .from('appinfo')
          .select('id, app_name, package_name, icon_url, rating, app_type')
          .eq('category', app.category)
          .neq('package_name', pkg)
          .limit(36)
      : Promise.resolve({ data: [] as any[] })
  ])

  const articleData = articleByPackage.data?.[0] || articleByType.data?.[0] || null

  const normalize = (value: any) => String(value || '').trim().toLowerCase()
  const keyOf = (item: any) => normalize(item.package_name) || normalize(item.app_name) || String(item.id)
  const tokenList = (item: any) => [normalize(item.package_name), normalize(item.app_name)].filter(Boolean)

  const dedupeByPkg = (list: any[]) => {
    const m = new Map<string, any>()
    list.forEach((item: any) => {
      const key = keyOf(item)
      if (!m.has(key)) m.set(key, item)
    })
    return Array.from(m.values())
  }

  const gamePool = dedupeByPkg(similarRes.data || [])
  const onlinePool = dedupeByPkg(onlineRes.data || [])
  const categoryPool = dedupeByPkg(byCategory.data || [])

  const similarGames = gamePool.slice(0, 15)
  const similarTokenSet = new Set(similarGames.flatMap((item: any) => tokenList(item)))

  const topStrip = dedupeByPkg([
    ...gamePool.slice(15),
    ...categoryPool.filter((item: any) => normalize(item.app_type) === 'game')
  ])
    .filter((item: any) => !tokenList(item).some((token) => similarTokenSet.has(token)))
    .slice(0, 12)

  const sideList = dedupeByPkg([
    ...categoryPool,
    ...gamePool,
    ...onlinePool
  ]).slice(0, 14)

  const onlineGames = onlinePool.slice(0, 10)

  return {
    app,
    article: articleData,
    screenshots: (imagesRes.data || []).map((x: any) => toAbsUrl(x.public_url)).filter(Boolean),
    topStrip,
    sideList,
    similarGames,
    onlineGames
  }
})

const app = computed(() => data.value?.app || null)
const article = computed(() => data.value?.article || null)
const screenshots = computed(() => data.value?.screenshots || [])
const topStrip = computed(() => data.value?.topStrip || [])
const sideList = computed(() => data.value?.sideList || [])
const similarGames = computed(() => data.value?.similarGames || [])
const onlineGames = computed(() => data.value?.onlineGames || [])

const isNarrowViewport = ref(false)
const onlineGamesDisplay = computed(() => {
  const list = onlineGames.value || []
  return isNarrowViewport.value ? list.slice(0, 9) : list.slice(0, 10)
})

const loadedIcons = ref<Record<string, boolean>>({})
const makeIconKey = (scope: string, item: any) => `${scope}:${item?.id || item?.package_name || item?.app_name || 'unknown'}`
const isIconLoaded = (key: string) => Boolean(loadedIcons.value[key])
const markIconLoaded = (key: string) => {
  if (!loadedIcons.value[key]) loadedIcons.value[key] = true
}

const handleIconError = (event: Event, key: string) => {
  const img = event.target as HTMLImageElement
  if (img && !img.src.endsWith('/iconloading.gif')) img.src = '/iconloading.gif'
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

const updateViewportMode = () => {
  if (!process.client) return
  isNarrowViewport.value = window.innerWidth <= 1024
}

onMounted(() => {
  updateViewportMode()
  window.addEventListener('resize', updateViewportMode)
  nextTick(() => syncLoadedIconsFromDom())
})

onUpdated(() => {
  syncLoadedIconsFromDom()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateViewportMode)
})

const redirectToPrefixDetail = () => {
  if (!process.client) return
  const target = `/${prefix}/detail/${encodeURIComponent(routeId)}`
  if (window.location.pathname !== target) {
    window.location.replace(target)
  }
}

watchEffect(() => {
  if (!app.value) return
  const appType = String(app.value.app_type || '').toLowerCase()
  if (appType === 'h5') {
    redirectToPrefixDetail()
  }
})

const rating = computed(() => Number(app.value?.rating || 0))
const ratingStars = computed(() => {
  const full = Math.floor(rating.value)
  return Array.from({ length: 5 }, (_, i) => i < full)
})

const editorHtml = computed(() => onlyDbText(article.value?.editors_review))
const howToHtml = computed(() => onlyDbText(article.value?.how_to_use))

const apkUrl = computed(() => toAbsUrl(app.value?.apk_url))
const googleLink = computed(() => toAbsUrl(app.value?.Google_link))
const appleLink = computed(() => toAbsUrl(app.value?.apple_link))
const hasApkUrl = computed(() => Boolean(String(app.value?.apk_url || '').trim()))
const appVersionText = computed(() => app.value?.app_version || app.value?.version || 'Latest')
const appSizeText = computed(() => parseSize(app.value?.apk_size || app.value?.size))
const appIcon = computed(() => toAbsUrl(app.value?.icon_url) || '/default-icon.png')

const screenshotRef = ref<HTMLElement | null>(null)
const moveScreens = (dir: 'prev' | 'next') => {
  const node = screenshotRef.value
  if (!node) return
  const amount = Math.max(320, Math.floor(node.clientWidth * 0.8))
  node.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' })
}

watchEffect(() => {
  if (!app.value) return

  const title = `${formatName(app.value.app_name)} - APK Download`
  const description = onlyDbText(app.value.summary) || `${formatName(app.value.app_name)} APK details, screenshots and updates.`

  useHead({
    title,
    meta: [
      { name: 'robots', content: 'noindex, nofollow' },
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: appIcon.value }
    ]
  })
})

usePrefixLink()
</script>

<template>
  <div class="replica-page">
    <AppHeader :logo-href="`/${prefix}/app`" class="reused-header" />

    <main class="shell">
      <template v-if="pending">
        <div class="state loading-state">
          <img src="/loading2.gif" alt="Loading..." class="loading-gif" />
          <p>Loading details...</p>
        </div>
      </template>

      <template v-else-if="error || !app">
        <div class="state">App Not Found</div>
      </template>

      <template v-else>
        <section class="top-strip">
          <a
            v-for="g in topStrip"
            :key="`top-${g.id}`"
            class="top-icon"
            :href="`/${prefix}/app/${encodeURIComponent(g.package_name || g.app_name)}`"
          >
            <div class="top-thumb">
              <div v-if="!isIconLoaded(makeIconKey('top', g))" class="icon-loading"></div>
              <img
                :src="toAbsUrl(g.icon_url) || '/default-icon.png'"
                :alt="g.app_name"
                :data-icon-key="makeIconKey('top', g)"
                :class="{ loaded: isIconLoaded(makeIconKey('top', g)) }"
                @load="markIconLoaded(makeIconKey('top', g))"
                @error="handleIconError($event, makeIconKey('top', g))"
              />
              <span class="top-name">{{ formatName(g.app_name) }}</span>
            </div>
          </a>
        </section>

        <div class="content-grid">
          <aside class="left-rail">
            <a
              v-for="g in sideList"
              :key="`side-${g.id}`"
              class="side-card"
              :href="`/${prefix}/app/${encodeURIComponent(g.package_name || g.app_name)}`"
            >
              <div class="side-icon-wrap">
                <div v-if="!isIconLoaded(makeIconKey('side', g))" class="icon-loading"></div>
                <img
                  :src="toAbsUrl(g.icon_url) || '/default-icon.png'"
                  :alt="g.app_name"
                  :data-icon-key="makeIconKey('side', g)"
                  class="side-icon"
                  :class="{ loaded: isIconLoaded(makeIconKey('side', g)) }"
                  @load="markIconLoaded(makeIconKey('side', g))"
                  @error="handleIconError($event, makeIconKey('side', g))"
                />
              </div>
              <div class="side-meta">
                <h5>{{ formatName(g.app_name) }}</h5>
                <p>★ {{ Number(g.rating || 0).toFixed(1) }}</p>
              </div>
            </a>
          </aside>

          <section class="detail-wrap">
            <div class="detail-main">
              <section class="hero-zone">
              <div v-if="!isNarrowViewport" class="card hero-detail-ad detail-ad-1">
                <AdSense ad-slot="9466235242" ad-format="auto" />
              </div>

              <article class="card hero-card">
                <div class="hero-top">
                  <img :src="appIcon" :alt="app.app_name" class="hero-icon" />
                  <div class="hero-info">
                    <h1>{{ formatName(app.app_name) }}</h1>
                    <p>{{ app.developer || 'Unknown Developer' }}</p>
                    <div class="star-row">
                      <span v-for="(on, i) in ratingStars" :key="i" :class="['star', { off: !on }]">★</span>
                      <span class="score">{{ rating.toFixed(1) }}</span>
                    </div>
                  </div>
                </div>

                <div v-if="isNarrowViewport" class="hero-inline-ad detail-ad-1">
                  <AdSense ad-slot="9466235242" ad-format="auto" />
                </div>

                <div class="facts">
                  <div>
                    <small>Installs</small>
                    <p>{{ app.installs || '--' }}</p>
                  </div>
                  <div>
                    <small>Category</small>
                    <p>{{ app.category || '--' }}</p>
                  </div>
                  <div>
                    <small>Content Rating</small>
                    <p>{{ app.content_rating || 'Teen' }}</p>
                  </div>
                </div>
              </article>
            </section>

            <article class="card shots-card">
              <div class="section-title-row">
                <h5>Screenshots</h5>
                <div class="shot-nav">
                  <button @click="moveScreens('prev')">‹</button>
                  <button @click="moveScreens('next')">›</button>
                </div>
              </div>

              <div ref="screenshotRef" class="shot-track">
                <a
                  v-for="(shot, idx) in screenshots"
                  :key="`${shot}-${idx}`"
                  class="shot-item"
                  href="javascript:;"
                >
                  <img :src="shot" :alt="`${app.app_name} screenshot ${idx + 1}`" />
                </a>
              </div>
            </article>

            <div class="card section-ad detail-ad-2">
              <AdSense ad-slot="8653010742" ad-format="auto" />
            </div>

            <article class="card text-card">
              <h5>Editor Reviews</h5>
              <div v-if="editorHtml" class="rich" v-html="editorHtml"></div>
              <p v-else class="empty">No editor review data.</p>
            </article>

            <article class="card text-card">
              <h5>How to play?</h5>
              <div v-if="howToHtml" class="rich" v-html="howToHtml"></div>
              <p v-else class="empty">No how-to data.</p>
            </article>

            <article class="card download-card">
              <h5>{{ hasApkUrl ? 'Download Apk File' : 'Download the App' }}</h5>

              <a
                v-if="hasApkUrl && apkUrl"
                class="download-row apk-row"
                :href="apkUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img :src="appIcon" :alt="app.app_name" class="apk-icon" />
                <div class="apk-meta">
                  <strong>{{ appVersionText }}</strong>
                  <small>{{ appSizeText }}</small>
                </div>
                <span class="dl-icon">⬇</span>
              </a>

              <div v-else-if="hasApkUrl" class="download-row disabled apk-row">
                <img :src="appIcon" :alt="app.app_name" class="apk-icon" />
                <div class="apk-meta">
                  <strong>{{ appVersionText }}</strong>
                  <small>{{ appSizeText }}</small>
                </div>
                <span class="dl-icon">—</span>
              </div>

              <div v-else class="download-group">
                <a
                  class="google-download"
                  :class="{ enable: !!googleLink, disable: !googleLink }"
                  :href="googleLink || 'javascript:;'"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src="/assets/yapi-google-logo.svg" alt="Google Play" />
                  <span>Download for Android</span>
                </a>

                <a
                  class="apple-download"
                  :class="{ enable: !!appleLink, disable: !appleLink }"
                  :href="appleLink || 'javascript:;'"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src="/assets/yapi-apple-logo.svg" alt="App Store" />
                  <span>Download for iOS</span>
                </a>
              </div>
            </article>

            <article class="card similar-card" v-if="similarGames.length">
              <h5>Similar Games</h5>
              <div class="similar-list">
                <a
                  v-for="g in similarGames"
                  :key="`similar-${g.id}`"
                  class="similar-item"
                  :href="`/${prefix}/app/${encodeURIComponent(g.package_name || g.app_name)}`"
                  :title="formatName(g.app_name)"
                >
                  <div class="similar-icon-wrap">
                    <div v-if="!isIconLoaded(makeIconKey('similar', g))" class="icon-loading"></div>
                    <img
                      :src="toAbsUrl(g.icon_url) || '/default-icon.png'"
                      :alt="g.app_name"
                      :data-icon-key="makeIconKey('similar', g)"
                      class="similar-icon"
                      :class="{ loaded: isIconLoaded(makeIconKey('similar', g)) }"
                      @load="markIconLoaded(makeIconKey('similar', g))"
                      @error="handleIconError($event, makeIconKey('similar', g))"
                    />
                  </div>
                  <div class="similar-meta">
                    <h6>{{ formatName(g.app_name) }}</h6>
                    <p>★ {{ Number(g.rating || 0).toFixed(1) }}</p>
                  </div>
                </a>
              </div>
            </article>

            <article class="card online-card">
              <h5>Online Games</h5>
              <div class="online-grid">
                <a
                  v-for="g in onlineGamesDisplay"
                  :key="`online-${g.id}`"
                  class="online-item"
                  :href="`/${prefix}/app/${encodeURIComponent(g.package_name || g.app_name)}`"
                >
                  <div class="online-thumb">
                    <div v-if="!isIconLoaded(makeIconKey('online', g))" class="icon-loading"></div>
                    <img
                      :src="toAbsUrl(g.icon_url) || '/default-icon.png'"
                      :alt="g.app_name"
                      :data-icon-key="makeIconKey('online', g)"
                      :class="{ loaded: isIconLoaded(makeIconKey('online', g)) }"
                      @load="markIconLoaded(makeIconKey('online', g))"
                      @error="handleIconError($event, makeIconKey('online', g))"
                    />
                    <span class="online-badge">H5</span>
                    <span class="online-name">{{ formatName(g.app_name) }}</span>
                  </div>
                </a>
              </div>
            </article>

            <article class="card disclaimer-card">
              <h5>Disclaimer</h5>
              <ol>
                <li>BLRSSCOGames does not represent any developer, nor is it the developer of any App or game.</li>
                <li>BLRSSCOGames provide screenshots, historical version Apk, links and other information, which we collected from Google Play. We will also add our own reviews to provide users with more information to choose.</li>
                <li>All trademarks, registered trademarks, product names and company names or logos appearing on the site are the property of their respective owners.</li>
                <li>BLRSSCOGames abides by the federal Digital Millennium Copyright Act (DMCA) by responding to notices of alleged infringement that complies with the DMCA and other applicable laws.</li>
                <li>We guarantee the security of apk files downloaded from our site and also provide the official download link at Google Play Store and App Store.</li>
                <li>If you are the owner or copyright representative and want to delete your information, please contact us <a href="mailto:contact@yapigames.com">contact@yapigames.com</a>.</li>
                <li>All the information on this website is strictly observed all the terms and conditions of <a href="https://support.google.com/adspolicy/answer/6020954" target="_blank" rel="noopener noreferrer">Google Ads Advertising policies</a> and <a href="https://www.google.com/about/unwanted-software-policy.html" target="_blank" rel="noopener noreferrer">Google Unwanted Software policy</a>.</li>
              </ol>
            </article>
            </div>
          </section>
        </div>
      </template>
    </main>

    <footer class="replica-footer">
      <div class="footer-links">
        <a :href="`/${prefix}/contact`">Contact Us</a>
        <a :href="`/${prefix}/privacy-policy`">Privacy Policy</a>
        <a :href="`/${prefix}/terms-of-service`">Legal Terms</a>
      </div>
      <div class="footer-about">
        <h3>About BLRSSCOGames</h3>
        <p>
          At BLRSSCOGames, we believe playing games should be simple, fun and instant. Discover games and play right in your browser.
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.replica-page {
  background: #f3f5f8;
  min-height: 100vh;
  color: #1f2f45;
  font-family: Arial, Helvetica, sans-serif;
}

.replica-header {
  height: 54px;
  background: #ffffff;
  border-bottom: 1px solid #d6dfe9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
}

.brand img {
  height: 26px;
  width: auto;
}

.search-box input {
  height: 30px;
  border: 1px solid #d6dfe9;
  border-radius: 4px;
  background: #f8fbff;
  padding: 0 10px;
  font-size: 12px;
}

.shell {
  max-width: 1220px;
  margin: 0 auto;
  padding: 10px;
}

.state {
  background: #fff;
  border: 1px solid #d4dfea;
  border-radius: 8px;
  padding: 16px;
}

.loading-state {
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #68809f;
}

.loading-gif {
  width: 72px;
  height: 72px;
  object-fit: contain;
}

.top-strip {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 6px;
  margin-bottom: 10px;
}

.top-icon {
  border: 1px solid #cfd9e8;
  border-radius: 6px;
  background: #fff;
  overflow: hidden;
  text-decoration: none;
  display: block;
  transform: translateY(0) scale(1);
  transition: transform 0.16s ease;
}

.top-thumb {
  position: relative;
  border-radius: 6px;
  overflow: hidden;
}

.icon-loading {
  position: absolute;
  inset: 0;
  background: #edf3fb url('/iconloading.gif') center/60% no-repeat;
  border-radius: inherit;
  z-index: 1;
  pointer-events: none;
}

.top-icon img {
  width: 100%;
  aspect-ratio: 1;
  display: block;
  object-fit: cover;
  opacity: 0;
  transform: scale(0.96);
  transition: opacity 0.18s ease, transform 0.18s ease, box-shadow 0.16s ease, border-color 0.16s ease;
}

.top-icon img.loaded {
  opacity: 1;
  transform: scale(1);
}

.top-name {
  position: absolute;
  left: 6px;
  right: 6px;
  bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: rgba(10, 18, 30, 0.58);
  color: #fff;
  font-size: 11px;
  line-height: 1.2;
  padding: 3px 6px;
  border-radius: 4px;
  text-align: center;
  opacity: 0;
  pointer-events: none;
  transform: translateY(6px);
  transition: opacity 0.16s ease, transform 0.16s ease;
  z-index: 4;
}

.top-icon:hover,
.top-icon:focus-visible,
.top-icon:active {
  transform: translateY(-3px) scale(1.05);
}

.top-icon:hover .top-name,
.top-icon:focus-visible .top-name,
.top-icon:active .top-name {
  opacity: 1;
  transform: translateY(0);
}

.content-grid {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 10px;
}

.left-rail {
  background: #2f72cc;
  border-radius: 6px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.side-card {
  background: #fff;
  border-radius: 10px;
  border: 1px solid #d2ddeb;
  padding: 8px;
  display: flex;
  gap: 10px;
  text-decoration: none;
  color: #20334f;
  transform: translateY(0) scale(1);
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}

.side-card:hover,
.side-card:focus-visible,
.side-card:active {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 16px rgba(13, 50, 104, 0.22);
}

.side-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  flex: 0 0 auto;
  background: #edf3fb;
}

.side-icon {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  object-fit: cover;
  opacity: 0;
  transform: scale(0.96);
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.side-icon.loaded {
  opacity: 1;
  transform: scale(1);
}

.side-meta {
  min-width: 0;
}

.side-meta h5 {
  margin: 0;
  font-size: 14px;
  line-height: 1.25;
  color: #111c2b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.side-meta p {
  margin: 6px 0 0;
  color: #f3ab0e;
  font-size: 18px;
  line-height: 1;
}

.detail-wrap {
  display: flex;
  flex-direction: column;
}

.detail-main {
  background: #fff;
  border: 1px solid #d4deeb;
  border-radius: 8px;
  overflow: hidden;
}

.detail-main > * {
  border-bottom: 1px solid #e2e9f3;
}

.detail-main > *:last-child {
  border-bottom: 0;
}

.hero-zone {
  display: grid;
  grid-template-columns: minmax(360px, 42%) minmax(0, 1fr);
  gap: 12px;
  padding: 16px;
  background: #fff;
}

.hero-detail-ad {
  padding: 10px;
  border: 1px solid #d7e2ef;
  border-radius: 8px;
  background: #f4f8fd;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 280px;
}

.hero-detail-ad :deep(.adsense-container) {
  min-height: 240px;
}

.hero-inline-ad {
  margin-top: 14px;
  border: 1px solid #d5dfed;
  border-radius: 8px;
  padding: 8px;
  background: #f8fbff;
}

.hero-inline-ad :deep(.adsense-container) {
  min-height: 90px;
}

.section-ad {
  padding: 10px 16px;
  background: #fff;
}

.section-ad :deep(.adsense-container) {
  min-height: 110px;
}

.card {
  background: transparent;
  border: 0;
  border-radius: 0;
  padding: 14px 16px;
}

.hero-card {
  padding: 0;
}

.hero-top {
  display: flex;
  gap: 18px;
  align-items: flex-start;
}

.hero-icon {
  width: 132px;
  height: 132px;
  border-radius: 24px;
  object-fit: cover;
  flex: 0 0 auto;
}

.hero-info h1 {
  margin: 0;
  font-size: clamp(20px, 1.9vw, 30px);
  line-height: 1.08;
  font-weight: 700;
}

.hero-info p {
  margin: 8px 0 10px;
  color: #627692;
  font-size: clamp(16px, 1.4vw, 28px);
}

.star-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.star {
  color: #f3b216;
  font-size: clamp(18px, 1.5vw, 26px);
}

.star.off {
  color: #d0d9e8;
}

.score {
  font-size: clamp(18px, 1.5vw, 28px);
  color: #2d4364;
}

.facts {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.facts > div {
  border: 1px solid #dde6f1;
  border-radius: 8px;
  padding: 14px 16px;
  min-height: 84px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.facts small {
  font-size: clamp(12px, 1.1vw, 18px);
  color: #6b7f9b;
}

.facts p {
  margin: 4px 0 0;
  font-size: clamp(15px, 1.2vw, 22px);
  font-weight: 700;
  color: #233b5a;
  line-height: 1.15;
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.card h5 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #253a59;
}

.shot-nav {
  display: flex;
  gap: 5px;
}

.shot-nav button {
  width: 20px;
  height: 20px;
  border: 1px solid #d5dfec;
  border-radius: 999px;
  background: #f8fbff;
  font-size: 12px;
  color: #365173;
  cursor: pointer;
}

.shot-track {
  display: flex;
  gap: 7px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}

.shot-item {
  flex: 0 0 min(410px, 85%);
  border-radius: 6px;
  border: 1px solid #d4ddec;
  overflow: hidden;
  scroll-snap-align: start;
}

.shot-item img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  display: block;
}

.rich {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.7;
  color: #324a69;
}

.empty {
  margin-top: 8px;
  font-size: 13px;
  color: #8a9bb5;
}

.download-row {
  margin-top: 8px;
  padding: 9px 10px;
  border: 1px solid #d5dfed;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-decoration: none;
  color: #20334f;
  background: #fafcff;
}

.apk-row {
  gap: 10px;
}

.apk-icon {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  object-fit: cover;
  flex: 0 0 auto;
  border: 1px solid #d9e1ec;
}

.apk-meta {
  min-width: 0;
  flex: 1;
}

.download-row strong {
  display: block;
  font-size: 13px;
}

.download-row small {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  color: #73849e;
}

.download-row.disabled {
  opacity: 0.65;
}

.dl-icon {
  font-size: 28px;
  color: #3b82f6;
  line-height: 1;
}

.download-group {
  width: 100%;
  margin-top: 0.8rem;
  display: grid;
  grid-template-columns: repeat(2, calc((100% - 1.2rem) / 2));
  column-gap: 1.2rem;
  min-height: 35px;
}

.download-group a {
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
  background-color: rgba(0, 201, 169, 0.05);
  border: 1px solid #00a890;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: none;
  text-decoration: none;
  padding: 0.5rem 0;
  box-sizing: border-box;
}

.download-group a img {
  height: 26px;
  width: auto;
}

.download-group a span {
  font-size: 12px;
  color: gray;
  margin-top: 0.3rem;
}

.download-group .enable {
  opacity: 1;
  cursor: pointer;
  pointer-events: all;
}

.download-group .disable {
  opacity: 0.3;
}

.similar-card {
  display: none;
}

.similar-list {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.similar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #1a2638;
  background: #fff;
  border: 1px solid #d8e2ef;
  border-radius: 10px;
  padding: 10px;
  transform: translateY(0) scale(1);
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}

.similar-item:hover,
.similar-item:focus-visible,
.similar-item:active {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 16px rgba(17, 56, 109, 0.18);
}

.similar-icon-wrap {
  width: 86px;
  height: 86px;
  border-radius: 12px;
  border: 1px solid #d5dfec;
  overflow: hidden;
  position: relative;
  background: #edf3fb;
  flex: 0 0 auto;
}

.similar-icon {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  object-fit: cover;
  display: block;
  opacity: 0;
  transform: scale(0.96);
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.similar-icon.loaded {
  opacity: 1;
  transform: scale(1);
}

.similar-meta {
  min-width: 0;
}

.similar-meta h6 {
  margin: 0;
  font-size: 20px;
  line-height: 1.2;
  color: #121d2e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.similar-meta p {
  margin: 8px 0 0;
  font-size: 30px;
  line-height: 1;
  color: #f2ad1a;
}

.online-grid {
  margin-top: 8px;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.online-item {
  text-decoration: none;
  color: #2b3f60;
  font-size: 11px;
  text-align: center;
  display: block;
  transform: translateY(0) scale(1);
  transition: transform 0.16s ease;
  position: relative;
}

.online-thumb {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.online-item img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #d5dfec;
  display: block;
  margin-bottom: 0;
  opacity: 0;
  transform: scale(0.96);
  transition: opacity 0.18s ease, transform 0.18s ease, box-shadow 0.16s ease, border-color 0.16s ease;
}

.online-item img.loaded {
  opacity: 1;
  transform: scale(1);
}

.online-badge {
  position: absolute;
  top: 0;
  right: 0;
  width: 33.3333%;
  aspect-ratio: 1;
  background: rgba(255, 132, 188, 0.95);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 8px 0 8px;
  z-index: 5;
  pointer-events: none;
}

.online-name {
  position: absolute;
  left: 6px;
  right: 6px;
  bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: rgba(10, 18, 30, 0.5);
  color: #fff;
  font-size: 14px;
  line-height: 1.2;
  padding: 3px 6px;
  border-radius: 4px;
  text-align: center;
  opacity: 0;
  pointer-events: none;
  transform: translateY(6px);
  transition: opacity 0.16s ease, transform 0.16s ease;
  z-index: 4;
}

.online-item:hover,
.online-item:focus-visible {
  transform: translateY(-4px) scale(1.05);
}

.online-item:hover img,
.online-item:focus-visible img {
  border-color: #8db8ff;
  box-shadow: 0 8px 18px rgba(18, 64, 124, 0.25);
}

.online-item:hover .online-name,
.online-item:focus-visible .online-name {
  opacity: 1;
  transform: translateY(0);
}

.disclaimer-card ol {
  margin: 8px 0 0 16px;
  padding: 0;
  color: #4a5f7d;
  font-size: 12px;
  line-height: 1.6;
}

.replica-footer {
  margin-top: 12px;
  background: #2f72cc;
  color: #fff;
  padding: 14px 12px 16px;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 12px;
}

.footer-links a {
  color: #fff;
  text-decoration: none;
  font-size: 12px;
}

.footer-about {
  max-width: 1220px;
  margin: 0 auto;
}

.footer-about h3 {
  margin: 0 0 6px;
  font-size: 24px;
  font-weight: 700;
}

.footer-about p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
}

@media (max-width: 1024px) {
  .top-strip {
    grid-template-columns: repeat(8, minmax(0, 1fr));
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .hero-zone {
    grid-template-columns: 1fr;
  }

  .hero-icon {
    width: 108px;
    height: 108px;
    border-radius: 20px;
  }

  .hero-info h1 {
    font-size: clamp(20px, 3.2vw, 28px);
  }

  .hero-info p {
    font-size: clamp(13px, 2vw, 18px);
  }

  .facts p {
    font-size: clamp(14px, 2.3vw, 20px);
  }

  .left-rail {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .online-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .shell {
    padding: 0;
  }

  .replica-header {
    height: 50px;
    padding: 0 8px;
  }

  .brand img {
    height: 24px;
  }

  .search-box {
    max-width: 150px;
  }

  .search-box input {
    width: 100%;
    height: 32px;
    border-radius: 16px;
    background: #f0f2f5;
  }

  .top-strip,
  .left-rail {
    display: none;
  }

  .content-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .detail-wrap {
    gap: 0;
  }

  .detail-main {
    border-left: 0;
    border-right: 0;
    border-radius: 0;
  }

  .hero-zone {
    padding: 12px;
    gap: 10px;
  }

  .card {
    border-left: 0;
    border-right: 0;
    border-radius: 0;
    padding: 14px 12px;
  }

  .hero-icon {
    width: 80px;
    height: 80px;
    border-radius: 16px;
  }

  .hero-info h1 {
    font-size: 24px;
    line-height: 1.1;
  }

  .facts {
    margin-top: 12px;
    grid-template-columns: 1fr;
    gap: 0;
    border-top: 1px solid #e7ecf3;
  }

  .facts > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    padding: 9px 0;
    border-bottom: 1px solid #eceff5;
  }

  .facts small {
    font-size: 14px;
    color: #1f2f45;
    font-weight: 600;
  }

  .facts p {
    margin: 0;
    max-width: 56%;
    text-align: right;
    font-size: 14px;
    color: #6f809a;
  }

  .section-title-row {
    margin: -14px -12px 10px;
    padding: 10px 12px;
    background: #0f76d8;
  }

  .section-title-row h5 {
    color: #fff;
  }

  .shot-item {
    flex: 0 0 100%;
    border: 0;
  }

  .similar-card {
    display: block;
  }

  .similar-list {
    gap: 12px;
  }

  .similar-item {
    padding: 10px;
    border-radius: 10px;
  }

  .similar-icon-wrap {
    width: 84px;
    height: 84px;
    border-radius: 10px;
    border: 0;
  }

  .similar-icon {
    border-radius: 10px;
  }

  .similar-meta h6 {
    font-size: 15px;
    line-height: 1.2;
  }

  .similar-meta p {
    margin-top: 7px;
    font-size: 18px;
    line-height: 1;
  }

  .online-card {
    background: #0f76d8;
    border-color: #0f76d8;
  }

  .online-card h5 {
    color: #fff;
  }

  .online-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .online-item {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .online-item,
  .online-item:hover,
  .online-item:focus-visible {
    transform: none;
  }

  .online-item:active,
  .online-item:focus,
  .online-item:focus-visible {
    transform: translateY(-4px) scale(1.05);
  }

  .online-item img,
  .online-item:hover img,
  .online-item:focus-visible img {
    border: 1px solid transparent;
    box-shadow: none;
  }

  .online-item:active img,
  .online-item:focus img,
  .online-item:focus-visible img {
    border-color: #ff9ccc;
    box-shadow: 0 8px 18px rgba(179, 42, 118, 0.35);
  }

  .online-name {
    display: block;
    left: 4px;
    right: 4px;
    bottom: 4px;
    font-size: 11px;
    padding: 2px 4px;
    opacity: 0;
    transform: translateY(6px);
  }

  .online-item:active .online-name,
  .online-item:focus .online-name,
  .online-item:focus-visible .online-name {
    opacity: 1;
    transform: translateY(0);
  }

  .disclaimer-card ol {
    margin: 10px 0 0 18px;
    font-size: 14px;
    line-height: 1.8;
  }

  .replica-footer {
    margin-top: 0;
    padding: 12px;
  }

  .footer-links {
    gap: 14px;
    margin-bottom: 8px;
    flex-wrap: wrap;
  }

  .footer-about h3 {
    font-size: 16px;
  }

  .footer-about p {
    font-size: 12px;
  }
}
</style>
