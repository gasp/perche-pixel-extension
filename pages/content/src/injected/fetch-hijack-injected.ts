/**
 * This script runs in the PAGE CONTEXT (not content script context)
 * It hijacks window.fetch to intercept network requests
 */
;(function () {
  const originalFetch = window.fetch

  console.log('🎯 [Page Context] Hijacking window.fetch')

  window.fetch = async function (...args) {
    console.log('🎯 [Page Context] fetch intercepted:', args)

    // Call original fetch
    const response = await originalFetch.apply(this, args)
    const cloned = response.clone()

    // Get endpoint name
    const endpointName =
      (args[0] instanceof Request ? args[0]?.url : args[0]) || 'unknown'

    // Check Content-Type to only process JSON
    const contentType = cloned.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      console.log(`🎯 [Page Context] JSON response from: "${endpointName}"`)

      try {
        const data = await cloned.json()

        // Send fetch data to content script via postMessage
        window.postMessage(
          {
            type: 'FETCH_INTERCEPTED',
            source: 'perche-pixel-extension',
            payload: {
              url: endpointName,
              contentType,
              data,
              method: args[1]?.method || 'GET',
              status: response.status,
              statusText: response.statusText,
            },
          },
          '*',
        )
      } catch (error) {
        console.error('🎯 [Page Context] Failed to parse JSON:', error)
      }
    }

    return response
  }

  console.log('🎯 [Page Context] window.fetch hijacked successfully')
})()
