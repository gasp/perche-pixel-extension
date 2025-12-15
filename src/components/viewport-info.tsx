import { useViewportStore } from '@/stores'

export function ViewportInfo() {
  const { x, y } = useViewportStore(state => state.offset)
  const { width, height } = useViewportStore(state => state.dimensions)
  const pixelSize = useViewportStore(state => state.pixelSize)
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        fontFamily: 'monospace',
      }}
    >
      <div>
        <div>
          Offset: ({x}, {y})
        </div>
        <div>
          Dimensions: ({width} × {height})
        </div>
        <div>Pixel Size: {pixelSize}</div>
      </div>
    </div>
  )
}
