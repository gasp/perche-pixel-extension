import { ScanEye, ScanQrCode } from 'lucide-react'
import { useTileStore } from '@/stores'
import { TileButton } from './tile-button'

export function TileList() {
  const { opacity, toggleOpacity, bgColor, toggleBgColor } = useTileStore()

  return (
    <div className="-mt-1 flex gap-1 p-1">
      <TileButton
        icon={ScanEye}
        onClick={toggleOpacity}
        isActive={opacity === 0.5}
        title={`Toggle tile opacity (${opacity === 0.5 ? 'Opaque' : 'Transparent'})`}
      />
      <TileButton
        icon={ScanQrCode}
        onClick={toggleBgColor}
        isActive={bgColor === 'red'}
        title={`Toggle background color (${bgColor})`}
      />
    </div>
  )
}
