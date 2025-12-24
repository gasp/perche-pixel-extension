import { ToolType } from '@/tools/tools'
import { visualToTheoretical } from '@/utils/coordinate-converter'
import { getDarkerColor } from './color-darkening'
import type { PixelColor } from '@/types'

export type ToolHandlerParams = {
  visualX: number
  visualY: number
  offset: { x: number; y: number }
  getColorForPixel: (x: number, y: number) => PixelColor
  getPixelColorAt: (x: number, y: number) => PixelColor
  getTileColorAt: (x: number, y: number) => PixelColor
  setPixel: (x: number, y: number, color: PixelColor) => void
  setSelectedColorId: (id: number) => void
  findColorIdFromRgb: (rgb: string | null) => number | null
  findContiguousTransparentPixels: (
    x: number,
    y: number,
  ) => { x: number; y: number }[]
  brushPattern: { dx: number; dy: number }[]
  stampPattern: { dx: number; dy: number; rgb: [number, number, number] }[]
}

/**
 * Handle pipette tool - pick color from pixel
 */
export function handlePipetteTool(params: ToolHandlerParams) {
  const theoretical = visualToTheoretical(
    params.visualX,
    params.visualY,
    params.offset,
  )
  const pixelColor = params.getPixelColorAt(theoretical.x, theoretical.y)
  if (pixelColor) {
    const colorId = params.findColorIdFromRgb(pixelColor)
    if (colorId !== null) {
      params.setSelectedColorId(colorId)
    }
  }
}

/**
 * Handle paint bucket tool - fill contiguous transparent pixels
 */
export function handlePaintBucketTool(params: ToolHandlerParams) {
  const theoretical = visualToTheoretical(
    params.visualX,
    params.visualY,
    params.offset,
  )
  const pixelsToFill = params.findContiguousTransparentPixels(
    theoretical.x,
    theoretical.y,
  )
  // Fill all the transparent pixels with the current color
  for (const pixel of pixelsToFill) {
    const color = params.getColorForPixel(pixel.x, pixel.y)
    params.setPixel(pixel.x, pixel.y, color)
  }
}

/**
 * Handle brush tool - paint circular pattern
 */
export function handleBrushTool(params: ToolHandlerParams) {
  const theoretical = visualToTheoretical(
    params.visualX,
    params.visualY,
    params.offset,
  )
  for (const { dx, dy } of params.brushPattern) {
    const pixelX = theoretical.x + dx
    const pixelY = theoretical.y + dy
    const color = params.getColorForPixel(pixelX, pixelY)
    params.setPixel(pixelX, pixelY, color)
  }
}

/**
 * Handle eraser tool - erase circular pattern
 */
export function handleEraserTool(params: ToolHandlerParams) {
  const theoretical = visualToTheoretical(
    params.visualX,
    params.visualY,
    params.offset,
  )
  for (const { dx, dy } of params.brushPattern) {
    params.setPixel(theoretical.x + dx, theoretical.y + dy, null)
  }
}

/**
 * Handle pencil tool - single pixel
 */
export function handlePencilTool(params: ToolHandlerParams) {
  const theoretical = visualToTheoretical(
    params.visualX,
    params.visualY,
    params.offset,
  )
  const color = params.getColorForPixel(theoretical.x, theoretical.y)
  params.setPixel(theoretical.x, theoretical.y, color)
}

/**
 * Handle stamp tool - paint stamp pattern with specific colors
 */
export function handleStampTool(params: ToolHandlerParams) {
  const theoretical = visualToTheoretical(
    params.visualX,
    params.visualY,
    params.offset,
  )
  for (const { dx, dy, rgb } of params.stampPattern) {
    const pixelX = theoretical.x + dx
    const pixelY = theoretical.y + dy
    const color = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
    params.setPixel(pixelX, pixelY, color)
  }
}

/**
 * Handle darken tool - read tile color and paint darker version
 */
export function handleDarkenTool(params: ToolHandlerParams) {
  const theoretical = visualToTheoretical(
    params.visualX,
    params.visualY,
    params.offset,
  )

  // Get the color from the tile only (not user pixels)
  const tileColor = params.getTileColorAt(theoretical.x, theoretical.y)

  if (tileColor) {
    // Get the darker version of this color
    const darkerColor = getDarkerColor(tileColor)

    if (darkerColor) {
      // Paint the darker color to user layer
      params.setPixel(theoretical.x, theoretical.y, darkerColor)
    }
  }
}

/**
 * Main click handler that routes to the appropriate tool handler
 */
export function handleToolClick(
  selectedTool: ToolType,
  params: ToolHandlerParams,
) {
  if (selectedTool === ToolType.MOVE) return

  switch (selectedTool) {
    case ToolType.PIPETTE:
      handlePipetteTool(params)
      break
    case ToolType.PAINT_BUCKET:
      handlePaintBucketTool(params)
      break
    case ToolType.BRUSH:
      handleBrushTool(params)
      break
    case ToolType.ERASER:
      handleEraserTool(params)
      break
    case ToolType.PENCIL:
      handlePencilTool(params)
      break
    case ToolType.STAMP:
      handleStampTool(params)
      break
    case ToolType.DARKEN:
      handleDarkenTool(params)
      break
  }
}
