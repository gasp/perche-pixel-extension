import type { PixelColor } from '@/types'

export type TileData = {
  pixels: Map<string, PixelColor>
  width: number
  height: number
}

function gridKey(x: number, y: number): string {
  return `${x},${y}`
}

/**
 * Converts RGB values to hex color string
 */
function rgbToHex(r: number, g: number, b: number): string {
  return `rgb(${r}, ${g}, ${b})`
}

/**
 * Loads a PNG image from a URL and extracts pixel colors
 */
export async function loadTileFromUrl(url: string): Promise<TileData> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      try {
        // Create a temporary canvas to read pixel data
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        // Draw the image onto the canvas
        ctx.drawImage(img, 0, 0)

        // Get pixel data
        const imageData = ctx.getImageData(0, 0, img.width, img.height)
        const data = imageData.data

        const pixels = new Map<string, PixelColor>()

        // Extract pixel colors (RGBA format)
        for (let y = 0; y < img.height; y++) {
          for (let x = 0; x < img.width; x++) {
            const index = (y * img.width + x) * 4
            const r = data[index]
            const g = data[index + 1]
            const b = data[index + 2]
            const a = data[index + 3]

            // Only store non-transparent pixels
            if (a > 0) {
              const color = rgbToHex(r, g, b)
              pixels.set(gridKey(x, y), color)
            }
          }
        }

        resolve({
          pixels,
          width: img.width,
          height: img.height,
        })
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error(`Failed to load image from ${url}`))
    }

    img.src = url
  })
}

/**
 * Loads tile data into the pixel store at specified offset
 */
export function loadTileIntoStore(
  tileData: TileData,
  offsetX: number,
  offsetY: number,
  setPixel: (x: number, y: number, color: PixelColor) => void,
) {
  tileData.pixels.forEach((color, key) => {
    const [x, y] = key.split(',').map(Number)
    setPixel(x + offsetX, y + offsetY, color)
  })
}
