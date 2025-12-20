import { hijackFetch } from '@src/hijacks/fetch-hijack'
import { hijackMapPrototypeSetMethod } from '@src/hijacks/map-hijack'
import { uiHijack } from '@src/hijacks/ui-hijack'
import { initDebugUI } from '@src/debug-ui'
import { setupEventListeners } from '@src/main'

console.log('🎯 wplace loaded')

const init = () => {
  // Set up event system first
  setupEventListeners()

  // Initialize hijacks
  hijackFetch()
  hijackMapPrototypeSetMethod()
  uiHijack()

  initDebugUI()
}

// if (document.readyState === 'loading') {
//   document.addEventListener('DOMContentLoaded', init)
// } else {
//   init()
// }

init()
