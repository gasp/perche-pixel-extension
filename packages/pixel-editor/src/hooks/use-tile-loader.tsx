import { useState, useCallback } from 'react'
import { useTilePixelStore } from '@/stores'
import { loadTileFromUrl } from '@/tiles'

export function useTileLoader() {
  const loadPixels = useTilePixelStore(state => state.loadPixels)
  const [isLoadingTile, setIsLoadingTile] = useState(false)

  const loadTile = useCallback(async () => {
    setIsLoadingTile(true)
    try {
      // TODO: this mihght not be needed anymore when running in the extension context
      // Use CORS proxy to load the tile
      // I am using a small script to proxy the request to avoid CORS issues
      // it is not a secure way to do this, but it is a quick and dirty solution
      // for now, we can use it to load the tile
      // https://api.thebugging.com/cors-proxy?url=
      const originalUrl =
        'https://backend.wplace.live/files/s0/tiles/1027/709.png'
      const proxyUrl = `http://localhost:3001/proxy?url=${encodeURIComponent(originalUrl)}`
      const tileData = await loadTileFromUrl(proxyUrl)

      // Load the tile pixels into the store (at origin 0,0)
      loadPixels(tileData.pixels)

      console.log(
        `Loaded tile: ${tileData.width}x${tileData.height} with ${tileData.pixels.size} pixels`,
      )
    } catch (error) {
      console.error('Failed to load tile:', error)
    } finally {
      setIsLoadingTile(false)
    }
  }, [loadPixels])

  return { isLoadingTile, loadTile }
}
