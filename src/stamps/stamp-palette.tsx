import { useStampStore } from '@/stores'
import { Palette } from '../components'
import { StampList } from './stamp-list'

export function StampPalette() {
  const selectedStampId = useStampStore(state => state.selectedStampId)
  const setSelectedStampId = useStampStore(state => state.setSelectedStampId)

  return (
    <Palette title="Stamp Palette" paletteId="stamp">
      <StampList
        selectedStampId={selectedStampId}
        onStampSelect={setSelectedStampId}
      />
    </Palette>
  )
}
