import { useEffect, useRef } from 'react'
import type { TextureRenderer } from './textures'

export type TextureButtonProps = {
  name: string
  renderer: TextureRenderer
  onClick: () => void
  isSelected: boolean
}

export function TextureButton({
  name,
  renderer,
  onClick,
  isSelected,
}: TextureButtonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 2x zoom
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 12; x++) {
        ctx.fillStyle = renderer(x, y)
        ctx.fillRect(x, y, 1, 1)
      }
    }
  }, [renderer])

  return (
    <button
      title={name}
      onClick={onClick}
      className={`h-[16px] w-[24px] transition-none ${
        isSelected
          ? 'border-[1px] border-white'
          : 'border-[1px] border-transparent'
      }`}
    >
      <canvas
        ref={canvasRef}
        width={12}
        height={8}
        className="h-full w-full"
        style={{ imageRendering: 'pixelated' }}
      />
    </button>
  )
}
