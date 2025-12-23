import type { PixelColor } from '@/types'

/**
 * Find contiguous transparent pixels using 4-directional flood fill
 * Starting from the first pixel under the cursor
 * Uses clockwise rotation: right, down, left, up
 * This prevents selection from passing through diagonal gaps
 */
export function findContiguousTransparentPixels(
  startX: number,
  startY: number,
  getPixelColorAt: (x: number, y: number) => PixelColor,
): { x: number; y: number }[] {
  const result: { x: number; y: number }[] = []
  const visited = new Set<string>()
  const queue: { x: number; y: number }[] = []

  // Check if start pixel is transparent
  const startPixel = getPixelColorAt(startX, startY)
  if (startPixel !== null) {
    // Not transparent, return empty array
    return []
  }

  // 4-directional connectivity (clockwise): right, down, left, up
  const directions = [
    { dx: 1, dy: 0 }, // right
    { dx: 0, dy: 1 }, // down
    { dx: -1, dy: 0 }, // left
    { dx: 0, dy: -1 }, // up
  ]

  queue.push({ x: startX, y: startY })
  visited.add(`${startX},${startY}`)

  while (queue.length > 0 && result.length < 1024) {
    const current = queue.shift()!
    result.push(current)

    // Check all directions in clockwise order
    for (const dir of directions) {
      const nextX = current.x + dir.dx
      const nextY = current.y + dir.dy
      const key = `${nextX},${nextY}`

      if (!visited.has(key)) {
        visited.add(key)
        const pixel = getPixelColorAt(nextX, nextY)
        if (pixel === null) {
          // Transparent pixel found
          queue.push({ x: nextX, y: nextY })
        }
      }
    }
  }

  return result
}
