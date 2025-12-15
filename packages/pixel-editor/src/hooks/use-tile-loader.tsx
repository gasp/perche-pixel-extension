import { useState, useCallback } from 'react'
import { useTilePixelStore } from '@/stores'
import { loadTileFromUrl } from '@/tiles'

export function useTileLoader() {
  const loadPixels = useTilePixelStore(state => state.loadPixels)
  const [isLoadingTile, setIsLoadingTile] = useState(false)

  const loadTile = useCallback(
    async (tileUrl: string) => {
      setIsLoadingTile(true)
      try {
        console.log('Loading tile from:', tileUrl)

        const tileData = await loadTileFromUrl(tileUrl)

        // Load the tile pixels into the store (at origin 0,0)
        loadPixels(tileData.pixels)

        console.log(
          `✅ Loaded tile: ${tileData.width}x${tileData.height} with ${tileData.pixels.size} pixels`,
        )
      } catch (error) {
        console.error('❌ Failed to load tile:', error)
        throw error
      } finally {
        setIsLoadingTile(false)
      }
    },
    [loadPixels],
  )

  return { isLoadingTile, loadTile }
}
