type ViewportOffset = {
  x: number
  y: number
}

/**
 * Converts theoretical infinite grid coordinates to visual canvas coordinates
 * use to READ pixels from the infinite grid
 */
export function theoreticalToVisual(
  theoreticalX: number,
  theoreticalY: number,
  viewportOffset: ViewportOffset,
): { x: number; y: number } {
  return {
    x: theoreticalX - viewportOffset.x,
    y: theoreticalY - viewportOffset.y,
  }
}

/**
 * Converts visual canvas coordinates to theoretical infinite grid coordinates
 * use to WRITE pixels to the infinite grid
 */
export function visualToTheoretical(
  visualX: number,
  visualY: number,
  viewportOffset: ViewportOffset,
): { x: number; y: number } {
  return {
    x: visualX - viewportOffset.x,
    y: visualY - viewportOffset.y,
  }
}
