import { ToolType } from '@/tools/tools'
import { visualToTheoretical } from '@/utils/coordinate-converter'

export type HoverHandlerParams = {
  visualX: number
  visualY: number
  offset: { x: number; y: number }
  brushPattern: { dx: number; dy: number }[]
  stampPattern: { dx: number; dy: number; rgb: [number, number, number] }[]
  findContiguousTransparentPixels: (
    x: number,
    y: number,
  ) => { x: number; y: number }[]
  setHoveredPixels: (pixels: { x: number; y: number }[]) => void
  clearHoveredPixels: () => void
}

/**
 * Calculate affected pixels for hover preview based on the selected tool
 */
export function handleToolHover(
  selectedTool: ToolType,
  params: HoverHandlerParams,
) {
  if (selectedTool === ToolType.MOVE) {
    params.clearHoveredPixels()
    return
  }

  const affectedPixels: { x: number; y: number }[] = []

  switch (selectedTool) {
    case ToolType.PAINT_BUCKET: {
      // Convert visual coordinates to theoretical for paint bucket
      const theoretical = visualToTheoretical(
        params.visualX,
        params.visualY,
        params.offset,
      )

      // Find contiguous transparent pixels
      const contiguousPixels = params.findContiguousTransparentPixels(
        theoretical.x,
        theoretical.y,
      )

      // Convert back to visual coordinates for display
      for (const pixel of contiguousPixels) {
        affectedPixels.push({
          x: pixel.x - params.offset.x,
          y: pixel.y - params.offset.y,
        })
      }
      break
    }

    case ToolType.BRUSH:
    case ToolType.ERASER:
      // Show circular brush/eraser preview
      for (const { dx, dy } of params.brushPattern) {
        affectedPixels.push({
          x: params.visualX + dx,
          y: params.visualY + dy,
        })
      }
      break

    case ToolType.PENCIL:
    case ToolType.PIPETTE:
    case ToolType.DARKEN:
      // Single pixel for pencil, pipette, and darken
      affectedPixels.push({ x: params.visualX, y: params.visualY })
      break

    case ToolType.STAMP:
      // Show stamp pattern preview
      for (const { dx, dy } of params.stampPattern) {
        affectedPixels.push({
          x: params.visualX + dx,
          y: params.visualY + dy,
        })
      }
      break
  }

  params.setHoveredPixels(affectedPixels)
}
