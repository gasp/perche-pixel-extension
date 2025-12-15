import { type ReactNode } from 'react'

export interface ToolButtonProps {
  title: string
  onClick: () => void
  isSelected: boolean
  children: ReactNode
}

export function ToolButton({
  title,
  onClick,
  isSelected,
  children,
}: ToolButtonProps) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`flex h-[20px] w-[20px] items-center justify-center p-[3px] text-black transition-none ${
        isSelected
          ? 'border-[1px] border-t-[#7a7a7a] border-r-[#e8e8e8] border-b-[#e8e8e8] border-l-[#7a7a7a] bg-[#b0b0b0]'
          : 'border-[1px] border-t-[#ffffff] border-r-[#7a7a7a] border-b-[#7a7a7a] border-l-[#ffffff] bg-[#dcdcdc] hover:bg-[#e8e8e8]'
      }`}
    >
      {children}
    </button>
  )
}
