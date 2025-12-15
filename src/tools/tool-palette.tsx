import { useToolStore, useFillStore, FillMode } from '@/stores'
import { ToolsList } from './tools-list'
import { colors } from '../colors/colors'
import { textures, TexturePreview } from '../textures'
import { Palette } from '../components'

export function ToolPalette() {
  const selectedTool = useToolStore(state => state.selectedTool)
  const setSelectedTool = useToolStore(state => state.setSelectedTool)
  const selectedColorId = useFillStore(state => state.selectedColorId)
  const selectedTextureId = useFillStore(state => state.selectedTextureId)
  const fillMode = useFillStore(state => state.fillMode)

  const selectedColor = colors.find(c => c.id === selectedColorId)
  const selectedTexture = textures.find(t => t.id === selectedTextureId)

  const colorStyle =
    selectedColor && selectedColor.id === 0
      ? 'transparent'
      : selectedColor
        ? `rgb(${selectedColor.rgb[0]}, ${selectedColor.rgb[1]}, ${selectedColor.rgb[2]})`
        : 'transparent'

  return (
    <Palette title="Tool Palette" paletteId="tool">
      <ToolsList selectedTool={selectedTool} onToolSelect={setSelectedTool} />

      <div className="border-t border-black p-[2px]">
        {fillMode === FillMode.COLOR ? (
          <div
            className="h-[20px] w-[20px] border border-black"
            style={{ backgroundColor: colorStyle }}
            title={selectedColor?.name || 'No color selected'}
          />
        ) : (
          <TexturePreview
            renderer={selectedTexture?.renderer}
            name={selectedTexture?.name || 'No texture selected'}
          />
        )}
      </div>
    </Palette>
  )
}
