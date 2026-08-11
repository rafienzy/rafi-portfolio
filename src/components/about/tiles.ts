// The four tiles from Figma node 24:127, in that frame's 1440×1024 space.
// `box` is the rotated element's bounding box, `size` the square inside it —
// Figma centres the square in that box, so both are needed to place the tile
// where it was drawn. Shared by the flat DOM fallback and the 3D version so
// the two can't drift apart.
import type { Tile3D } from '@/components/three/Icons3D'

export type Tile = {
  src: string   // SVG — used by the flat DOM tiles, crisp at any size
  tex: string   // PNG — used as the WebGL texture; see note below
  side: string  // extruded edge colour, taken from each icon's own backplate
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

// WebGL gets the PNGs, the DOM fallback keeps the SVGs (crisp at any size).
//
// To be clear about why, since the history here is misleading: the tiles once
// rendered flat white, and the format was NOT the cause — that turned out to
// be a material compiled before its texture existed, fixed in Icons3D. PNG is
// kept simply because it needs no rasterising inside the engine, which is one
// less thing to vary across browsers.
// `side` is each icon's own backplate colour, read straight out of its SVG, so
// the extruded edge reads as part of the tile rather than a white rim around it.
export const TILES: Tile[] = [
  { src: '/icon-figma.svg', tex: '/icon-figma.png', side: '#171717', label: 'Figma',         left: 184,     top: 405,    box: 134.122, size: 106,     radius: 8,  rot: -18.47 },
  { src: '/icon-ps.svg',    tex: '/icon-ps.png',    side: '#001E36', label: 'Photoshop',     left: 1057.21, top: 492.21, box: 129.7,   size: 106,     radius: 8,  rot: 14.91 },
  { src: '/icon-ai.svg',    tex: '/icon-ai.png',    side: '#330000', label: 'Illustrator',   left: 1121,    top: 635,    box: 168.042, size: 136.261, radius: 8,  rot: -15.7 },
  { src: '/icon-ae.svg',    tex: '/icon-ae.png',    side: '#00005B', label: 'After Effects', left: 131.88,  top: 695.88, box: 195.849, size: 162.504, radius: 13, rot: 13.45 },
]

// Design coordinates converted to the shared 3D component's shape: centre of
// each tile as a fraction of the frame, with size still in design units.
export const TILES_3D: Tile3D[] = TILES.map(t => ({
  tex: t.tex,
  side: t.side,
  label: t.label,
  x: (t.left + t.box / 2) / DESIGN_W,
  y: (t.top + t.box / 2) / DESIGN_H,
  size: t.size,
  rot: t.rot,
}))

export const pctW = (px: number) => `${(px / DESIGN_W) * 100}%`
export const pctH = (px: number) => `${(px / DESIGN_H) * 100}%`
export const cqw  = (px: number) => `${(px / DESIGN_W) * 100}cqw`
