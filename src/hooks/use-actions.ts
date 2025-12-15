import { useRef, useState, useMemo } from 'react'
import {
  useUserPixelStore,
  useToolStore,
  useViewportStore,
  useHoverStore,
  useFillStore,
  useBrushSizeStore,
  useStampStore,
  FillMode,
} from '@/stores'
import type { PixelColor } from '@/types'
import { visualToTheoretical } from '../utils/coordinate-converter'
import { getCirclePattern } from '../actions/brush'
import { ToolType } from '../tools/tools'
import { colors } from '../colors/colors'
import { textures } from '../textures/textures'
import { stamps } from '../stamps/stamps'

export function useActions() {
  const selectedTool = useToolStore(state => state.selectedTool)
  const selectedColorId = useFillStore(state => state.selectedColorId)
  const selectedTextureId = useFillStore(state => state.selectedTextureId)
  const fillMode = useFillStore(state => state.fillMode)
  const brushSize = useBrushSizeStore(state => state.selectedSize)
  const selectedStampId = useStampStore(state => state.selectedStampId)
  const offset = useViewportStore(state => state.offset)
  const moveViewport = useViewportStore(state => state.moveViewport)
  const setPixel = useUserPixelStore(state => state.setPixel)
  const setHoveredPixels = useHoverStore(state => state.setHoveredPixels)
  const clearHoveredPixels = useHoverStore(state => state.clearHoveredPixels)

  const [isDragging, setIsDragging] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const lastMousePosRef = useRef({ x: 0, y: 0 })

  // Calculate brush/eraser pattern based on selected brush size
  const brushPattern = useMemo(() => getCirclePattern(brushSize), [brushSize])

  // Calculate stamp pattern based on selected stamp
  const stampPattern = useMemo(() => {
    const stamp = stamps.find(s => s.id === selectedStampId)
    if (!stamp) return []
    return stamp.pixels.map(pixel => ({
      dx: pixel.x,
      dy: pixel.y,
      rgb: pixel.rgb,
    }))
  }, [selectedStampId])

  // Get the current color for a specific pixel position
  const getColorForPixel = (x: number, y: number): PixelColor => {
    if (fillMode === FillMode.TEXTURE) {
      const texture = textures.find(t => t.id === selectedTextureId)
      if (texture) {
        // Calculate the texture color for this specific pixel coordinate
        return texture.renderer(x, y)
      }
    }

    // Default to color mode
    const color = colors.find(c => c.id === selectedColorId)
    if (!color || color.id === 0) return null // transparent
    const [r, g, b] = color.rgb
    return `rgb(${r}, ${g}, ${b})`
  }

  const handleClick = (visualX: number, visualY: number) => {
    console.log('handleClick', { visualX, visualY })
    if (selectedTool === ToolType.MOVE) return

    // Convert visual coordinates to theoretical infinite grid coordinates
    const theoretical = visualToTheoretical(visualX, visualY, offset)

    // Paint based on tool type
    if (selectedTool === ToolType.BRUSH) {
      // Paint circular brush pattern
      for (const { dx, dy } of brushPattern) {
        const pixelX = theoretical.x + dx
        const pixelY = theoretical.y + dy
        const color = getColorForPixel(pixelX, pixelY)
        setPixel(pixelX, pixelY, color)
      }
    } else if (selectedTool === ToolType.ERASER) {
      // Erase circular pattern (same pattern as brush)
      for (const { dx, dy } of brushPattern) {
        setPixel(theoretical.x + dx, theoretical.y + dy, null)
      }
    } else if (selectedTool === ToolType.PENCIL) {
      // Single pixel
      const color = getColorForPixel(theoretical.x, theoretical.y)
      setPixel(theoretical.x, theoretical.y, color)
    } else if (selectedTool === ToolType.STAMP) {
      // Paint stamp pattern with its specific colors
      for (const { dx, dy, rgb } of stampPattern) {
        const pixelX = theoretical.x + dx
        const pixelY = theoretical.y + dy
        const color = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
        setPixel(pixelX, pixelY, color)
      }
    }
  }

  const handleHover = (visualX: number, visualY: number) => {
    if (selectedTool === ToolType.MOVE) {
      clearHoveredPixels()
      return
    }

    // Calculate affected pixels based on tool
    const affectedPixels = []

    if (selectedTool === ToolType.BRUSH) {
      // Show circular brush preview
      for (const { dx, dy } of brushPattern) {
        affectedPixels.push({ x: visualX + dx, y: visualY + dy })
      }
    } else if (selectedTool === ToolType.ERASER) {
      // Show circular eraser preview (same pattern as brush)
      for (const { dx, dy } of brushPattern) {
        affectedPixels.push({ x: visualX + dx, y: visualY + dy })
      }
    } else if (selectedTool === ToolType.PENCIL) {
      // Single pixel
      affectedPixels.push({ x: visualX, y: visualY })
    } else if (selectedTool === ToolType.STAMP) {
      // Show stamp pattern preview
      for (const { dx, dy } of stampPattern) {
        affectedPixels.push({ x: visualX + dx, y: visualY + dy })
      }
    }

    setHoveredPixels(affectedPixels)
  }

  const handleHoverLeave = () => {
    clearHoveredPixels()
  }

  const handleMouseDown = (
    clientX: number,
    clientY: number,
    pixelX: number,
    pixelY: number,
  ) => {
    lastMousePosRef.current = { x: clientX, y: clientY }

    if (selectedTool === ToolType.MOVE) {
      setIsDragging(true)
    } else {
      // Drawing tools (pencil, brush, eraser) - start drawing
      setIsDrawing(true)
      // Paint immediately on mouse down
      handleClick(pixelX, pixelY)
    }
  }

  const handleMouseMove = (
    clientX: number,
    clientY: number,
    pixelX: number,
    pixelY: number,
    pixelSize: number,
  ) => {
    // Handle move tool dragging
    if (selectedTool === ToolType.MOVE && isDragging) {
      // Calculate movement delta since last mouse position
      const deltaX = clientX - lastMousePosRef.current.x
      const deltaY = clientY - lastMousePosRef.current.y

      // Convert to pixel delta
      const pixelDeltaX = Math.floor(deltaX / pixelSize)
      const pixelDeltaY = Math.floor(deltaY / pixelSize)

      // Update viewport if we moved at least one pixel
      if (pixelDeltaX !== 0 || pixelDeltaY !== 0) {
        moveViewport(pixelDeltaX, pixelDeltaY)
        // Update last position by the amount we actually moved
        lastMousePosRef.current = {
          x: lastMousePosRef.current.x + pixelDeltaX * pixelSize,
          y: lastMousePosRef.current.y + pixelDeltaY * pixelSize,
        }
      }
      return
    }

    // Handle drawing tool painting while dragging
    if (selectedTool !== ToolType.MOVE && isDrawing) {
      handleClick(pixelX, pixelY)
      handleHover(pixelX, pixelY)
      return
    }

    // Handle hover preview for drawing tools (when not drawing)
    if (selectedTool !== ToolType.MOVE) {
      handleHover(pixelX, pixelY)
    }
  }

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false)
    }
    if (isDrawing) {
      setIsDrawing(false)
    }
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false)
    }
    if (isDrawing) {
      setIsDrawing(false)
    }
    handleHoverLeave()
  }

  return {
    handleClick,
    handleHover,
    handleHoverLeave,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    isDragging,
    isDrawing,
  }
}
