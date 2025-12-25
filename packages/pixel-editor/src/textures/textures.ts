import { colors } from '../colors/colors'
import type { Color } from '@/types'

// Texture rendering function
// px, py are pixel coordinates within a 24x16 button (0-23 for x, 0-15 for y)
export type TextureRenderer = (px: number, py: number) => string

export type Texture = {
  id: number
  name: string
  primary: Color
  secondary: Color
  renderer: TextureRenderer
}

// Helper function to create field texture patterns
function createFieldTextureRenderer(
  primary: Color,
  secondary: Color,
): TextureRenderer {
  return (px: number, py: number) => {
    // Pattern creates diagonal stripes: 3 primary, 2 secondary, repeating
    // The stripes shift 2 pixels left per row (wrapping at 5)
    // secondary appears where the diagonal coordinate is 3 or 4
    const diagonalCoord = (((px - py * 2) % 5) + 5) % 5
    const isSecondary = diagonalCoord >= 3
    const { rgb } = isSecondary ? secondary : primary
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
  }
}

// Import colors from the color palette
const yellow = colors.find(c => c.id === 10)! // Yellow
const gold = colors.find(c => c.id === 9)! // Gold
const lightGoldenRod = colors.find(c => c.id === 39)! // Light Goldenrod
const goldenRod = colors.find(c => c.id === 38)! // Goldenrod
const lightOlive = colors.find(c => c.id === 42)! // Light Olive
const olive = colors.find(c => c.id === 41)! // Olive
const darkOlive = colors.find(c => c.id === 40)! // Dark Olive
const brown = colors.find(c => c.id === 30)! // Brown
const lightBrown = colors.find(c => c.id === 50)! // Light Brown

export const textures: Texture[] = [
  {
    id: 0,
    name: 'Wheat',
    primary: yellow,
    secondary: gold,
    renderer: createFieldTextureRenderer(yellow, gold),
  },
  {
    id: 1,
    name: 'Hay',
    primary: lightGoldenRod,
    secondary: goldenRod,
    renderer: createFieldTextureRenderer(lightGoldenRod, goldenRod),
  },
  {
    id: 2,
    name: 'Cut Hay',
    primary: lightOlive,
    secondary: olive,
    renderer: createFieldTextureRenderer(lightOlive, olive),
  },
  {
    id: 3,
    name: 'Dark Cut Hay',
    primary: olive,
    secondary: darkOlive,
    renderer: createFieldTextureRenderer(olive, darkOlive),
  },
  {
    id: 4,
    name: 'Soil',
    primary: brown,
    secondary: lightBrown,
    renderer: createFieldTextureRenderer(brown, lightBrown),
  },
]
