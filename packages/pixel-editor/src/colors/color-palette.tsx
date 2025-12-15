import { useFillStore } from '@/stores'
import { ColorList } from './color-list'
import { Palette } from '../components'

export function ColorPalette() {
  const selectedColorId = useFillStore(state => state.selectedColorId)
  const setSelectedColorId = useFillStore(state => state.setSelectedColorId)

  return (
    <Palette title="Color Palette" paletteId="color">
      <ColorList
        selectedColorId={selectedColorId}
        onColorSelect={setSelectedColorId}
      />
    </Palette>
  )
}
