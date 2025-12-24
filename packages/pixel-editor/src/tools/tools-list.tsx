import {
  Pencil,
  Brush,
  Move,
  Eraser,
  TreePine,
  Pipette,
  PaintBucket,
  FileQuestionMark,
  SunMoon,
} from 'lucide-react'
import { ToolButton } from './button'
import { TOOLS } from './tools'
import type { ToolType } from './tools'

type OwnProps = {
  onToolSelect: (tool: ToolType) => void
  selectedTool: ToolType
}

const getIcon = (icon: string) => {
  switch (icon) {
    case 'Pencil':
      return <Pencil />
    case 'Brush':
      return <Brush />
    case 'Move':
      return <Move />
    case 'Eraser':
      return <Eraser />
    case 'TreePine':
      return <TreePine />
    case 'Pipette':
      return <Pipette />
    case 'PaintBucket':
      return <PaintBucket />
    case 'SunMoon':
      return <SunMoon />
    default:
      return <FileQuestionMark />
  }
}

export function ToolsList({ onToolSelect, selectedTool }: OwnProps) {
  return (
    <div className="flex flex-col gap-[2px] p-[2px]">
      {TOOLS.map(tool => (
        <ToolButton
          key={tool.id}
          title={tool.name}
          onClick={() => onToolSelect(tool.id)}
          isSelected={selectedTool === tool.id}
          children={getIcon(tool.icon)}
        />
      ))}
    </div>
  )
}
