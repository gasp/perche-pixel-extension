import { useState, useRef, useEffect, type ReactNode } from 'react'
import { usePaletteStore, type PaletteId } from '@/stores'

export type OwnProps = {
  children: ReactNode
  title?: string
  paletteId: PaletteId
}

export function Palette({ children, title, paletteId }: OwnProps) {
  const position = usePaletteStore(state => state.palettes[paletteId].position)
  const zIndex = usePaletteStore(state => state.palettes[paletteId].zIndex)
  const isCollapsed = usePaletteStore(
    state => state.palettes[paletteId].isCollapsed,
  )
  const setPosition = usePaletteStore(state => state.setPosition)
  const bringToFront = usePaletteStore(state => state.bringToFront)
  const toggleCollapsed = usePaletteStore(state => state.toggleCollapsed)

  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const paletteRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition(paletteId, {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset, paletteId, setPosition])

  const handleDragStart = (e: React.MouseEvent) => {
    if (paletteRef.current) {
      const rect = paletteRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsDragging(true)
      bringToFront(paletteId)
    }
  }

  const handleDoubleClick = () => {
    toggleCollapsed(paletteId)
  }

  const handleMouseDown = () => {
    bringToFront(paletteId)
  }

  return (
    <div
      ref={paletteRef}
      className="fixed border border-black bg-[#dcdcdc]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex,
      }}
      role="toolbar"
      aria-label={title}
      onMouseDown={handleMouseDown}
    >
      <div
        className="h-3 w-full cursor-move border-b border-black p-[1px] select-none"
        onMouseDown={handleDragStart}
        onDoubleClick={handleDoubleClick}
        aria-label={title ? `Drag ${title}` : 'Drag palette'}
      >
        {isCollapsed && title ? (
          <div className="flex h-full w-full items-center justify-center bg-[#dcdcdc] px-2">
            <span className="text-[6px] font-bold tracking-wide text-black uppercase">
              {title}
            </span>
          </div>
        ) : (
          <div
            className="h-full w-full bg-gray-400"
            style={{
              backgroundImage: 'radial-gradient(white 1px, transparent 0)',
              backgroundSize: '2px 2px',
            }}
          />
        )}
      </div>

      {!isCollapsed && children}
    </div>
  )
}
