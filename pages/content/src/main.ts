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

        // 1. click on Paint
        const startPaintButton: HTMLButtonElement | null =
          document.querySelector('.bottom-0 button.btn-primary')
        if (startPaintButton) {
          startPaintButton.click()
        } else {
          console.log('[Main] Could not find start paint button')
          throw new Error('Could not find start paint button')
        }
        await new Promise(resolve => setTimeout(resolve, 100))

        // 2. select the color 0 to capture the fresh map reference
        const colorElement: HTMLElement | null =
          document.querySelector('#color-0')

        if (colorElement) {
          colorElement.click()
          console.log('[Main] Clicked #color-0 to capture map reference')
        } else {
          console.log('[Main] Could not find #color-0 element')
          throw new Error('Could not find #color-0 element')
        }

        await new Promise(resolve => setTimeout(resolve, 200))
        // this should catch the map reference in the window.currentMapRef
        // IMPORTANT: Increased timeout to ensure map reference is captured

        // 3. clear the marker pixel and add pixels to the map
        console.log('[Main] Dispatching pixeldata:clear-marker event')
        eventBus.dispatch('pixeldata:clear-marker', {})

        for (const pixel of pixels) {
          eventBus.dispatch(
            'pixeldata:add',
            gridPixelToWplaceColor(pixel, editorTile),
          )
        }

        // wait for the pixels to be added to the map
        await new Promise(resolve => setTimeout(resolve, 100))

        // 4. click on Paint button again actually appends the write
        const paintButton: HTMLButtonElement | null = document.querySelector(
          '.bottom-0 button.btn-primary',
        )
        if (!paintButton) {
          console.log('[Main] Could not find paint button')
          throw new Error('Could not find paint button')
        }

        if (paintButton) {
          paintButton.click()
        } else {
          console.log('[Main] Could not find paint button')
          throw new Error('Could not find paint button')
        }

        // log the first pixel
        if (pixels.length > 0) {
          console.log('[Main] First pixel:', pixels[0])
        }

        // Dispatch success event
        console.log('[Main] Save completed successfully')
        eventBus.dispatch('editor:save:success', {
          pixelCount: pixels.length,
          timestamp: Date.now(),
        })
      }
    } catch (error) {
      console.error('[Main] Error processing pixel grid data:', error)
      // Dispatch error event
      eventBus.dispatch('editor:save:error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      })
    }
  })

  console.log('[Main] Event listeners registered')
}
