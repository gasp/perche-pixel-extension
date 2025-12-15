import { useEffect, useRef } from 'react'
import type { TextureRenderer } from './textures'

export type TexturePreviewProps = {
  renderer?: TextureRenderer
  name: string
}

export function TexturePreview({ renderer, name }: TexturePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !renderer) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Render at 20x20 pixel size to match color preview
    // Using a 5x5 pattern of the texture
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        ctx.fillStyle = renderer(x, y)
        ctx.fillRect(x * 4, y * 4, 4, 4)
      }
    }
  }, [renderer])

  return (
    <canvas
      ref={canvasRef}
      width={20}
      height={20}
      className="h-[20px] w-[20px] border border-black"
      style={{ imageRendering: 'pixelated' }}
      title={name}
    />
  )
}
