import type { LucideIcon } from 'lucide-react'

type TileButtonProps = {
  icon: LucideIcon
  onClick: () => void
  isActive?: boolean
  title?: string
}

export function TileButton({
  icon: Icon,
  onClick,
  isActive = false,
  title,
}: TileButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex h-[20px] w-[20px] items-center justify-center p-[3px] text-black transition-none ${
        isActive
          ? 'border-[1px] border-t-[#7a7a7a] border-r-[#e8e8e8] border-b-[#e8e8e8] border-l-[#7a7a7a] bg-[#b0b0b0]'
          : 'border-[1px] border-t-[#ffffff] border-r-[#7a7a7a] border-b-[#7a7a7a] border-l-[#ffffff] bg-[#dcdcdc] hover:bg-[#e8e8e8]'
      }`}
    >
      <Icon size={14} />
    </button>
  )
}
