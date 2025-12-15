import { create } from 'zustand'
import { TILE_SIZE } from '@/tiles/tile-preview'
/* This should be reachitectured and independent of the tile size
maybe there is something wrong with the offset calculation being negative in tile-preview
*/

type ViewportOffset = {
  x: number
  y: number
}

type ViewportDimensions = {
  width: number
  height: number
}

const MIN_PIXEL_SIZE = 2
const MAX_PIXEL_SIZE = 16
const DEFAULT_PIXEL_SIZE = 10
const PIXEL_SIZE_STEP = 2

type ViewportStore = {
  offset: ViewportOffset
  dimensions: ViewportDimensions
  pixelSize: number
  setViewportOffset: (offset: ViewportOffset) => void
  setDimensions: (dimensions: ViewportDimensions) => void
  moveViewport: (deltaX: number, deltaY: number) => void
  panToPixel: (pixelX: number, pixelY: number) => void
  increasePixelSize: () => void
  decreasePixelSize: () => void
}

function zoom(size: number, state: ViewportStore) {
  const newPixelSize = Math.max(MIN_PIXEL_SIZE, Math.min(MAX_PIXEL_SIZE, size))

  if (newPixelSize === state.pixelSize) {
    return state
  }

  const centerX = TILE_SIZE - state.offset.x + state.dimensions.width / 2
  const centerY = TILE_SIZE - state.offset.y + state.dimensions.height / 2

  const ratio = state.pixelSize / newPixelSize

  const newWidth = state.dimensions.width * ratio
  const newHeight = state.dimensions.height * ratio

  const newOffsetX = Math.round(centerX - newWidth / 2)
  const newOffsetY = Math.round(centerY - newHeight / 2)

  return {
    pixelSize: newPixelSize,
    offset: {
      x: TILE_SIZE - newOffsetX,
      y: TILE_SIZE - newOffsetY,
    },
  }
}
/**
 * Manage the viewport
 * in "drawing px" units
 */
export const useViewportStore = create<ViewportStore>(set => ({
  offset: { x: 0, y: 0 },
  dimensions: { width: 0, height: 0 },
  pixelSize: DEFAULT_PIXEL_SIZE,

  setViewportOffset: (offset: ViewportOffset) => set({ offset }),

  setDimensions: (dimensions: ViewportDimensions) => set({ dimensions }),

  moveViewport: (deltaX: number, deltaY: number) =>
    set(state => ({
      offset: {
        x: state.offset.x + deltaX,
        y: state.offset.y + deltaY,
      },
    })),

  panToPixel: (pixelX: number, pixelY: number) =>
    set(state => {
      // Set offset so the pixel is centered in the viewport
      // Following the same logic as tile-preview click handler
      // offset is negative, so we negate the calculation
      const newOffsetX = -(pixelX - state.dimensions.width / 2)
      const newOffsetY = -(pixelY - state.dimensions.height / 2)

      console.log(
        `📍 Panning to pixel (${pixelX}, ${pixelY}), offset: (${newOffsetX}, ${newOffsetY})`,
      )

      return {
        offset: {
          x: Math.floor(newOffsetX),
          y: Math.floor(newOffsetY),
        },
      }
    }),

  increasePixelSize: () =>
    set(state => zoom(state.pixelSize + PIXEL_SIZE_STEP, state)),

  decreasePixelSize: () =>
    set(state => zoom(state.pixelSize - PIXEL_SIZE_STEP, state)),
}))
