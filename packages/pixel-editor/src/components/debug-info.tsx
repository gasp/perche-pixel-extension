import { useUserPixelStore, useTilePixelStore } from '@/stores'

export function DebugInfo() {
  const userPixelGrid = useUserPixelStore(state => state.userPixelGrid)
  const tilePixelGrid = useTilePixelStore(state => state.tilePixelGrid)
  return (
    <div
      style={{
        position: 'absolute',
        left: '10px',
        bottom: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        fontFamily: 'monospace',
      }}
      className="w-fit">
      <div>
        {userPixelGrid.size} pixels drawn / {tilePixelGrid.size} tile pixels
      </div>
    </div>
  )
}
