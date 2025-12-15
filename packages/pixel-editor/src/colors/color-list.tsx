import { ColorButton } from './color-button'
import { colors } from './colors'

type OwnProps = {
  onColorSelect: (colorId: number) => void
  selectedColorId: number
}

export function ColorList({ onColorSelect, selectedColorId }: OwnProps) {
  return (
    <div className="flex flex-wrap gap-0 p-[2px]" style={{ width: '96px' }}>
      {colors
        .filter(color => color.id !== 0) // Skip transparent color
        .map(color => (
          <ColorButton
            key={color.id}
            rgb={color.rgb}
            name={color.name}
            onClick={() => onColorSelect(color.id)}
            isSelected={selectedColorId === color.id}
          />
        ))}
    </div>
  )
}
