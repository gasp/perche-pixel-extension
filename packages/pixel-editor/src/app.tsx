import { useEffect } from 'react'
import {
  useCanvasDimensions,
  useViewMatrix,
  useTileLoader,
  useActions,
  usePostMessage,
} from '@/hooks'
import { useToolStore, useViewportStore } from '@/stores'
import { PixelCanvas } from './canvas'
import { ToolPalette } from './tools'
import { ColorPalette } from './colors'
import { TexturePalette } from './textures'
import { BrushSizePalette } from './brush-sizes'
import { StampPalette } from './stamps'
import { AppLayout, ViewportInfo } from './components'
import { DebugInfo } from './components/debug-info'
import { LoadingInfo } from './components/loading-info'
import { TilePalette } from './tiles'
import type { LoadTilePayload } from './utils/post-message'

export function App() {
  const setDimensions = useViewportStore(state => state.setDimensions)
  const panToPixel = useViewportStore(state => state.panToPixel)
  const pixelSize = useViewportStore(state => state.pixelSize)

  // Get canvas dimensions based on available screen space
  const canvasDimensions = useCanvasDimensions()
  // Calculate grid dimensions in drawing pixels
  const width = Math.floor(canvasDimensions.width / pixelSize)
  const height = Math.floor(canvasDimensions.height / pixelSize)

  const { isLoadingTile, loadTile } = useTileLoader()
  const { onMessage } = usePostMessage()

  // Update viewport dimensions in store when they change
  useEffect(() => {
    if (width > 0 && height > 0) {
      setDimensions({ width, height })
    }
  }, [width, height, setDimensions])

  // Listen for tile load requests from parent
  useEffect(() => {
    const unsubscribeLoadTile = onMessage('editor:load:tile', payload => {
      const { tileUrl, pixelX, pixelY } = payload as LoadTilePayload
      console.log('📥 Load tile request:', { tileUrl, pixelX, pixelY })

      // Load the tile
      loadTile(tileUrl)

      // Pan to pixel if coordinates provided
      if (pixelX !== undefined && pixelY !== undefined) {
        console.log('📍 Panning to pixel:', { pixelX, pixelY })
        panToPixel(pixelX, pixelY)
      }
    })

    return () => {
      unsubscribeLoadTile()
    }
  }, [onMessage, loadTile, panToPixel])

  const selectedTool = useToolStore(state => state.selectedTool)

  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    isDragging,
  } = useActions()

  // Get pixel matrix for current viewport
  const { userVisualPixelMatrix, tileVisualPixelMatrix } = useViewMatrix()

  // Only render when dimensions are calculated
  if (width === 0 || height === 0) {
    return null
  }

  return (
    <AppLayout>
      <ToolPalette />
      <ColorPalette />
      <TexturePalette />
      <BrushSizePalette />
      <StampPalette />
      <TilePalette />
      <PixelCanvas
        width={width}
        height={height}
        userVisualPixelMatrix={userVisualPixelMatrix}
        tileVisualPixelMatrix={tileVisualPixelMatrix}
        handleMouseDown={handleMouseDown}
        handleMouseMove={handleMouseMove}
        handleMouseUp={handleMouseUp}
        handleMouseLeave={handleMouseLeave}
        isDragging={isDragging}
        isMoveTool={selectedTool === 'move'}
      />
      <ViewportInfo />
      <DebugInfo />
      {isLoadingTile && <LoadingInfo />}
    </AppLayout>
  )
}
