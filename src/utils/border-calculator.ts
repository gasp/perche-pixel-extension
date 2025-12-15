import type { PixelCoord } from '@/types'

export type BorderSegment = {
  x1: number
  y1: number
  x2: number
  y2: number
}

/**
 * Calculate border segments for a set of selected pixels.
 * Only draws borders where pixels are not adjacent.
 */
export function calculateBorderSegments(pixels: PixelCoord[]): BorderSegment[] {
  if (pixels.length === 0) return []

  // Create a set for fast lookup
  const pixelSet = new Set(pixels.map(p => `${p.x},${p.y}`))

  const segments: BorderSegment[] = []

  // For each pixel, check each of its 4 edges
  for (const pixel of pixels) {
    const { x, y } = pixel

    // Top edge: draw if no pixel above
    if (!pixelSet.has(`${x},${y - 1}`)) {
      segments.push({
        x1: x,
        y1: y,
        x2: x + 1,
        y2: y,
      })
    }

    // Right edge: draw if no pixel to the right
    if (!pixelSet.has(`${x + 1},${y}`)) {
      segments.push({
        x1: x + 1,
        y1: y,
        x2: x + 1,
        y2: y + 1,
      })
    }

    // Bottom edge: draw if no pixel below
    if (!pixelSet.has(`${x},${y + 1}`)) {
      segments.push({
        x1: x,
        y1: y + 1,
        x2: x + 1,
        y2: y + 1,
      })
    }

    // Left edge: draw if no pixel to the left
    if (!pixelSet.has(`${x - 1},${y}`)) {
      segments.push({
        x1: x,
        y1: y,
        x2: x,
        y2: y + 1,
      })
    }
  }

  return segments
}
