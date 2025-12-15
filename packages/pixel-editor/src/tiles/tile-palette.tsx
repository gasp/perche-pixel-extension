import { useTilePixelStore } from '@/stores'
import { Palette } from '../components'
import { TilePreview } from './tile-preview'
import { TileList } from './tile-list'

export function TilePalette() {
  const tilePixelGrid = useTilePixelStore(state => state.tilePixelGrid)

  return (
    <Palette title="Tile" paletteId="tile">
      <div className="p-1">
        <TilePreview tilePixelGrid={tilePixelGrid} maxDisplaySize={200} />
      </div>
      <TileList />
    </Palette>
  )
}
