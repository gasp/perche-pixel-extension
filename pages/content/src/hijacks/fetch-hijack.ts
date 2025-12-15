// Spys on "spontaneous" fetch requests made by the client
const originalFetch = window.fetch // Saves a copy of the original fetch

export const hijackFetch = () => {
  console.log('🎯 hijacking fetch')
  // Overrides fetch
  window.fetch = async function (...args) {
    console.log('fetch args', args)
    const response = await originalFetch.apply(this, args) // Sends a fetch
    const cloned = response.clone() // Makes a copy of the response

    console.log('cloned', cloned)
    // Retrieves the endpoint name. Unknown endpoint = "ignore"
    const endpointName =
      (args[0] instanceof Request ? args[0]?.url : args[0]) || 'ignore'

    // Check Content-Type to only process JSON
    const contentType = cloned.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      // Since this code does not run in the userscript, we can't use consoleLog().
      console.log(`Sending JSON message about endpoint "${endpointName}"`)
    }
    return response // Returns the original response
  }
}
