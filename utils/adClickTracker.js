let isRunning = false
const trackedAds = []

export function trackAdClick(insElement, adSlot, onClickCallback) {
  if (!insElement || typeof window === 'undefined') return

  trackedAds.push({
    ins: insElement,
    iframe: null,
    clicked: false,
    slot: adSlot,
    cb: onClickCallback,
  })

  if (!document.body.getAttribute('tabindex')) {
    document.body.setAttribute('tabindex', '-1')
  }

  if (!isRunning) {
    isRunning = true
    requestAnimationFrame(checkLoop)
  }
}

export function untrackAdClick(insElement) {
  const index = trackedAds.findIndex(ad => ad.ins === insElement)
  if (index >= 0) trackedAds.splice(index, 1)

  if (trackedAds.length === 0) {
    isRunning = false
  }
}

function checkLoop() {
  if (!isRunning) return

  for (const ad of trackedAds) {
    if (!ad.iframe) {
      const iframe = ad.ins.querySelector('iframe')
      if (iframe) {
        ad.iframe = iframe
        iframe.setAttribute('tabindex', '-1')

        const originalBlur = iframe.blur
        iframe.blur = function () {
          originalBlur.call(this)
          try {
            document.body.focus()
          } catch (_) {}
        }
      }
      continue
    }

    if (document.activeElement === ad.iframe) {
      if (!ad.clicked) {
        ad.clicked = true
        try {
          ad.cb(ad.slot)
        } catch (_) {}
      }
    } else {
      ad.clicked = false
    }
  }

  requestAnimationFrame(checkLoop)
}
