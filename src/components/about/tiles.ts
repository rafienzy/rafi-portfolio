// The four tiles from Figma node 24:127, in that frame's 1440×1024 space.
// `box` is the rotated element's bounding box, `size` the square inside it —
// Figma centres the square in that box, so both are needed to place the tile
// where it was drawn. Shared by the flat DOM fallback and the 3D version so
// the two can't drift apart.
export type Tile = {
  src: string
  label: string
  left: number
  top: number
  box: number
  size: number
  radius: number
  rot: number
}

export const DESIGN_W = 1440
export const DESIGN_H = 1024

export const TILES: Tile[] = [
  { src: '/icon-figma.svg', label: 'Figma',         left: 184,     top: 405,    box: 134.122, size: 106,     radius: 8,  rot: -18.47 },
  { src: '/icon-ps.svg',    label: 'Photoshop',     left: 1057.21, top: 492.21, box: 129.7,   size: 106,     radius: 8,  rot: 14.91 },
  { src: '/icon-ai.svg',    label: 'Illustrator',   left: 1121,    top: 635,    box: 168.042, size: 136.261, radius: 8,  rot: -15.7 },
  { src: '/icon-ae.svg',    label: 'After Effects', left: 131.88,  top: 695.88, box: 195.849, size: 162.504, radius: 13, rot: 13.45 },
]

export const pctW = (px: number) => `${(px / DESIGN_W) * 100}%`
export const pctH = (px: number) => `${(px / DESIGN_H) * 100}%`
export const cqw  = (px: number) => `${(px / DESIGN_W) * 100}cqw`
