import { eventBus } from '@src/lib/event-bus'

let editorTile: { x: number; y: number } = { x: 0, y: 0 }
let editorPixel: { x: number; y: number } = { x: 0, y: 0 }

/**
 * Set up event listeners for application events
 */
export const setupEventListeners = () => {
  // Listen for editor open events
  eventBus.on('editor:open', event => {
    console.log('[Main] Editor open event received:', event.detail)
    // TODO: Implement actual editor functionality
    // For now, show an alert
    alert('Editor functionality coming soon!')
  })

  // Listen for editor close events
  eventBus.on('editor:close', event => {
    console.log('[Main] Editor close event received:', event.detail)
  })

  // Listen for paint click events
  eventBus.on('paint:click', event => {
    console.log('[Main] Paint click event received:', event.detail)
  })

  // Listen for pixel data marker events from map hijack
  eventBus.on('pixeldata:marker', event => {
    console.log('[Main] Pixel data marker received:', event.detail)

    const { tX, tY, pX, pY, s, value } = event.detail

    // Calculate position 1 pixel to the right
    const newPX = pX + 1

    // Create the new key for the pixel 1px to the right
    const newKey = `t=(${tX},${tY});p=(${newPX},${pY});s=${s}`

    // Create the new value (same as original)
    const newValue = {
      ...(value as object),
      pixel: [newPX, pY],
    }

    console.log('[Main] Sending pixel 1px to the right:', { newKey, newValue })

    // Send back to page context to add to the map
    eventBus.dispatch('pixeldata:add', {
      key: newKey,
      value: newValue,
    })
  })

  // Listen for fetch intercepted events
  eventBus.on('fetch:intercepted', event => {
    console.log('[Main] Fetch intercepted:', event.detail)
    const match = event.detail.url.match(
      /https:\/\/backend\.\wplace\.live\/s0\/pixel\/(\d+)\/(\d+)\?x=(\d+)&y=(\d+)/,
    )

    if (match && match.length === 5) {
      editorTile = {
        x: parseInt(match[1]),
        y: parseInt(match[2]),
      }
      editorPixel = {
        x: parseInt(match[3]),
        y: parseInt(match[4]),
      }
      console.log('[Main] Editor tile and pixel set:', {
        editorTile,
        editorPixel,
      })
    }
  })

  console.log('[Main] Event listeners registered')
}
