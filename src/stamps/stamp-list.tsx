import { StampButton } from './stamp-button'
import { stamps } from './stamps'

type OwnProps = {
  onStampSelect: (stampId: number) => void
  selectedStampId: number
}

export function StampList({ onStampSelect, selectedStampId }: OwnProps) {
  return (
    <div className="flex flex-wrap gap-0 p-[2px]" style={{ width: '80px' }}>
      {stamps.map(stamp => (
        <StampButton
          key={stamp.id}
          name={stamp.name}
          pixels={stamp.pixels}
          onClick={() => onStampSelect(stamp.id)}
          isSelected={selectedStampId === stamp.id}
        />
      ))}
    </div>
  )
}
