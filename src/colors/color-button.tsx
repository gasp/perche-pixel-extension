import type { Color } from '@/types'

export type ColorButtonProps = Color & {
  name: string
  onClick: () => void
  isSelected: boolean
}

export function ColorButton({
  rgb,
  name,
  onClick,
  isSelected,
}: ColorButtonProps) {
  const rgbColor = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`

  return (
    <button
      title={name}
      onClick={onClick}
      className={`h-[8px] w-[8px] transition-none ${
        isSelected
          ? 'border-[1px] border-white'
          : 'border-[1px] border-transparent'
      }`}
      style={{
        backgroundColor: rgbColor,
      }}
    />
  )
}
