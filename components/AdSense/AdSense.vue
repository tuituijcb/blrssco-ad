<template>
  <client-only v-if="adsEnabled">
    <div class="adsense-container" :key="`ad-${adSlot}`">
      <ins 
        ref="adElement"
        class="adsbygoogle"
        :style="style"
        data-ad-client="ca-pub-6686541399117634"
        :data-ad-slot="adSlot"
        :data-ad-format="adFormat"
        :data-full-width-responsive="responsive.toString()">
      </ins>
    </div>
    <template #fallback>
      <div class="ad-placeholder" :style="style">
        <!-- 广告加载中的占位符 -->
      </div>
    </template>
  </client-only>
</template>

<script setup>
import { trackAdClick, untrackAdClick } from '~/utils/adClickTracker'

const { enableAds } = useRuntimeConfig().public
const adsEnabled = enableAds !== false && enableAds !== 'false'
const adElement = ref(null)

const props = defineProps({
  adSlot: { type: String, required: true },
  adFormat: { type: String, default: 'auto' },
  style: { type: String, default: 'display:block' },
  responsive: { type: [Boolean, String], default: true }
})

onMounted(() => {
  // 动态加载 AdSense script（只加载一次，即使广告位关闭也保留给 Google 验证）
  if (!document.querySelector('script[src*="adsbygoogle"]')) {
    const s = document.createElement('script')
    s.async = true
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6686541399117634'
    s.crossOrigin = 'anonymous'
    document.head.appendChild(s)
  }

  if (!adsEnabled) return

  if (adElement.value) {
    trackAdClick(adElement.value, props.adSlot, (slot) => {
      // Version 37 still runs the legacy GTM detector. Avoid duplicate events
      // until Version 38 pauses that tag and the source tracker takes over.
      if (window.IframeOnClick) return

      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({
        event: 'i_c',
        event_category: 'IC',
        event_action: 'i_c',
        ad_slot: slot,
      })
    })
  }

  // 如果AdSense脚本已加载但广告位没有被处理，手动触发一次
  if (window.adsbygoogle && window.adsbygoogle.loaded) {
    setTimeout(() => {
      const adElement = document.querySelector(`[data-ad-slot="${props.adSlot}"]`)
      if (adElement && !adElement.getAttribute('data-adsbygoogle-status')) {
        try {
          window.adsbygoogle.push({})
        } catch (error) {
          // 静默处理错误
        }
      }
    }, 1000)
  }
})

onBeforeUnmount(() => {
  if (adElement.value) {
    untrackAdClick(adElement.value)
  }
})
</script>

<style scoped>
.adsense-container {
  width: 100%;
  display: block;
  text-align: center;
  position: relative;
  overflow: hidden;
}

/* Only show space when ad actually loads */
.adsense-container:empty {
  display: none;
}

.adsbygoogle {
  display: block !important;
  width: 100% !important;
  max-width: 100% !important;
}

/* 强制显示广告iframe */
.adsense-container :deep(iframe) {
  display: block;
}

.ad-placeholder {
  width: 100%;
  display: none;
}
</style>
