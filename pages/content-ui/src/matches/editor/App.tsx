import { useEffect, useState } from 'react'
import { eventBus } from '@extension/shared'
import { PixelEditor, postMessageBridge } from '@extension/pixel-editor'
import type { LoadTilePayload } from '@extension/pixel-editor'

export default function App() {
  const [isVisible, setIsVisible] = useState(false)
  const [isEditorUIVisible, setIsEditorUIVisible] = useState(true)
  const [tileCoords, setTileCoords] = useState<{ x: number; y: number } | null>(
    null,
  )
  const [pixelCoords, setPixelCoords] = useState<{
    x: number
    y: number
  } | null>(null)
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'success' | 'error'
  >('idle')

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

      // Extract coordinates from event (typed by ContentEventMap)
      const { tile, pixel } = event.detail

      console.log('🎨 Setting tile coordinates:', tile)
      console.log('🎨 Setting pixel coordinates:', pixel)

      setTileCoords(tile)
      setPixelCoords(pixel)
    })

    // Listen for editor close events
    const unsubscribeClose = eventBus.on('editor:close', event => {
      console.log('🎨 Editor close event received:', event.detail)
      setIsVisible(false)
      setTileCoords(null)
    })

    // Listen for editor UI toggle events
    const unsubscribeToggleUI = eventBus.on('editor:toggle:ui', () => {
      console.log('🎨 Editor UI toggle event received')
      setIsEditorUIVisible(prev => !prev)
    })

    // Clean up listeners on unmount
    return () => {
      unsubscribeOpen()
      unsubscribeClose()
      unsubscribeToggleUI()
    }
  }, [])

  // Send tile URL and pixel coordinates to editor when visible
  useEffect(() => {
    if (isVisible && tileCoords && pixelCoords) {
      // Small delay to ensure editor is mounted
      setTimeout(() => {
        // Construct the tile URL
        const tileUrl = `https://backend.wplace.live/files/s0/tiles/${tileCoords.x}/${tileCoords.y}.png`

        const payload: LoadTilePayload = {
          tileUrl,
          pixelX: pixelCoords.x,
          pixelY: pixelCoords.y,
        }
        console.log('🎨 Sending tile load request:', payload)
        postMessageBridge.sendToEditor('editor:load:tile', payload)
      }, 100)
    }
  }, [isVisible, tileCoords, pixelCoords])

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

    const unsubscribeGridResponse = postMessageBridge.onEditor(
      'editor:grid:response',
      (payload: unknown) => {
        console.log('💾 Grid response received:', payload)
        // Forward pixel grid data to main content script via eventBus
        const gridPayload = payload as {
          pixels: Array<{ x: number; y: number; color: string }>
        }
        setSaveStatus('saving')
        eventBus.dispatch('editor:grid:data', gridPayload)
      },
    )

    const unsubscribeSaveSuccess = eventBus.on('editor:save:success', event => {
      console.log('✅ Save successful:', event.detail)
      setSaveStatus('success')
      // Reset to idle after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000)
    })

    const unsubscribeSaveError = eventBus.on('editor:save:error', event => {
      console.error('❌ Save failed:', event.detail)
      setSaveStatus('error')
      // Reset to idle after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000)
    })

    return () => {
      unsubscribePixelUpdate()
      unsubscribeSave()
      unsubscribeTileChanged()
      unsubscribeGridResponse()
      unsubscribeSaveSuccess()
      unsubscribeSaveError()
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

  const handleSave = () => {
    console.log('💾 Save button clicked - requesting pixel grid')
    // Request pixel grid from editor
    postMessageBridge.sendToEditor('editor:get:grid', {})
  }

  if (!isVisible) {
    return null
  }

  return (
    <div
      id="editor"
      className={`fixed inset-0 z-50 flex items-center justify-center ${isEditorUIVisible ? 'bg-black' : 'pointer-events-none bg-transparent'}`}>
      {/* Main Editor Container */}
      <div
        className={`relative h-full w-full ${isEditorUIVisible ? 'bg-white' : 'bg-transparent'}`}
        style={{ pointerEvents: isEditorUIVisible ? 'auto' : 'none' }}>
        <div className="flex h-full flex-col">
          {isEditorUIVisible && (
            <div className="flex items-center justify-between border-b border-gray-200 bg-white p-2">
              <h1 className="text-sm font-bold">
                Pixel Editor
                {tileCoords && ` - Tile (${tileCoords.x}, ${tileCoords.y})`}
                {pixelCoords && ` - Pixel (${pixelCoords.x}, ${pixelCoords.y})`}
              </h1>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saveStatus === 'saving'}
                  className={`rounded px-2 py-1 text-sm font-semibold text-white transition-colors ${
                    saveStatus === 'saving'
                      ? 'cursor-not-allowed bg-gray-400'
                      : saveStatus === 'success'
                        ? 'bg-green-600 hover:bg-green-700'
                        : saveStatus === 'error'
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-green-500 hover:bg-green-600'
                  }`}
                  type="button">
                  {saveStatus === 'saving' && '⏳ Saving...'}
                  {saveStatus === 'success' && '✅ Saved!'}
                  {saveStatus === 'error' && '❌ Error'}
                  {saveStatus === 'idle' && 'Save'}
                </button>
                <button
                  onClick={handleClose}
                  className="rounded bg-red-500 px-2 py-1 font-semibold text-white hover:bg-red-600"
                  type="button">
                  Close
                </button>
              </div>
            </div>
          )}
          <div
            className="flex-1 overflow-hidden"
            id="pixel-editor-container"
            style={{ display: isEditorUIVisible ? 'block' : 'none' }}>
            <PixelEditor />
          </div>
        </div>
      </div>
    </div>
  )
}
