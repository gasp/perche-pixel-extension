type drawGridParams = {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  pixelSize: number
  currentOffsetX: number
  currentOffsetY: number
  thickness?: number
}

export function drawGrid({
  ctx,
  width,
  height,
  pixelSize,
  thickness = 1,
}: drawGridParams) {
  ctx.strokeStyle = '#e0e0e0'
  ctx.lineWidth = thickness

  // Vertical lines
  for (let x = 0; x <= width; x++) {
    ctx.beginPath()
    ctx.moveTo(x * pixelSize, 0)
    ctx.lineTo(x * pixelSize, height * pixelSize)
    ctx.stroke()
  }

  // Horizontal lines
  for (let y = 0; y <= height; y++) {
    ctx.beginPath()
    ctx.moveTo(0, y * pixelSize)
    ctx.lineTo(width * pixelSize, y * pixelSize)
    ctx.stroke()
  }
}
