import { useEffect, useRef, useState } from 'react'
import type { StampPixel } from './stamps'

export type StampButtonProps = {
  name: string
  pixels: StampPixel[]
  onClick: () => void
  isSelected: boolean
}

const CANVAS_SIZES = [32, 64]

export function StampButton({
  name,
  pixels,
  onClick,
  isSelected,
}: StampButtonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvasSize, setCanvasSize] = useState<number>(12)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Find bounds of the stamp
    const minX = Math.min(...pixels.map(p => p.x))
    const maxX = Math.max(...pixels.map(p => p.x))
    const minY = Math.min(...pixels.map(p => p.y))
    const maxY = Math.max(...pixels.map(p => p.y))

    const stampWidth = maxX - minX + 1
    const stampHeight = maxY - minY + 1
    const stampSize = Math.max(stampWidth, stampHeight)

    // calculate which canvas size to use
    setCanvasSize(CANVAS_SIZES.find(size => stampSize <= size) || 32)
    console.log('Canvas size selected:', canvasSize)

    // Calculate center offset to center the stamp in the n×n canvas
    const offsetX = Math.floor((canvasSize - stampWidth) / 2) - minX
    const offsetY = Math.floor((canvasSize - stampHeight) / 2) - minY

    // Draw each pixel
    pixels.forEach(pixel => {
      const canvasX = pixel.x + offsetX
      const canvasY = pixel.y + offsetY

      // Only draw if within bounds
      if (
        canvasX >= 0 &&
        canvasX < canvasSize &&
        canvasY >= 0 &&
        canvasY < canvasSize
      ) {
        ctx.fillStyle = `rgb(${pixel.rgb[0]}, ${pixel.rgb[1]}, ${pixel.rgb[2]})`
        ctx.fillRect(canvasX, canvasY, 1, 1)
      }
    })
  }, [pixels, canvasSize])

  return (
    <button
      title={`${name} (${pixels.length} px)`}
      onClick={onClick}
      className={`h-${canvasSize * 2} w-${canvasSize * 2} transition-none ${
        isSelected
          ? 'border-[1px] border-white'
          : 'border-[1px] border-transparent'
      }`}>
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        className="h-full w-full"
        style={{ imageRendering: 'pixelated' }}
      />
    </button>
  )
}
