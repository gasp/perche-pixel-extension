import { useState, useEffect } from 'react'
import {
  useUserPixelStore,
  useTilePixelStore,
  useViewportStore,
} from '@/stores'
import { theoreticalToVisual } from '../utils/coordinate-converter'
import type { PixelMatrix } from '@/types'

export function useViewMatrix(): {
  userVisualPixelMatrix: PixelMatrix
  tileVisualPixelMatrix: PixelMatrix
} {
  const userPixelGrid = useUserPixelStore(state => state.userPixelGrid)
  const tilePixelGrid = useTilePixelStore(state => state.tilePixelGrid)
  const offset = useViewportStore(state => state.offset)
  const { width, height } = useViewportStore(state => state.dimensions)

  const [userVisualPixelMatrix, setPixelMatrix] = useState<PixelMatrix>(() =>
    Array.from({ length: height }, () =>
      Array.from({ length: width }, () => null),
    ),
  )
  const [tileVisualPixelMatrix, setTilePixelMatrix] = useState<PixelMatrix>(
    () =>
      Array.from({ length: height }, () =>
        Array.from({ length: width }, () => null),
      ),
  )

  // TODO: separate this into two useEffects, one for the infinite grid and one for the tile pixels
  // we don't want to re-render the tile pixels when the infinite grid changes
  // and vice versa
  // maybe we can use a useRef for the tile pixels matrix
  /*
  const tilePixelsMatrixRef = useRef<PixelMatrix>(
    Array.from({ length: height }, () =>
      Array.from({ length: width }, () => null),
    ),
  )
    */
  useEffect(() => {
    const matrix: PixelMatrix = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => null),
    )
    const tileMatrix: PixelMatrix = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => null),
    )

    // Fill matrix with pixels from infinite grid based on viewport
    for (let visualY = 0; visualY < height; visualY++) {
      for (let visualX = 0; visualX < width; visualX++) {
        const theoretical = theoreticalToVisual(visualX, visualY, offset)
        const key = `${theoretical.x},${theoretical.y}`
        const color = userPixelGrid.get(key)

        if (color) {
          matrix[visualY][visualX] = color
        }
        if (tilePixelGrid.size > 0) {
          const tileColor = tilePixelGrid.get(key)
          if (tileColor) {
            tileMatrix[visualY][visualX] = tileColor
          }
        }
      }
    }

    // FIXME: This is a hack to ensure the matrix is updated after the store is updated
    // maybe we shouldn't use useEffect here
    setTimeout(() => {
      setPixelMatrix(matrix)
      if (tilePixelGrid.size > 0) {
        console.log(
          `setting ${tileMatrix.length}x${tileMatrix[0].length} tile matrix`,
        )
        setTilePixelMatrix(tileMatrix)
      }
    }, 0)
  }, [userPixelGrid, tilePixelGrid, offset, width, height])

  return { userVisualPixelMatrix, tileVisualPixelMatrix }
}
