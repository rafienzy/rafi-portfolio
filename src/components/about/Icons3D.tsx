'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { TILES, DESIGN_W, DESIGN_H, type Tile } from './tiles'
import FlatTiles from './FlatTiles'

// ── Look ─────────────────────────────────────────────────────────────────
// Fractions of each tile's own size, so all four stay proportional.
const DEPTH   = 0.20   // extrusion thickness
const CORNER  = 0.22   // corner radius — 0.22 gives the smooth squircle
const BEVEL   = 0.045  // rounded edge where face meets side
const IDLE    = 0.22   // idle bob amplitude, in design px per tile
const FRICTION = 0.94  // spin decay after release; higher = longer coast

// Rather than extrude the SVG's own paths — which puts the glyph and its
// backing plate at the same depth and z-fights — we extrude a clean rounded
// square for the body and paint the icon onto its face as a texture. That also
// means any icon you add later works without touching this file.
function roundedSquare(size: number, radius: number) {
  const h = size / 2
  const r = Math.min(radius, h)
  const s = new THREE.Shape()
  s.moveTo(-h + r, -h)
  s.lineTo(h - r, -h)
  s.quadraticCurveTo(h, -h, h, -h + r)
  s.lineTo(h, h - r)
  s.quadraticCurveTo(h, h, h - r, h)
  s.lineTo(-h + r, h)
  s.quadraticCurveTo(-h, h, -h, h - r)
  s.lineTo(-h, -h + r)
  s.quadraticCurveTo(-h, -h, -h + r, -h)
  return s
}

// Rasterise the SVG once into a canvas texture. Drawing at a fixed 512 keeps
// the face crisp when a tile scales up, which loading the SVG straight into
// TextureLoader would not guarantee.
function useIconTexture(src: string) {
  const [tex, setTex] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    let cancelled = false
    let made: THREE.CanvasTexture | null = null

    const img = new window.Image()
    img.onload = () => {
      if (cancelled) return
      const S = 512
      const c = document.createElement('canvas')
      c.width = c.height = S
      const ctx = c.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0, S, S)
      made = new THREE.CanvasTexture(c)
      made.colorSpace = THREE.SRGBColorSpace
      made.anisotropy = 8
      setTex(made)
    }
    img.src = src

    return () => {
      cancelled = true
      made?.dispose()
    }
  }, [src])

  return tex
}

function IconTile({ tile, scale }: { tile: Tile; scale: number }) {
  const mesh = useRef<THREE.Mesh>(null)
  const tex  = useIconTexture(tile.src)

  // Spin state. Kept in refs so dragging never triggers a React render.
  const vel      = useRef({ x: 0, y: 0 })
  const dragging = useRef(false)
  const last     = useRef({ x: 0, y: 0 })
  const phase    = useMemo(() => Math.random() * Math.PI * 2, [])
  const [hovered, setHovered] = useState(false)

  const geometry = useMemo(() => {
    const size = tile.size
    // Bevel grows the shape outward, so inset first to keep the finished tile
    // at the size the design specifies.
    const bevel = size * BEVEL
    const shape = roundedSquare(size - bevel * 2, size * CORNER)
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: size * DEPTH,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 6,
      curveSegments: 32,
    })
    geo.center()

    // ExtrudeGeometry's default UVs are world-space, so the texture would be
    // scaled by the tile's size instead of fitting it. Remap to 0..1.
    geo.computeBoundingBox()
    const bb = geo.boundingBox!
    const sx = bb.max.x - bb.min.x
    const sy = bb.max.y - bb.min.y
    const pos = geo.attributes.position
    const uv  = geo.attributes.uv
    for (let i = 0; i < pos.count; i++) {
      uv.setXY(i, (pos.getX(i) - bb.min.x) / sx, (pos.getY(i) - bb.min.y) / sy)
    }
    uv.needsUpdate = true

    return geo
  }, [tile.size])

  useEffect(() => () => { geometry.dispose() }, [geometry])

  // Design coords are top-left origin with y down; three is centre origin, y up
  const cx = tile.left + tile.box / 2 - DESIGN_W / 2
  const cy = DESIGN_H / 2 - (tile.top + tile.box / 2)
  const restZ = -tile.rot * THREE.MathUtils.DEG2RAD

  useFrame((state, delta) => {
    const m = mesh.current
    if (!m) return

    if (!dragging.current) {
      // Coast, then settle back to the angle the design specifies
      m.rotation.y += vel.current.x
      m.rotation.x += vel.current.y
      vel.current.x *= FRICTION
      vel.current.y *= FRICTION

      if (Math.abs(vel.current.x) < 0.0004 && Math.abs(vel.current.y) < 0.0004) {
        vel.current.x = 0
        vel.current.y = 0
        m.rotation.x += (0 - m.rotation.x) * 0.05
        m.rotation.y += (0 - m.rotation.y) * 0.05
      }
    }

    m.rotation.z = restZ
    // Gentle idle drift so the tiles aren't dead before you touch them
    const t = state.clock.elapsedTime
    m.position.y = cy + Math.sin(t * 0.7 + phase) * (IDLE * 8)
    m.position.x = cx + Math.cos(t * 0.5 + phase) * (IDLE * 5)

    const target = hovered || dragging.current ? 1.12 : 1
    m.scale.x += (target - m.scale.x) * Math.min(1, delta * 10)
    m.scale.y = m.scale.z = m.scale.x
  })

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    dragging.current = true
    last.current = { x: e.clientX, y: e.clientY }
    vel.current = { x: 0, y: 0 }
  }

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    if (!dragging.current || !mesh.current) return
    e.stopPropagation()
    const dx = (e.clientX - last.current.x) * 0.01
    const dy = (e.clientY - last.current.y) * 0.01
    last.current = { x: e.clientX, y: e.clientY }
    mesh.current.rotation.y += dx
    mesh.current.rotation.x += dy
    vel.current = { x: dx, y: dy }
  }

  const onUp = (e: ThreeEvent<PointerEvent>) => {
    ;(e.target as Element).releasePointerCapture?.(e.pointerId)
    dragging.current = false
  }

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      position={[cx, cy, 0]}
      scale={scale === 0 ? 0.001 : 1}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Group 0 = the two flat caps, group 1 = extruded sides and bevel */}
      <meshStandardMaterial attach="material-0" map={tex ?? undefined} roughness={0.35} metalness={0.05} color={tex ? '#ffffff' : '#d9d9d9'} />
      <meshStandardMaterial attach="material-1" color="#c9c9c9" roughness={0.5} metalness={0.05} />
    </mesh>
  )
}

// R3F reads its container size once on mount and gets zero here — the stage
// uses aspect-ratio inside container-type: inline-size, and its measurement
// loses that race. Its observer then never fires again, because the host's
// size genuinely never changes after layout, so the canvas would sit at its
// default 300×150 forever.
//
// Calling R3F's own setSize from inside the tree does not stick. Its window
// resize path does, so one synthetic resize on the frame after mount is what
// actually shakes it loose. Ugly, but it is a single one-shot event against a
// known upstream race, and it leaves real resizes handled normally.
function useCanvasSizeKick(ready: boolean, host: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (!ready) return

    let tries = 0
    const id = setInterval(() => {
      const el = host.current
      const canvas = el?.querySelector('canvas')
      // Backing store is in device pixels, so matching or exceeding the host's
      // CSS width means R3F has taken the real size and we can stop.
      if (!el || (canvas && canvas.width >= el.offsetWidth)) {
        clearInterval(id)
        return
      }
      window.dispatchEvent(new Event('resize'))
      // A single kick lands too early — R3F has not attached its listener on
      // the first frame after mount. Give up after ~1s rather than loop.
      if (++tries > 10) clearInterval(id)
    }, 100)

    return () => clearInterval(id)
  }, [ready, host])
}

// Design space is 1440 wide; the canvas is whatever the stage is. Scaling the
// whole group by that ratio lets every tile stay in design pixels.
function Scene() {
  const { size } = useThree()
  const scale = size.width / DESIGN_W

  return (
    <group scale={scale}>
      <ambientLight intensity={1.1} />
      <directionalLight position={[-300, 400, 600]} intensity={2.2} />
      <directionalLight position={[400, -200, 300]} intensity={0.8} color="#9effc0" />
      {TILES.map(t => (
        <IconTile key={t.label} tile={t} scale={1} />
      ))}
    </group>
  )
}

export default function Icons3D() {
  const host = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  // R3F measures its own container on mount and refuses to build a renderer
  // while that reads zero. Inside a stage using aspect-ratio + container-type,
  // its first reading is 0 and its observer never fires again — the element's
  // size genuinely never changes after layout — so the canvas would sit at its
  // default 300×150 until an unrelated window resize shook it loose.
  // Mounting only once the host has a real size sidesteps the race entirely.
  useEffect(() => {
    const el = host.current
    if (!el) return
    const check = () => {
      if (el.offsetWidth > 0 && el.offsetHeight > 0) setReady(true)
    }
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useCanvasSizeKick(ready, host)

  return (
    <div ref={host} style={{ position: 'absolute', inset: 0, zIndex: 3 }}>
      {!ready && <FlatTiles />}
      {ready && (
      <Canvas
        orthographic
        camera={{ position: [0, 0, 1000], near: 0.1, far: 4000, zoom: 1 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        // The stage uses aspect-ratio with container-type: inline-size, and
        // R3F's default ResizeObserver measurement races that layout — it
        // reads 0 on mount and the canvas stays at its default 300×150 until
        // something triggers a resize. offsetSize reads offsetWidth/Height
        // instead, which is already correct by the time this runs.
        resize={{ offsetSize: true, debounce: 0 }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
      )}
    </div>
  )
}
