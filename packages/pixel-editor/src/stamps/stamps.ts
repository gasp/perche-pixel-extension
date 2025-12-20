import { hayStack } from './library/hay-stack'
import { hayCart } from './library/hay-cart'
import { pineTree1 } from './library/pine-tree-1'
import { bushYellow0 } from './library/bush-yellow-0'
import { bushesYellowShadow0 } from './library/bushes-yellow-shadow-0'
import { bushesYellowShadow1 } from './library/bushes-yellow-shadow-1'
import { bushesYellowShadow2 } from './library/bushes-yellow-shadow-2'
import { bushesYellowShadow3 } from './library/bushes-yellow-shadow-3'
import { appleTreeShadow0 } from './library/apple-tree-shadow-0'
import type { Color, PixelCoord } from '@/types'

export type StampPixel = PixelCoord & Color

export type Stamp = {
  id: number
  name: string
  pixels: StampPixel[]
}

export const stamps: Stamp[] = [
  {
    id: 0,
    name: 'Smiley',
    pixels: [
      { x: -1, y: -1, rgb: [0, 0, 0] },
      { x: 1, y: -1, rgb: [0, 0, 0] },
      { x: -1, y: 1, rgb: [0, 0, 0] },
      { x: 0, y: 2, rgb: [0, 0, 0] },
      { x: 1, y: 1, rgb: [0, 0, 0] },
    ],
  },
  {
    id: 1,
    name: 'Heart',
    pixels: [
      { x: -2, y: -1, rgb: [237, 28, 36] },
      { x: -1, y: -1, rgb: [237, 28, 36] },
      { x: 1, y: -1, rgb: [237, 28, 36] },
      { x: 2, y: -1, rgb: [237, 28, 36] },
      { x: -3, y: 0, rgb: [237, 28, 36] },
      { x: -2, y: 0, rgb: [237, 28, 36] },
      { x: -1, y: 0, rgb: [237, 28, 36] },
      { x: 0, y: 0, rgb: [237, 28, 36] },
      { x: 1, y: 0, rgb: [237, 28, 36] },
      { x: 2, y: 0, rgb: [237, 28, 36] },
      { x: 3, y: 0, rgb: [237, 28, 36] },
      { x: -2, y: 1, rgb: [237, 28, 36] },
      { x: -1, y: 1, rgb: [237, 28, 36] },
      { x: 1, y: 1, rgb: [237, 28, 36] },
      { x: 0, y: 1, rgb: [237, 28, 36] },
      { x: 1, y: 1, rgb: [237, 28, 36] },
      { x: 2, y: 1, rgb: [237, 28, 36] },
      { x: -1, y: 2, rgb: [237, 28, 36] },
      { x: 1, y: 2, rgb: [237, 28, 36] },
      { x: 0, y: 2, rgb: [237, 28, 36] },
      { x: 1, y: 2, rgb: [237, 28, 36] },
      { x: 0, y: 3, rgb: [237, 28, 36] },
    ],
  },
  {
    id: 2,
    name: 'Hay',
    pixels: hayStack,
  },
  {
    id: 3,
    name: 'Hay Cart',
    pixels: hayCart,
  },
  {
    id: 4,
    name: 'Pine Tree 1',
    pixels: pineTree1,
  },
  {
    id: 5,
    name: 'Bush Yellow',
    pixels: bushYellow0,
  },
  {
    id: 6,
    name: 'Bushes Yellow Shadow',
    pixels: bushesYellowShadow0,
  },
  {
    id: 7,
    name: 'Bushes Yellow Shadow',
    pixels: bushesYellowShadow1,
  },
  {
    id: 8,
    name: 'Bushes Yellow Shadow',
    pixels: bushesYellowShadow2,
  },
  {
    id: 8,
    name: 'Bushes Yellow Shadow',
    pixels: bushesYellowShadow3,
  },
  {
    id: 9,
    name: 'Apple Tree Shadow',
    pixels: appleTreeShadow0,
  },
]
