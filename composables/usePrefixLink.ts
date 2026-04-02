import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

declare global {
  interface Window {
    __globalPrefix?: string
  }
}

export function usePrefixLink() {
  const route = useRoute()
  const prefix = Array.isArray(route.params.prefix) ? route.params.prefix[0] : route.params.prefix

  if (typeof window !== 'undefined') {
    if (/^\d{3}$/.test(prefix)) {
      window.__globalPrefix = prefix
    } else {
      window.__globalPrefix = ''
    }
  }

  function patchAllLinks() {
    if (typeof window === 'undefined') return
    const prefix = window.__globalPrefix
    if (!prefix) return
    document.querySelectorAll('a').forEach(a => {
      const href = a.getAttribute('href')
      // 更严格的过滤条件
      if (!href ||
          href.startsWith('http') ||
          href.startsWith('https') ||
          href.startsWith('#') ||
          href.startsWith('mailto:') ||
          href.startsWith('javascript:') ||
          href.includes('.jpg') ||
          href.includes('.png') ||
          href.includes('.gif') ||
          href.includes('.webp') ||
          href.includes('.svg') ||
          href.includes('games.blrssco.com')) return
      if (href.match(/^\/\d{3}\//)) return
      const newHref = href.startsWith('/') ? `/${prefix}${href}` : `/${prefix}/${href}`
      a.setAttribute('href', newHref)
    })
  }

  onMounted(() => {
    patchAllLinks()
  })
  watch(() => route.fullPath, () => {
    patchAllLinks()
  })
} 