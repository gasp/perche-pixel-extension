import { useViewportStore } from '@/stores'

const DEVICE_PIXEL_RATIO = window.devicePixelRatio || 1

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
        padding: '6px 8px',
        borderRadius: '2px',
        fontSize: '6px',
        fontFamily: 'monospace',
        textTransform: 'uppercase',
      }}>
      <div>
        <div>
          Offset: ({x}, {y})
        </div>
        <div>
          Dimensions: ({width} × {height})
        </div>
        <div>
          Pixel Size: {pixelSize} ({DEVICE_PIXEL_RATIO}x)
        </div>
      </div>
    </div>
  )
}
