import { eventBus } from '@src/lib/event-bus'

/**
 * Hijacks window.fetch to intercept network requests
 *
 * IMPORTANT: This must be injected into the page context (not content script context)
 * because content scripts run in an isolated JavaScript environment and cannot
 * intercept the page's fetch calls.
 *
 * This function injects a web-accessible resource script into the page to bypass CSP.
 */
export const hijackFetch = () => {
  console.log('🎯 Injecting fetch hijack into page context')

  // Create a script element that loads from web_accessible_resources
  const script = document.createElement('script')
  script.src = chrome.runtime.getURL('content/fetch-hijack-injected.iife.js')
  script.onload = () => {
    console.log('🎯 Fetch hijack script loaded successfully')
    script.remove()
  }
  script.onerror = () => {
    console.error('🎯 Failed to load fetch hijack script')
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

    // Handle fetch intercepted events
    if (event.data.type === 'FETCH_INTERCEPTED') {
      console.log(
        '🎯 [Content Script] Fetch intercepted via postMessage:',
        event.data.payload,
      )

      // Dispatch to event bus for other parts of the extension
      eventBus.dispatch('fetch:intercepted', event.data.payload)
    }
  })
}
