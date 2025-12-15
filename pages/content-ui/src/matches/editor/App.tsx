import { eventBus } from '@extension/shared'
import { useEffect, useState } from 'react'

export default function App() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    console.log('🎨 Content ui editor loaded')

    // Listen for editor open events
    const unsubscribeOpen = eventBus.on('editor:open', event => {
      console.log('🎨 Editor open event received:', event.detail)
      setIsVisible(true)
    })

    // Listen for editor close events (will be triggered by editor itself later)
    const unsubscribeClose = eventBus.on('editor:close', event => {
      console.log('🎨 Editor close event received:', event.detail)
      setIsVisible(false)
    })

    // Clean up listeners on unmount
    return () => {
      unsubscribeOpen()
      unsubscribeClose()
    }
  }, [])

  const handleClose = () => {
    console.log('🎨 Close button clicked')
    // Dispatch editor:close event to notify main script and close editor
    eventBus.dispatch('editor:close', {
      source: 'editor-ui',
      timestamp: Date.now(),
    })
  }

  if (!isVisible) {
    return null
  }

  return (
    <div
      id="editor"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative h-full w-full bg-white">
        <div className="flex h-full flex-col p-4">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Editor</h1>
            <button
              onClick={handleClose}
              className="rounded bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600"
              type="button">
              Close
            </button>
          </div>
          <div className="flex-1">
            <p>Editor content will go here</p>
          </div>
        </div>
      </div>
    </div>
  )
}
