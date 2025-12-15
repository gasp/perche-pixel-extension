export interface BrushSize {
  id: number
  size: number
  name: string
}

export const brushSizes: BrushSize[] = [
  { id: 0, size: 2, name: 'Extra Small' },
  { id: 1, size: 5, name: 'Small' },
  { id: 2, size: 7, name: 'Medium' },
  { id: 3, size: 11, name: 'Large' },
]
