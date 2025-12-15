import { eventBus } from '@extension/shared'

/**
 * Hijacks Map.prototype.set to intercept pixel data
 *
 * IMPORTANT: This must be injected into the page context (not content script context)
 * because content scripts run in an isolated JavaScript environment and cannot
 * intercept the page's prototype methods.
 *
 * This function injects a web-accessible resource script into the page to bypass CSP.
 */
export const hijackMapPrototypeSetMethod = () => {
  console.log('🎯 Injecting map prototype hijack into page context')

  // Create a script element that loads from web_accessible_resources
  const script = document.createElement('script')
  script.src = chrome.runtime.getURL('content/map-hijack-injected.iife.js')
  script.onload = () => {
    console.log('🎯 Map hijack script loaded successfully')
    script.remove() // Clean up after loading
  }
  script.onerror = () => {
    console.error('🎯 Failed to load map hijack script')
  }

  // Inject at the start of <head> to ensure it runs before page scripts
  ;(document.head || document.documentElement).prepend(script)

  // Listen for postMessage events from the page context
  window.addEventListener('message', (event: MessageEvent) => {
    // Verify the message is from our injected script
    if (
      event.source !== window ||
      !event.data ||
      event.data.source !== 'perche-pixel-extension'
    ) {
      return
    }

    // Handle different message types
    if (event.data.type === 'PIXELDATA_MARKER') {
      console.log(
        '🎯 [Content Script] Received marker via postMessage:',
        event.data.payload,
      )

      // Dispatch to event bus for other parts of the extension
      eventBus.dispatch('pixeldata:marker', event.data.payload)
    }
  })

  // Listen for add pixel requests from main.ts and forward to page context
  eventBus.on('pixeldata:add', event => {
    console.log(
      '🎯 [Content Script] Forwarding ADD_PIXEL to page context:',
      event.detail,
    )

    window.postMessage(
      {
        type: 'ADD_PIXEL',
        source: 'perche-pixel-extension-response',
        payload: event.detail,
      },
      '*',
    )
  })
}
