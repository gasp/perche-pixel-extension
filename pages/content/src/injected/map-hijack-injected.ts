/**
 * This script runs in the PAGE CONTEXT (not content script context)
 * It hijacks Map.prototype.set to intercept pixel data
 */

// Make this file a module so we can use declare global
export {}

// Augment Window interface to include currentMapRef
declare global {
  interface Window {
    currentMapRef: Map<unknown, unknown> | null
  }
}

;(function () {
  const TRIGGER_COLOR_IDX = 1
  // Matches t=(###,###);p=(###,###);s=# with capture groups
  const KEY_PATTERN =
    /^t=\((\d{1,4}),(\d{1,4})\);p=\((\d{1,4}),(\d{1,4})\);s=(\d)$/

  const originalSet = Map.prototype.set

  // Store the current Map reference for adding pixels later
  window.currentMapRef = null

  console.log('🎯 [Page Context] Hijacking Map.prototype.set')

  // Listen for messages from content script
  window.addEventListener('message', (event: MessageEvent) => {
    if (
      event.source !== window ||
      !event.data ||
      event.data.source !== 'perche-pixel-extension-response'
    ) {
      return
    }

    if (event.data.type === 'CLEAR_MARKER') {
      console.log('🎯 [Page Context] Received CLEAR_MARKER request')

      // Clear the entire map
      if (window.currentMapRef) {
        window.currentMapRef.clear()
        console.log('🎯 [Page Context] Cleared map')
      } else {
        console.warn('🎯 [Page Context] No map reference available')
      }
    }

    if (event.data.type === 'ADD_PIXEL') {
      const { key, value } = event.data.payload
      console.log('🎯 [Page Context] Received ADD_PIXEL request:', {
        key,
        value,
      })

      // Add the new pixel to the stored Map reference
      if (window.currentMapRef) {
        originalSet.call(window.currentMapRef, key, value)
        console.log('🎯 [Page Context] Added pixel to map:', key)
      } else {
        console.warn('🎯 [Page Context] No map reference available')
      }
    }
  })

  Map.prototype.set = function (key: unknown, value: unknown) {
    let isTrigger = false

    // Uncomment to see all Map.set calls

    const match = typeof key === 'string' ? key.match(KEY_PATTERN) : null
    if (match) {
      console.log('[Map.set] Pattern match found:', { key, value })
      if ((value as { colorIdx?: number })?.colorIdx === TRIGGER_COLOR_IDX) {
        isTrigger = true
      }
    }

    if (isTrigger && match) {
      // Store reference to this Map instance for later use
      window.currentMapRef = this as Map<unknown, unknown>

      // Extract numbers: match[0] is full string, match[1-5] are captures
      const tX = parseInt(match[1])
      const tY = parseInt(match[2])
      const pX = parseInt(match[3])
      const pY = parseInt(match[4])
      const s = parseInt(match[5])

      console.log('🎯 [Map.set] MARKER DETECTED:', { tX, tY, pX, pY, s, value })

      // Send message to content script via postMessage
      window.postMessage(
        {
          type: 'PIXELDATA_MARKER',
          source: 'perche-pixel-extension',
          payload: { tX, tY, pX, pY, s, value },
        },
        '*',
      )
    }

    // Always call original method
    return originalSet.call(this, key, value)
  }

  console.log('🎯 [Page Context] Map.prototype.set hijacked successfully')
})()
