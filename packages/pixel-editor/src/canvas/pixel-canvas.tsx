import { useEffect, useRef, type MouseEvent } from 'react'
import { useViewportStore, useHoverStore, useTileStore } from '@/stores'
import type { PixelCoord, PixelMatrix } from '@/types'
import { drawGrid } from './grid'
import { calculateBorderSegments } from '../utils/border-calculator'
import { drawPixels } from './draw-pixels'

interface PixelCanvasProps {
  width: number // Width in pixels (logical pixels)
  height: number // Height in pixels (logical pixels)
  userVisualPixelMatrix: PixelMatrix // Matrix of pixel colors
  tileVisualPixelMatrix: PixelMatrix // Matrix of tile pixel colors
  handleMouseDown: (
    clientX: number,
    clientY: number,
    pixelX: number,
    pixelY: number,
  ) => void
  handleMouseMove: (
    clientX: number,
    clientY: number,
    pixelX: number,
    pixelY: number,
    pixelSize: number,
  ) => void
  handleMouseUp: () => void
  handleMouseLeave: () => void
  isDragging: boolean
  isMoveTool?: boolean
}

export function PixelCanvas({
  width = 64,
  height = 64,
  userVisualPixelMatrix,
  tileVisualPixelMatrix,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleMouseLeave,
  isDragging,
  isMoveTool = false,
}: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const hoveredPixels = useHoverStore(state => state.hoveredPixels)
  const tileOpacity = useTileStore(state => state.opacity)
  const tileBgColor = useTileStore(state => state.bgColor)
  const pixelSize = useViewportStore(state => state.pixelSize)
  const increasePixelSize = useViewportStore(state => state.increasePixelSize)
  const decreasePixelSize = useViewportStore(state => state.decreasePixelSize)

  const renderDataRef = useRef<{
    tileVisualPixelMatrix: PixelMatrix
    userVisualPixelMatrix: PixelMatrix
    width: number
    height: number
    pixelSize: number
    offset: { x: number; y: number }
    hoveredPixels: PixelCoord[]
    tileOpacity: number
    tileBgColor: string
  }>({
    tileVisualPixelMatrix,
    userVisualPixelMatrix,
    width,
    height,
    pixelSize,
    offset: { x: 0, y: 0 },
    hoveredPixels: [],
    tileOpacity: 0.5,
    tileBgColor: 'white',
  })

  const { offset } = useViewportStore()

  useEffect(() => {
    renderDataRef.current = {
      tileVisualPixelMatrix,

      userVisualPixelMatrix,
      width,
      height,
      pixelSize,
      offset,
      hoveredPixels,
      tileOpacity,
      tileBgColor,
    }
  }, [
    tileVisualPixelMatrix,
    userVisualPixelMatrix,
    width,
    height,
    pixelSize,
    offset,
    hoveredPixels,
    tileOpacity,
    tileBgColor,
  ])

  function render() {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return

    const {
      tileVisualPixelMatrix,
      userVisualPixelMatrix,
      width,
      height,
      pixelSize,
      offset,
      hoveredPixels,
      tileOpacity,
      tileBgColor,
    } = renderDataRef.current

    const currentOffsetX = offset.x * pixelSize
    const currentOffsetY = offset.y * pixelSize

    ctx.fillStyle = tileBgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (pixelSize > 4) {
      drawGrid({
        ctx,
        width,
        height,
        pixelSize,
        currentOffsetX,
        currentOffsetY,
        thickness: pixelSize > 8 ? 1 : 0.5,
      })
    }

    drawPixels({
      ctx,
      pixelMatrix: tileVisualPixelMatrix,
      pixelSize,
      opacity: tileOpacity,
    })

    drawPixels({
      ctx,
      pixelMatrix: userVisualPixelMatrix,
      pixelSize,
    })

    // Draw hover highlight borders
    if (hoveredPixels.length > 0) {
      const borderSegments = calculateBorderSegments(hoveredPixels)

      ctx.strokeStyle = 'rgba(0, 123, 255, 0.8)'
      ctx.lineWidth = 1

      ctx.beginPath()
      // ctx.setLineDash([3, 1])
      for (const segment of borderSegments) {
        ctx.moveTo(segment.x1 * pixelSize, segment.y1 * pixelSize)
        ctx.lineTo(segment.x2 * pixelSize, segment.y2 * pixelSize)
      }
      ctx.stroke()
    }

    animationFrameRef.current = requestAnimationFrame(render)
  }

  // Initialize context and start render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext('2d')
    }

    animationFrameRef.current = requestAnimationFrame(render)

    // Cleanup: cancel animation frame on unmount
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
    // render does not change so we can safely omit it from the dependency array
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const onMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / pixelSize)
    const y = Math.floor((e.clientY - rect.top) / pixelSize)

    handleMouseDown(e.clientX, e.clientY, x, y)
  }

  const onMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / pixelSize)
    const y = Math.floor((e.clientY - rect.top) / pixelSize)

    handleMouseMove(e.clientX, e.clientY, x, y, pixelSize)
  }

  // Use useEffect to add wheel listener with passive: false
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleWheel = (e: globalThis.WheelEvent) => {
      e.preventDefault()

      if (e.deltaY < 0) {
        // Scrolling up - zoom in (increase pixel size)
        increasePixelSize()
      } else if (e.deltaY > 0) {
        // Scrolling down - zoom out (decrease pixel size)
        decreasePixelSize()
      }
    }

    // Add event listener with passive: false to allow preventDefault
    canvas.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      canvas.removeEventListener('wheel', handleWheel)
    }
  }, [increasePixelSize, decreasePixelSize, pixelSize])

  return (
    <canvas
      ref={canvasRef}
      width={width * pixelSize}
      height={height * pixelSize}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{
        imageRendering: 'pixelated',
        cursor: isMoveTool ? (isDragging ? 'grabbing' : 'grab') : 'crosshair',
      }}
    />
  )
}
