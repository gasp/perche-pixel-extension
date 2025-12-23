import { colors } from '@/colors/colors'
import { FillMode } from '@/stores'
import { textures } from '@/textures/textures'
import type { PixelColor } from '@/types'

/**
 * Get the current color for a specific pixel position
 * Takes into account the fill mode (color or texture)
 */
export function getColorForPixel(
  x: number,
  y: number,
  fillMode: FillMode,
  selectedColorId: number,
  selectedTextureId: number,
): PixelColor {
  if (fillMode === FillMode.TEXTURE) {
    const texture = textures.find(t => t.id === selectedTextureId)
    if (texture) {
      // Calculate the texture color for this specific pixel coordinate
      return texture.renderer(x, y)
    }
  }

  // Default to color mode
  const color = colors.find(c => c.id === selectedColorId)
  if (!color || color.id === 0) return null // transparent
  const [r, g, b] = color.rgb
  return `rgb(${r}, ${g}, ${b})`
}

/**
 * Parse RGB string and find matching color ID from the colors array
 */
export function findColorIdFromRgb(rgbString: string | null): number | null {
  if (!rgbString) return null

  // Parse rgb(r, g, b) format
  const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (!match) return null

  const r = parseInt(match[1], 10)
  const g = parseInt(match[2], 10)
  const b = parseInt(match[3], 10)

  // Find matching color in colors array
  const matchingColor = colors.find(
    color => color.rgb[0] === r && color.rgb[1] === g && color.rgb[2] === b,
  )

  return matchingColor ? matchingColor.id : null
}
