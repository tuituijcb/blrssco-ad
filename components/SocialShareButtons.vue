<template>
  <div v-if="showButtons" :class="['fixed left-0 top-1/2 transform -translate-y-1/2 z-50 flex flex-col items-center transition-all duration-300', isMobile ? 'translate-x-0' : '']">
    <!-- 分享按钮展开/折叠控制按钮 - 仅在移动端显示 -->
    <button
      v-if="isMobile"
      @click="toggleExpand"
      class="bg-orange-500 text-white p-3 rounded-r-md mb-2 shadow-md hover:bg-orange-600 transition-colors"
      :aria-label="isExpanded ? 'Collapse sharing menu' : 'Expand sharing menu'"
    >
      <svg v-if="isExpanded" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    </button>

    <div :class="['flex flex-col shadow-lg transition-all duration-300', isMobile && !isExpanded ? 'opacity-0 -translate-x-full' : 'opacity-100 translate-x-0']">
      <component
        v-for="(item, index) in shareData"
        :key="index"
        :is="item.action ? 'button' : 'a'"
        v-bind="item.action ? { type: 'button', onClick: item.action } : { href: item.url, target: '_blank', rel: 'noopener noreferrer' }"
        :class="[item.bg, 'text-white p-3 flex items-center justify-center hover:opacity-90 transition-opacity']"
        :aria-label="item.action ? 'Copy link' : `Share on ${item.name}`"
      >
        <span v-html="item.icon" />
        <span class="sr-only">{{ item.action ? 'Copy link' : `Share on ${item.name}` }}</span>
      </component>
    </div>

    <button
      @click="scrollToTop"
      :class="['mt-4 bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 transition-colors shadow-md', isMobile && !isExpanded ? 'opacity-100' : '']"
      aria-label="Back to top"
    >
      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const showButtons = ref(false)
const isExpanded = ref(false)
const isMobile = ref(false)

const handleScroll = () => {
  showButtons.value = window.scrollY > 300
}

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  handleResize()
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
})

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const shareUrl = computed(() => typeof window !== 'undefined' ? window.location.href : '')
const title = "I just discovered thousands of free online games! I'm playing now—come join me and share with friends!"

// SVG 图标定义
const facebookSvg = `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>`

const twitterSvg = `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>`

const whatsappSvg = `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>`

const telegramSvg = `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>`

const copySvg = `<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><rect x="2" y="2" width="13" height="13" rx="2"/></svg>`

function copyLink() {
  if (typeof window !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        alert('Link copied to clipboard!')
      })
      .catch(() => {
        // 降级方案
        const textArea = document.createElement('textarea')
        textArea.value = window.location.href
        document.body.appendChild(textArea)
        textArea.select()
        try {
          document.execCommand('copy')
          alert('Link copied to clipboard!')
        } catch (err) {
          alert('Copy failed, please copy manually')
        }
        document.body.removeChild(textArea)
      })
  } else {
    alert('Clipboard not supported')
  }
}

const shareData = computed(() => [
  {
    name: 'Facebook',
    icon: facebookSvg,
    bg: 'bg-blue-600',
    url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl.value)}`
  },
  {
    name: 'Twitter',
    icon: twitterSvg,
    bg: 'bg-black',
    url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl.value)}`
  },
  {
    name: 'WhatsApp',
    icon: whatsappSvg,
    bg: 'bg-green-500',
    url: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + shareUrl.value)}`
  },
  {
    name: 'Telegram',
    icon: telegramSvg,
    bg: 'bg-blue-400',
    url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl.value)}&text=${encodeURIComponent(title)}`
  },
  {
    name: 'Copy Link',
    icon: copySvg,
    bg: 'bg-gray-500',
    action: copyLink
  }
])
</script>

<style scoped>
/* 确保在 Tailwind 未加载时有基本样式 */
.fixed {
  position: fixed;
}

.left-0 {
  left: 0;
}

.top-1\/2 {
  top: 50%;
}

.transform {
  transform: translateY(-50%);
}

.z-50 {
  z-index: 50;
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.transition-all {
  transition: all 0.3s ease;
}

.bg-orange-500 {
  background-color: #f97316;
}

.bg-blue-600 {
  background-color: #2563eb;
}

.bg-black {
  background-color: #000000;
}

.bg-green-500 {
  background-color: #22c55e;
}

.bg-blue-400 {
  background-color: #60a5fa;
}

.bg-gray-500 {
  background-color: #6b7280;
}

.text-white {
  color: white;
}

.p-3 {
  padding: 0.75rem;
}

.rounded-r-md {
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
}

.rounded-full {
  border-radius: 9999px;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mt-4 {
  margin-top: 1rem;
}

.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.hover\:bg-orange-600:hover {
  background-color: #ea580c;
}

.hover\:opacity-90:hover {
  opacity: 0.9;
}

.transition-colors {
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out;
}

.transition-opacity {
  transition: opacity 0.15s ease-in-out;
}

.h-5 {
  height: 1.25rem;
}

.w-5 {
  width: 1.25rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.opacity-0 {
  opacity: 0;
}

.opacity-100 {
  opacity: 1;
}

.-translate-x-full {
  transform: translateX(-100%);
}

.translate-x-0 {
  transform: translateX(0);
}

@media (max-width: 768px) {
  .md\:hidden {
    display: none;
  }
}
</style> 