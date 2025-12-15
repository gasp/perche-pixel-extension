import { useEffect, useState } from 'react'
import { eventBus } from '@extension/shared'
import { PixelEditor, postMessageBridge } from '@extension/pixel-editor'
import type { LoadTilePayload } from '@extension/pixel-editor'

export default function App() {
  const [isVisible, setIsVisible] = useState(false)
  const [tileCoords, setTileCoords] = useState<{ x: number; y: number } | null>(
    null,
  )
  const [pixelCoords, setPixelCoords] = useState<{
    x: number
    y: number
  } | null>(null)

  // Dynamically inject/remove CSS when editor visibility changes
  useEffect(() => {
    if (!isVisible) return

    // Inject CSS
    const linkElement = document.createElement('link')
    linkElement.rel = 'stylesheet'
    linkElement.href = chrome.runtime.getURL('content-ui/editor.css')
    linkElement.id = 'pixel-editor-styles'
    document.head.appendChild(linkElement)

    return () => {
      // Remove CSS when editor closes
      const existingLink = document.getElementById('pixel-editor-styles')
      if (existingLink) {
        existingLink.remove()
      }
    }
  }, [isVisible])

  useEffect(() => {
    console.log('🎨 Content ui editor loaded')

    // Listen for editor open events with coordinates
    const unsubscribeOpen = eventBus.on('editor:open:with-coords', event => {
      console.log('🎨 Editor open event received:', event.detail)
      setIsVisible(true)

      // Extract tile coordinates from event
      const { tile, pixel } = event.detail as {
        tile?: { x: number; y: number }
        pixel?: { x: number; y: number }
      }

      if (pixel) {
        console.log('🎨 Setting pixel coordinates:', pixel)
        setPixelCoords(pixel)
      } else {
        console.warn('🎨 No pixel coordinates provided, defaulting to (0, 0)')
        setPixelCoords({ x: 0, y: 0 })
      }

      if (tile) {
        console.log('🎨 Setting tile coordinates:', tile)
        setTileCoords(tile)
      } else {
        console.warn('🎨 No tile coordinates provided, defaulting to (0, 0)')
        setTileCoords({ x: 0, y: 0 })
      }
    })

    // Listen for editor close events
    const unsubscribeClose = eventBus.on('editor:close', event => {
      console.log('🎨 Editor close event received:', event.detail)
      setIsVisible(false)
      setTileCoords(null)
    })

    // Clean up listeners on unmount
    return () => {
      unsubscribeOpen()
      unsubscribeClose()
    }
  }, [])

  // Send tile coordinates to editor when visible
  useEffect(() => {
    if (isVisible && tileCoords) {
      // Small delay to ensure editor is mounted
      setTimeout(() => {
        const payload: LoadTilePayload = {
          tileX: tileCoords.x,
          tileY: tileCoords.y,
        }
        postMessageBridge.sendToEditor('editor:load:tile', payload)
      }, 100)
    }
  }, [isVisible, tileCoords])

  // Listen for messages from the pixel-editor
  useEffect(() => {
    const unsubscribePixelUpdate = postMessageBridge.onEditor(
      'editor:pixel:update',
      (payload: unknown) => {
        console.log('🎨 Pixel updated:', payload)
        // TODO: Send pixel update to backend via content script
      },
    )

    const unsubscribeSave = postMessageBridge.onEditor(
      'editor:save',
      (payload: unknown) => {
        console.log('💾 Save requested:', payload)
        // TODO: Handle save request
      },
    )

    const unsubscribeTileChanged = postMessageBridge.onEditor(
      'editor:tile:changed',
      (payload: unknown) => {
        console.log('🗺️ Tile changed:', payload)
        // TODO: Update tile in backend
      },
    )

    return () => {
      unsubscribePixelUpdate()
      unsubscribeSave()
      unsubscribeTileChanged()
    }
  }, [])

  const handleClose = () => {
    console.log('🎨 Close button clicked')
    // Dispatch editor:close event to notify main script
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
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <h1 className="text-xl font-bold">
              Pixel Editor
              {tileCoords && ` - Tile (${tileCoords.x}, ${tileCoords.y})`}
              {pixelCoords && ` - Pixel (${pixelCoords.x}, ${pixelCoords.y})`}
            </h1>
            <button
              onClick={handleClose}
              className="rounded bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600"
              type="button">
              Close
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <PixelEditor />
          </div>
        </div>
      </div>
    </div>
  )
}
