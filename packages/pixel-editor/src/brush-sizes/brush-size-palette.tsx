import { useBrushSizeStore } from '@/stores'
import { BrushSizeList } from './brush-size-list'
import { Palette } from '../components'

export function BrushSizePalette() {
  const selectedSize = useBrushSizeStore(state => state.selectedSize)
  const setSelectedSize = useBrushSizeStore(state => state.setSelectedSize)

  return (
    <Palette title="Brush Size" paletteId="brush-size">
      <BrushSizeList
        selectedSize={selectedSize}
        onSizeSelect={setSelectedSize}
      />
    </Palette>
  )
}
