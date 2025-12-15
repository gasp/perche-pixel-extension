import { TextureButton } from './texture-button'
import { textures } from './textures'

type OwnProps = {
  onTextureSelect: (textureId: number) => void
  selectedTextureId: number
}

export function TextureList({ onTextureSelect, selectedTextureId }: OwnProps) {
  return (
    <div className="flex flex-wrap gap-0 p-[2px]" style={{ width: '80px' }}>
      {textures.map(texture => (
        <TextureButton
          key={texture.id}
          name={texture.name}
          renderer={texture.renderer}
          onClick={() => onTextureSelect(texture.id)}
          isSelected={selectedTextureId === texture.id}
        />
      ))}
    </div>
  )
}
