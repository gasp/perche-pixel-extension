export function LoadingInfo() {
  return (
    <div
      style={{
        position: 'absolute',
        left: '10px',
        bottom: '50px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        fontFamily: 'monospace',
      }}
      className="w-fit"
    >
      <div>Loading tile...</div>
    </div>
  )
}
