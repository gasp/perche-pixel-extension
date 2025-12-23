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
} from '@/stores'
import { stamps } from '@/stamps/stamps'
import { getCirclePattern } from '@/actions/brush'
import { getColorForPixel, findColorIdFromRgb } from '@/actions/color-utils'
import { getPixelColorAt } from '@/actions/pixel-utils'
import { findContiguousTransparentPixels } from '@/actions/flood-fill'
import { handleToolClick } from '@/actions/tool-handlers'
import { handleToolHover } from '@/actions/hover-handlers'
import {
  handleMouseDown as handleMouseDownAction,
  handleMouseMove as handleMouseMoveAction,
  handleMouseUp as handleMouseUpAction,
  handleMouseLeave as handleMouseLeaveAction,
} from '@/actions/mouse-handlers'
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

  // Wrapper functions that use the extracted utilities
  const getColorForPixelWrapper = (x: number, y: number): PixelColor =>
    getColorForPixel(x, y, fillMode, selectedColorId, selectedTextureId)

  const getPixelColorAtWrapper = (x: number, y: number): PixelColor =>
    getPixelColorAt(x, y, getPixel, tilePixelGrid)

  const findContiguousTransparentPixelsWrapper = (
    x: number,
    y: number,
  ): { x: number; y: number }[] =>
    findContiguousTransparentPixels(x, y, getPixelColorAtWrapper)

  const handleClick = (visualX: number, visualY: number) => {
    handleToolClick(selectedTool, {
      visualX,
      visualY,
      offset,
      getColorForPixel: getColorForPixelWrapper,
      getPixelColorAt: getPixelColorAtWrapper,
      setPixel,
      setSelectedColorId,
      findColorIdFromRgb,
      findContiguousTransparentPixels: findContiguousTransparentPixelsWrapper,
      brushPattern,
      stampPattern,
    })
  }

  const handleHover = (visualX: number, visualY: number) => {
    handleToolHover(selectedTool, {
      visualX,
      visualY,
      offset,
      brushPattern,
      stampPattern,
      findContiguousTransparentPixels: findContiguousTransparentPixelsWrapper,
      setHoveredPixels,
      clearHoveredPixels,
    })
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
    handleMouseDownAction({
      clientX,
      clientY,
      pixelX,
      pixelY,
      selectedTool,
      setLastMousePos: (pos: { x: number; y: number }) => {
        lastMousePosRef.current = pos
      },
      handleClick,
      setIsDragging,
      setIsDrawing,
    })
  }

  const handleMouseMove = (
    clientX: number,
    clientY: number,
    pixelX: number,
    pixelY: number,
    pixelSize: number,
  ) => {
    handleMouseMoveAction({
      clientX,
      clientY,
      pixelX,
      pixelY,
      pixelSize,
      selectedTool,
      isDragging,
      isDrawing,
      getLastMousePos: () => lastMousePosRef.current,
      setLastMousePos: (pos: { x: number; y: number }) => {
        lastMousePosRef.current = pos
      },
      moveViewport,
      handleClick,
      handleHover,
    })
  }

  const handleMouseUp = () => {
    handleMouseUpAction({
      isDragging,
      isDrawing,
      setIsDragging,
      setIsDrawing,
    })
  }

  const handleMouseLeave = () => {
    handleMouseLeaveAction({
      isDragging,
      isDrawing,
      setIsDragging,
      setIsDrawing,
      handleHoverLeave,
    })
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
