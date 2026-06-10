let vignetteDetected = false
let clickFired = false

export function initVignetteTracker() {
  if (typeof window === 'undefined' || vignetteDetected) return

  const check = () => {
    if (!vignetteDetected && window.location.hash === '#google_vignette') {
      vignetteDetected = true
      monitorVignetteClick()
    }
  }

  window.addEventListener('hashchange', check)

  let lastHash = window.location.hash
  const interval = setInterval(() => {
    if (window.location.hash !== lastHash) {
      lastHash = window.location.hash
      check()
    }
    if (vignetteDetected) clearInterval(interval)
  }, 500)

  check()
  setTimeout(() => clearInterval(interval), 5 * 60 * 1000)
}

function monitorVignetteClick() {
  if (clickFired) return

  let lastFocusOnIframe = false

  function checkFocus() {
    if (clickFired) return

    const activeElement = document.activeElement
    if (activeElement && activeElement.tagName === 'IFRAME') {
      lastFocusOnIframe = true
    }

    if (window.location.hash === '#google_vignette') {
      requestAnimationFrame(checkFocus)
    }
  }

  function fireClick() {
    if (clickFired) return

    clickFired = true
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      event: 'vignette_click',
      event_category: 'IC',
      event_action: 'vig_c',
    })
  }

  function onHashChange() {
    if (window.location.hash !== '#google_vignette') {
      cleanup()
    }
  }

  function onPageHide() {
    if (window.location.hash === '#google_vignette' && lastFocusOnIframe) {
      fireClick()
    }
    cleanup()
  }

  function onVisibilityChange() {
    if (clickFired || !document.hidden) return

    if (window.location.hash === '#google_vignette' && lastFocusOnIframe) {
      setTimeout(() => {
        if (document.hidden) fireClick()
      }, 500)
    }
  }

  function cleanup() {
    window.removeEventListener('hashchange', onHashChange)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    window.removeEventListener('pagehide', onPageHide)
  }

  window.addEventListener('hashchange', onHashChange)
  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('pagehide', onPageHide, { once: true })

  requestAnimationFrame(checkFocus)
  setTimeout(cleanup, 2 * 60 * 1000)
}
