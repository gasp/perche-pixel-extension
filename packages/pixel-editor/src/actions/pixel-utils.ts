import type { PixelColor } from '@/types'

/**
 * Get the pixel color at a specific coordinate
 * Checks user pixels first (on top), then tile pixels
 */
export function getPixelColorAt(
  x: number,
  y: number,
  getPixel: (x: number, y: number) => PixelColor | undefined,
  tilePixelGrid: Map<string, PixelColor>,
): PixelColor {
  const key = `${x},${y}`

  // Check user pixels first (these are on top)
  const userPixel = getPixel(x, y)
  if (userPixel !== undefined) return userPixel

  const tilePixel = tilePixelGrid.get(key)
  if (tilePixel) return tilePixel

  return null
}
