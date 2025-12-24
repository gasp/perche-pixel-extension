import { colors } from '@/colors/colors'
import type { PixelColor } from '@/types'

/**
 * Color darkening progression map
 * Maps each color ID to its darker version based on the color progression
 */
const colorDarkeningMap: Record<number, number> = {
  // Transparent stays transparent
  0: 0,

  // Grayscale progression: Light Gray -> Gray -> Dark Gray -> Black
  1: 1, // Black -> Black
  2: 1, // Dark Gray -> Black
  3: 2, // Gray -> Dark Gray
  4: 3, // Light Gray -> Gray
  5: 4, // White -> Light Gray

  // Red progression: Light Red -> Red -> Dark Red -> Deep Red
  6: 6, // Deep Red -> Deep Red (darkest)
  7: 6, // Red -> Deep Red
  8: 7, // Orange -> Red
  9: 8, // Gold -> Orange
  10: 9, // Yellow -> Gold
  11: 10, // Light Yellow -> Yellow

  // Green progression
  12: 12, // Dark Green -> Dark Green (darkest)
  13: 12, // Green -> Dark Green
  14: 13, // Light Green -> Green

  // Teal progression
  15: 15, // Dark Teal -> Dark Teal (darkest)
  16: 15, // Teal -> Dark Teal
  17: 16, // Light Teal -> Teal

  // Blue progression
  18: 18, // Dark Blue -> Dark Blue (darkest)
  19: 18, // Blue -> Dark Blue
  20: 19, // Cyan -> Blue

  // Indigo/Purple progression
  21: 18, // Indigo -> Dark Blue (close match)
  22: 21, // Light Indigo -> Indigo

  23: 23, // Dark Purple -> Dark Purple (darkest)
  24: 23, // Purple -> Dark Purple
  25: 24, // Light Purple -> Purple

  // Pink progression
  26: 26, // Dark Pink -> Dark Pink (darkest)
  27: 26, // Pink -> Dark Pink
  28: 27, // Light Pink -> Pink

  // Brown/Beige progression
  29: 29, // Dark Brown -> Dark Brown (darkest)
  30: 29, // Brown -> Dark Brown
  31: 30, // Beige -> Brown

  // Premium colors
  32: 3, // Medium Gray -> Gray
  33: 6, // Dark Red -> Deep Red
  34: 7, // Light Red -> Red
  35: 33, // Dark Orange -> Dark Red
  36: 31, // Light Tan -> Beige
  37: 30, // Dark Goldenrod -> Brown
  38: 37, // Goldenrod -> Dark Goldenrod
  39: 38, // Light Goldenrod -> Goldenrod
  40: 40, // Dark Olive -> Dark Olive (darkest)
  41: 40, // Olive -> Dark Olive
  42: 41, // Light Olive -> Olive
  43: 18, // Dark Cyan -> Dark Blue
  44: 20, // Light Cyan -> Cyan
  45: 19, // Light Blue -> Blue
  46: 23, // Dark Indigo -> Dark Purple
  47: 47, // Dark Slate Blue -> Dark Slate Blue (darkest)
  48: 47, // Slate Blue -> Dark Slate Blue
  49: 48, // Light Slate Blue -> Slate Blue
  50: 30, // Light Brown -> Brown
  51: 29, // Dark Beige -> Dark Brown
  52: 31, // Light Beige -> Beige
  53: 53, // Dark Peach -> Dark Peach (darkest)
  54: 53, // Peach -> Dark Peach
  55: 54, // Light Peach -> Peach
  56: 56, // Dark Tan -> Dark Tan (darkest)
  57: 56, // Tan -> Dark Tan
  58: 58, // Dark Slate -> Dark Slate (darkest)
  59: 58, // Slate -> Dark Slate
  60: 59, // Light Slate -> Slate
  61: 61, // Dark Stone -> Dark Stone (darkest)
  62: 61, // Stone -> Dark Stone
  63: 62, // Light Stone -> Stone
}

/**
 * Get the darker version of a color based on its RGB values
 * @param rgbString - The RGB string of the current color (e.g., "rgb(255, 255, 255)")
 * @returns The RGB string of the darker color, or null if no match found
 */
export function getDarkerColor(rgbString: PixelColor): PixelColor {
  if (!rgbString) return null

  // Parse the RGB string to find the matching color
  const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (!match) return null

  const r = parseInt(match[1], 10)
  const g = parseInt(match[2], 10)
  const b = parseInt(match[3], 10)

  // Find the current color ID
  const currentColor = colors.find(
    color => color.rgb[0] === r && color.rgb[1] === g && color.rgb[2] === b,
  )

  if (!currentColor) return null

  // Get the darker color ID
  const darkerColorId = colorDarkeningMap[currentColor.id]
  if (darkerColorId === undefined) return null

  // Find the darker color
  const darkerColor = colors.find(color => color.id === darkerColorId)
  if (!darkerColor || darkerColor.id === 0) return null

  const [dr, dg, db] = darkerColor.rgb
  return `rgb(${dr}, ${dg}, ${db})`
}
