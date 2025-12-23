import { ToolType } from '@/tools/tools'

export type MouseDownParams = {
  clientX: number
  clientY: number
  pixelX: number
  pixelY: number
  selectedTool: ToolType
  setLastMousePos: (pos: { x: number; y: number }) => void
  handleClick: (visualX: number, visualY: number) => void
  setIsDragging: (value: boolean) => void
  setIsDrawing: (value: boolean) => void
}

export type MouseMoveParams = {
  clientX: number
  clientY: number
  pixelX: number
  pixelY: number
  pixelSize: number
  selectedTool: ToolType
  isDragging: boolean
  isDrawing: boolean
  getLastMousePos: () => { x: number; y: number }
  setLastMousePos: (pos: { x: number; y: number }) => void
  moveViewport: (deltaX: number, deltaY: number) => void
  handleClick: (visualX: number, visualY: number) => void
  handleHover: (visualX: number, visualY: number) => void
}

export type MouseUpParams = {
  isDragging: boolean
  isDrawing: boolean
  setIsDragging: (value: boolean) => void
  setIsDrawing: (value: boolean) => void
}

export type MouseLeaveParams = {
  isDragging: boolean
  isDrawing: boolean
  setIsDragging: (value: boolean) => void
  setIsDrawing: (value: boolean) => void
  handleHoverLeave: () => void
}

/**
 * Handle mouse down event
 */
export function handleMouseDown(params: MouseDownParams) {
  params.setLastMousePos({ x: params.clientX, y: params.clientY })

  if (params.selectedTool === ToolType.MOVE) {
    params.setIsDragging(true)
  } else if (
    params.selectedTool === ToolType.PIPETTE ||
    params.selectedTool === ToolType.PAINT_BUCKET
  ) {
    // Pipette and paint bucket tools - just execute on click, don't drag
    params.handleClick(params.pixelX, params.pixelY)
  } else {
    // Drawing tools (pencil, brush, eraser, stamp) - start drawing
    params.setIsDrawing(true)
    // Paint immediately on mouse down
    params.handleClick(params.pixelX, params.pixelY)
  }
}

/**
 * Handle mouse move event
 */
export function handleMouseMove(params: MouseMoveParams) {
  // Handle move tool dragging
  if (params.selectedTool === ToolType.MOVE && params.isDragging) {
    const lastMousePos = params.getLastMousePos()

    // Calculate movement delta since last mouse position
    const deltaX = params.clientX - lastMousePos.x
    const deltaY = params.clientY - lastMousePos.y

    // Convert to pixel delta
    const pixelDeltaX = Math.floor(deltaX / params.pixelSize)
    const pixelDeltaY = Math.floor(deltaY / params.pixelSize)

    // Update viewport if we moved at least one pixel
    if (pixelDeltaX !== 0 || pixelDeltaY !== 0) {
      params.moveViewport(pixelDeltaX, pixelDeltaY)
      // Update last position by the amount we actually moved
      params.setLastMousePos({
        x: lastMousePos.x + pixelDeltaX * params.pixelSize,
        y: lastMousePos.y + pixelDeltaY * params.pixelSize,
      })
    }
    return
  }

  // Handle drawing tool painting while dragging
  if (params.selectedTool !== ToolType.MOVE && params.isDrawing) {
    params.handleClick(params.pixelX, params.pixelY)
    params.handleHover(params.pixelX, params.pixelY)
    return
  }

  // Handle hover preview for drawing tools (when not drawing)
  if (params.selectedTool !== ToolType.MOVE) {
    params.handleHover(params.pixelX, params.pixelY)
  }
}

/**
 * Handle mouse up event
 */
export function handleMouseUp(params: MouseUpParams) {
  if (params.isDragging) {
    params.setIsDragging(false)
  }
  if (params.isDrawing) {
    params.setIsDrawing(false)
  }
}

/**
 * Handle mouse leave event
 */
export function handleMouseLeave(params: MouseLeaveParams) {
  if (params.isDragging) {
    params.setIsDragging(false)
  }
  if (params.isDrawing) {
    params.setIsDrawing(false)
  }
  params.handleHoverLeave()
}
