import { BrushSizeButton } from './brush-size-button'
import { brushSizes } from './brush-sizes'

type OwnProps = {
  onSizeSelect: (size: number) => void
  selectedSize: number
}

export function BrushSizeList({ onSizeSelect, selectedSize }: OwnProps) {
  return (
    <div className="flex flex-col gap-[2px] p-[4px]">
      {brushSizes.map(brushSize => (
        <BrushSizeButton
          key={brushSize.id}
          size={brushSize.size}
          name={brushSize.name}
          onClick={() => onSizeSelect(brushSize.size)}
          isSelected={selectedSize === brushSize.size}
        />
      ))}
    </div>
  )
}
