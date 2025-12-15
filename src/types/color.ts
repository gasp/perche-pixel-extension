// color tuple (red, green, blue)
export type RGB = [number, number, number]

export type Color = {
  rgb: RGB
}

export type MetaColor = {
  id: number
  premium: boolean
  name: string
} & Color
