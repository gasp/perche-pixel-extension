export const ToolType = {
  PENCIL: 'pencil',
  BRUSH: 'brush',
  ERASER: 'eraser',
  MOVE: 'move',
  STAMP: 'stamp',
  PIPETTE: 'pipette',
} as const

export type ToolType = (typeof ToolType)[keyof typeof ToolType]

export const TOOLS: ToolDetails[] = [
  {
    id: ToolType.PENCIL,
    name: 'Pencil (P)',
    icon: 'Pencil',
  },
  {
    id: ToolType.BRUSH,
    name: 'Brush (B)',
    icon: 'Brush',
  },
  {
    id: ToolType.ERASER,
    name: 'Eraser',
    icon: 'Eraser',
  },
  {
    id: ToolType.STAMP,
    name: 'Stamp',
    icon: 'TreePine',
  },
  {
    id: ToolType.PIPETTE,
    name: 'Pipette (I)',
    icon: 'Pipette',
  },
  {
    id: ToolType.MOVE,
    name: 'Move (Space)',
    icon: 'Move',
  },
]

export type ToolDetails = {
  id: ToolType
  name: string
  icon: string
}
