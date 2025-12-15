import type { PixelMatrix } from '@/types'

type DrawPixelsParams = {
  ctx: CanvasRenderingContext2D
  pixelMatrix: PixelMatrix
  pixelSize: number
  opacity?: number
}

export function drawPixels({
  ctx,
  pixelMatrix,
  pixelSize,
  opacity = 1,
}: DrawPixelsParams) {
  const previousAlpha = ctx.globalAlpha
  if (opacity !== 1) {
    ctx.globalAlpha = opacity
  }

  for (let y = 0; y < pixelMatrix.length; y++) {
    for (let x = 0; x < pixelMatrix[y].length; x++) {
      const color = pixelMatrix[y][x]
      if (color) {
        ctx.fillStyle = color
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
      }
    }
  }
  if (opacity !== 1) {
    ctx.globalAlpha = previousAlpha
  }
}
