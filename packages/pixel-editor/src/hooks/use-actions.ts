import { useRef, useState, useMemo } from 'react'
import {
  useUserPixelStore,
  useToolStore,
  useViewportStore,
  useHoverStore,
  useFillStore,
  useBrushSizeStore,
  useStampStore,
  useTilePixelStore,
  FillMode,
} from '@/stores'
import { visualToTheoretical } from '../utils/coordinate-converter'
import { getCirclePattern } from '../actions/brush'
import { ToolType } from '../tools/tools'
import { colors } from '../colors/colors'
import { textures } from '../textures/textures'
import { stamps } from '../stamps/stamps'
import type { PixelColor } from '@/types'

export function useActions() {
  const selectedTool = useToolStore(state => state.selectedTool)
  const selectedColorId = useFillStore(state => state.selectedColorId)
  const setSelectedColorId = useFillStore(state => state.setSelectedColorId)
  const selectedTextureId = useFillStore(state => state.selectedTextureId)
  const fillMode = useFillStore(state => state.fillMode)
  const brushSize = useBrushSizeStore(state => state.selectedSize)
  const selectedStampId = useStampStore(state => state.selectedStampId)
  const offset = useViewportStore(state => state.offset)
  const moveViewport = useViewportStore(state => state.moveViewport)
  const setPixel = useUserPixelStore(state => state.setPixel)
  const getPixel = useUserPixelStore(state => state.getPixel)
  const tilePixelGrid = useTilePixelStore(state => state.tilePixelGrid)
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

  // Helper function to parse RGB string and find matching color
  const findColorIdFromRgb = (rgbString: string | null): number | null => {
    if (!rgbString) return null

    // Parse rgb(r, g, b) format
    const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (!match) return null

    const r = parseInt(match[1], 10)
    const g = parseInt(match[2], 10)
    const b = parseInt(match[3], 10)

    // Find matching color in colors array
    const matchingColor = colors.find(
      color => color.rgb[0] === r && color.rgb[1] === g && color.rgb[2] === b,
    )

    return matchingColor ? matchingColor.id : null
  }

  const getPixelColorAt = (x: number, y: number): PixelColor => {
    const key = `${x},${y}`

    // Check user pixels first (these are on top)
    const userPixel = getPixel(x, y)
    if (userPixel) return userPixel

    const tilePixel = tilePixelGrid.get(key)
    if (tilePixel) return tilePixel

    return null
  }

  // Find contiguous transparent pixels using clockwise rotation
  // Starting from the first pixel under the cursor
  const findContiguousTransparentPixels = (
    startX: number,
    startY: number,
  ): { x: number; y: number }[] => {
    const result: { x: number; y: number }[] = []
    const visited = new Set<string>()
    const queue: { x: number; y: number }[] = []

    // Check if start pixel is transparent
    const startPixel = getPixelColorAt(startX, startY)
    if (startPixel !== null) {
      // Not transparent, return empty array
      return []
    }

    // 4-directional connectivity (clockwise): right, down, left, up
    // This prevents selection from passing through diagonal gaps
    const directions = [
      { dx: 1, dy: 0 }, // right
      { dx: 0, dy: 1 }, // down
      { dx: -1, dy: 0 }, // left
      { dx: 0, dy: -1 }, // up
    ]

    queue.push({ x: startX, y: startY })
    visited.add(`${startX},${startY}`)

    while (queue.length > 0 && result.length < 1024) {
      const current = queue.shift()!
      result.push(current)

      // Check all directions in clockwise order
      for (const dir of directions) {
        const nextX = current.x + dir.dx
        const nextY = current.y + dir.dy
        const key = `${nextX},${nextY}`

        if (!visited.has(key)) {
          visited.add(key)
          const pixel = getPixelColorAt(nextX, nextY)
          if (pixel === null) {
            // Transparent pixel found
            queue.push({ x: nextX, y: nextY })
          }
        }
      }
    }

    return result
  }

  const handleClick = (visualX: number, visualY: number) => {
    if (selectedTool === ToolType.MOVE) return

    // Convert visual coordinates to theoretical infinite grid coordinates
    const theoretical = visualToTheoretical(visualX, visualY, offset)

    // Handle pipette tool - pick color from pixel
    if (selectedTool === ToolType.PIPETTE) {
      const pixelColor = getPixelColorAt(theoretical.x, theoretical.y)
      if (pixelColor) {
        const colorId = findColorIdFromRgb(pixelColor)
        if (colorId !== null) {
          setSelectedColorId(colorId)
        }
      }
      return
    }

    // Handle paint bucket tool - fill contiguous transparent pixels
    if (selectedTool === ToolType.PAINT_BUCKET) {
      const pixelsToFill = findContiguousTransparentPixels(
        theoretical.x,
        theoretical.y,
      )
      // Fill all the transparent pixels with the current color
      for (const pixel of pixelsToFill) {
        const color = getColorForPixel(pixel.x, pixel.y)
        setPixel(pixel.x, pixel.y, color)
      }
      return
    }

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

    if (selectedTool === ToolType.PAINT_BUCKET) {
      // Convert visual coordinates to theoretical for paint bucket
      const theoretical = visualToTheoretical(visualX, visualY, offset)

      // Find contiguous transparent pixels
      const contiguousPixels = findContiguousTransparentPixels(
        theoretical.x,
        theoretical.y,
      )

      // Convert back to visual coordinates for display
      for (const pixel of contiguousPixels) {
        affectedPixels.push({ x: pixel.x - offset.x, y: pixel.y - offset.y })
      }
    } else if (selectedTool === ToolType.BRUSH) {
      // Show circular brush preview
      for (const { dx, dy } of brushPattern) {
        affectedPixels.push({ x: visualX + dx, y: visualY + dy })
      }
    } else if (selectedTool === ToolType.ERASER) {
      // Show circular eraser preview (same pattern as brush)
      for (const { dx, dy } of brushPattern) {
        affectedPixels.push({ x: visualX + dx, y: visualY + dy })
      }
    } else if (
      selectedTool === ToolType.PENCIL ||
      selectedTool === ToolType.PIPETTE
    ) {
      // Single pixel for pencil and pipette
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
    } else if (
      selectedTool === ToolType.PIPETTE ||
      selectedTool === ToolType.PAINT_BUCKET
    ) {
      // Pipette and paint bucket tools - just execute on click, don't drag
      handleClick(pixelX, pixelY)
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
