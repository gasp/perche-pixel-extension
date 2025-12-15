export interface BrushSizeButtonProps {
  size: number
  name: string
  onClick: () => void
  isSelected: boolean
}

export function BrushSizeButton({
  size,
  name,
  onClick,
  isSelected,
}: BrushSizeButtonProps) {
  return (
    <button
      title={`${name} (${size}px)`}
      onClick={onClick}
      className={`flex h-[16px] w-[16px] items-center justify-center border transition-none ${
        isSelected
          ? 'border-[2px] border-black bg-white'
          : 'border-[1px] border-gray-400 bg-[#dcdcdc] hover:border-black'
      }`}
    >
      <div
        className="rounded-full bg-black"
        style={{
          width: `${Math.min(size, 12)}px`,
          height: `${Math.min(size, 12)}px`,
        }}
      />
    </button>
  )
}
