import { eventBus } from '@src/lib/event-bus'

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

  console.log('[Main] Event listeners registered')
}
