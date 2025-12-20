import { eventBus, gridPixelToWplaceColor } from '@extension/shared'

let editorTile: { x: number; y: number } = { x: 0, y: 0 }
let editorPixel: { x: number; y: number } = { x: 0, y: 0 }

export const setupEventListeners = () => {
  // Listen for editor open events and forward with coordinates
  eventBus.on('editor:open', event => {
    console.log('[Main] Editor open event received:', event.detail)
    console.log('[Main] Forwarding with coordinates:', {
      tile: editorTile,
      pixel: editorPixel,
    })

    // Re-dispatch with tile and pixel coordinates
    eventBus.dispatch('editor:open:with-coords', {
      ...event.detail,
      tile: editorTile,
      pixel: editorPixel,
    })
  })

  // Listen for editor close events
  eventBus.on('editor:close', event => {
    console.log('[Main] Editor close event received:', event.detail)
  })

  // Listen for paint click events
  eventBus.on('paint:click', event => {
    console.log('[Main] Paint click event received:', event.detail)
  })

  // TODO: Remove this once pixel-editor's pixels is drawing pixels
  // Listen for pixel data marker events from map hijack
  // eventBus.on('pixeldata:marker', event => {
  //   console.log('[Main] Pixel data marker received:', event.detail)

  //   const { tX, tY, pX, pY, s, value } = event.detail

  //   // Calculate position 1 pixel to the right
  //   const newPX = pX + 1

  //   // Create the new key for the pixel 1px to the right
  //   const newKey = `t=(${tX},${tY});p=(${newPX},${pY});s=${s}`

  //   // Create the new value (same as original)
  //   const newValue = {
  //     ...(value as object),
  //     pixel: [newPX, pY],
  //   }

  //   console.log('[Main] Sending pixel 1px to the right:', { newKey, newValue })

  //   // Send back to page context to add to the map
  //   eventBus.dispatch('pixeldata:add', {
  //     key: newKey,
  //     value: newValue,
  //   })
  // })

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

  // Listen for pixel grid data from editor and paint pixels
  eventBus.on('editor:grid:data', async function (event) {
    console.log('[Main] Received pixel grid data:', event.detail)
    try {
      const { pixels } = event.detail

      if (pixels && pixels.length > 0) {
        console.log('[Main] Processing', pixels.length, 'pixels')

        // 0. add pixels to the map
        for (const pixel of pixels) {
          eventBus.dispatch(
            'pixeldata:add',
            gridPixelToWplaceColor(pixel, editorTile),
          )
        }

        // 1. click on Paint
        ;(
          document.querySelector('.bottom-0 .btn-primary') as HTMLElement
        ).click()
        await new Promise(resolve => setTimeout(resolve, 1000))
        // 2. select the color 0
        ;(document.querySelector('#color-0') as HTMLElement).click()
        await new Promise(resolve => setTimeout(resolve, 1000))
        // this should catch the map reference in the window.currentMapRef

        // 3. click on Paint button again actually appends the write
        ;(
          document.querySelector('.bottom-0 .btn-primary') as HTMLElement
        ).click()

        const colorElement = document.querySelector('#color-0')

        if (colorElement) {
          console.log('[Main] Found #color-0, simulating click')
          ;(colorElement as HTMLElement).click()
          console.log('[Main] Clicked #color-0')
        } else {
          console.log('[Main] Could not find #color-0 element')
        }

        /// maybe this does not work and I should only store these data and use the eventBus.on('pixeldata:marker', event => { to paint

        // TODO: Later we will iterate through pixels and add them to the map
        // For now, just log the first pixel
        if (pixels.length > 0) {
          console.log('[Main] First pixel:', pixels[0])
        }
      }
    } catch (error) {
      console.error('[Main] Error processing pixel grid data:', error)
    }
  })

  console.log('[Main] Event listeners registered')
}
