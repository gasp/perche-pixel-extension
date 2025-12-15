import { useEffect, useRef } from 'react'
import { useViewportStore } from '@/stores'
import type { PixelColor } from '@/types'
import type { MouseEvent } from 'react'

type TilePixelGrid = Map<string, PixelColor>

type OwnProps = {
  tilePixelGrid: TilePixelGrid
  maxDisplaySize?: number
}

export const TILE_SIZE = 1000 // Tiles are always 1000x1000px
const pixelRatio = window.devicePixelRatio || 1
const RENDER_DELAY = 400 // ms between renders

export function TilePreview({ tilePixelGrid, maxDisplaySize = 200 }: OwnProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const lastRenderTimeRef = useRef<number>(0)
  const lastOffsetRef = useRef({ x: 0, y: 0 })
  const lastDimensionsRef = useRef({ width: 0, height: 0 })
  const needsRedrawRef = useRef(true)

  const handleCanvasClick = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    // Convert from display coordinates to canvas coordinates
    const maxCanvasSize = Math.min(maxDisplaySize * pixelRatio, TILE_SIZE)
    const sampleRate = TILE_SIZE / maxCanvasSize

    // Convert to tile coordinates
    const tileX = (clickX / maxDisplaySize) * maxCanvasSize * sampleRate
    const tileY = (clickY / maxDisplaySize) * maxCanvasSize * sampleRate

    // Use the store's panToPixel method to center on the clicked point
    useViewportStore.getState().panToPixel(tileX, tileY)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || tilePixelGrid.size === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const maxCanvasSize = Math.min(maxDisplaySize * pixelRatio, TILE_SIZE)
    canvas.width = maxCanvasSize
    canvas.height = maxCanvasSize

    // if maxCanvasSize is 400 and TILE_SIZE is 1000, we sample every 2.5 pixels
    const sampleRate = TILE_SIZE / maxCanvasSize

    needsRedrawRef.current = true

    // Continuous render loop for viewport rectangle
    const render = () => {
      const now = Date.now()
      const timeSinceLastRender = now - lastRenderTimeRef.current

      // Get latest viewport state directly from store
      const currentOffset = useViewportStore.getState().offset
      const currentDimensions = useViewportStore.getState().dimensions

      // Check if viewport changed
      const offsetChanged =
        currentOffset.x !== lastOffsetRef.current.x ||
        currentOffset.y !== lastOffsetRef.current.y
      const dimensionsChanged =
        currentDimensions.width !== lastDimensionsRef.current.width ||
        currentDimensions.height !== lastDimensionsRef.current.height

      // if viewport changed and enough time passed, redraw
      if (
        (offsetChanged || dimensionsChanged || needsRedrawRef.current) &&
        timeSinceLastRender >= RENDER_DELAY
      ) {
        lastRenderTimeRef.current = now
        needsRedrawRef.current = false

        // Redraw entire canvas (tile + viewport rectangle)
        ctx.clearRect(0, 0, maxCanvasSize, maxCanvasSize)

        // Redraw tile pixels
        for (let canvasY = 0; canvasY < maxCanvasSize; canvasY++) {
          for (let canvasX = 0; canvasX < maxCanvasSize; canvasX++) {
            const tileX = Math.floor(canvasX * sampleRate)
            const tileY = Math.floor(canvasY * sampleRate)

            const key = `${tileX},${tileY}`
            const color = tilePixelGrid.get(key)

            if (color) {
              ctx.fillStyle = color
              ctx.fillRect(canvasX, canvasY, 1, 1)
            }
          }
        }

        const viewportX = -currentOffset.x / sampleRate
        const viewportY = -currentOffset.y / sampleRate
        const viewportWidth = currentDimensions.width / sampleRate
        const viewportHeight = currentDimensions.height / sampleRate

        ctx.strokeStyle = 'red'
        ctx.lineWidth = pixelRatio * 2
        ctx.strokeRect(viewportX, viewportY, viewportWidth, viewportHeight)

        // Update refs
        lastOffsetRef.current = { ...currentOffset }
        lastDimensionsRef.current = { ...currentDimensions }
      }

      // Continue the render loop
      animationFrameRef.current = requestAnimationFrame(render)
    }

    // Start the render loop
    animationFrameRef.current = requestAnimationFrame(render)

    // Cleanup function
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [tilePixelGrid, maxDisplaySize])

  if (tilePixelGrid.size === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs text-gray-600"
        style={{
          width: `${maxDisplaySize}px`,
          height: `${maxDisplaySize}px`,
        }}>
        No tile loaded
      </div>
    )
  }

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      className="cursor-pointer border border-black"
      style={{
        imageRendering: 'pixelated',
        width: `${maxDisplaySize}px`,
        height: `${maxDisplaySize}px`,
      }}
    />
  )
}
