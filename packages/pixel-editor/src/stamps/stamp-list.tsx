import { StampButton } from './stamp-button'
import { stamps } from './stamps'

type OwnProps = {
  onStampSelect: (stampId: number) => void
  selectedStampId: number
}

export function StampList({ onStampSelect, selectedStampId }: OwnProps) {
  return (
    <div
      className="flex flex-wrap gap-[1px] p-[2px]"
      style={{ width: '138px' }}>
      {stamps
        .sort((a, b) => a.pixels.length - b.pixels.length)
        .map(stamp => (
          <StampButton
            key={`stamp-${stamp.id}`}
            name={stamp.name}
            pixels={stamp.pixels}
            onClick={() => onStampSelect(stamp.id)}
            isSelected={selectedStampId === stamp.id}
          />
        ))}
    </div>
  )
}
