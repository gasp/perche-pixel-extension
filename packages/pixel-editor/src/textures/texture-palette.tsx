import { useFillStore } from '@/stores'
import { Palette } from '../components'
import { TextureList } from './texture-list'

export function TexturePalette() {
  const selectedTextureId = useFillStore(state => state.selectedTextureId)
  const setSelectedTextureId = useFillStore(state => state.setSelectedTextureId)

  return (
    <Palette title="Texture Palette" paletteId="texture">
      <TextureList
        selectedTextureId={selectedTextureId}
        onTextureSelect={setSelectedTextureId}
      />
    </Palette>
  )
}
