import { useEffect, useRef } from 'react'
import type { StampPixel } from './stamps'

export type StampButtonProps = {
  name: string
  pixels: StampPixel[]
  onClick: () => void
  isSelected: boolean
}

export function StampButton({
  name,
  pixels,
  onClick,
  isSelected,
}: StampButtonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

    // Calculate center offset to center the stamp in the 12x12 canvas
    const offsetX = Math.floor((12 - stampWidth) / 2) - minX
    const offsetY = Math.floor((12 - stampHeight) / 2) - minY

    // Draw each pixel
    pixels.forEach(pixel => {
      const canvasX = pixel.x + offsetX
      const canvasY = pixel.y + offsetY

      // Only draw if within bounds
      if (canvasX >= 0 && canvasX < 12 && canvasY >= 0 && canvasY < 12) {
        ctx.fillStyle = `rgb(${pixel.rgb[0]}, ${pixel.rgb[1]}, ${pixel.rgb[2]})`
        ctx.fillRect(canvasX, canvasY, 1, 1)
      }
    })
  }, [pixels])

  return (
    <button
      title={name}
      onClick={onClick}
      className={`h-[24px] w-[24px] transition-none ${
        isSelected
          ? 'border-[1px] border-white'
          : 'border-[1px] border-transparent'
      }`}
    >
      <canvas
        ref={canvasRef}
        width={12}
        height={12}
        className="h-full w-full"
        style={{ imageRendering: 'pixelated' }}
      />
    </button>
  )
}
