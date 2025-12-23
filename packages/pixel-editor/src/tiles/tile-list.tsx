import { ScanEye, ScanQrCode, ScanLine } from 'lucide-react'
import { useTileStore } from '@/stores'
import { TileButton } from './tile-button'

export function TileList() {
  const {
    opacity,
    toggleOpacity,
    bgColor,
    toggleBgColor,
    userPixelOpacity,
    toggleUserPixelOpacity,
  } = useTileStore()

  return (
    <div className="-mt-1 flex gap-1 p-1">
      <TileButton
        icon={ScanEye}
        onClick={toggleOpacity}
        isActive={opacity === 0.5}
        title={`Toggle tile opacity (${opacity === 0.5 ? 'Opaque' : 'Transparent'})`}
      />
      <TileButton
        icon={ScanLine}
        onClick={toggleUserPixelOpacity}
        isActive={userPixelOpacity === 0.5}
        title={`Toggle user pixel opacity (${userPixelOpacity === 0.5 ? 'Opaque' : 'Transparent'})`}
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
