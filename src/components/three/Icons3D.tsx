'use client'

import { useRef, useMemo, useState, useEffect, Suspense, type ReactNode } from 'react'
import { Canvas, useFrame, useThree, useLoader, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'

// Extruded, bevelled software-icon tiles. Shared by the about hero and the
// landing hero — the two differ only in where the tiles sit and whether they
// can be grabbed, so both are props.
export type Tile3D = {
  tex: string     // PNG for the face; see note in the about tiles file
  side: string    // extruded edge colour, from the icon's own backplate
  label: string
  x: number       // 0..1 across the canvas
  y: number       // 0..1 down the canvas
  size: number    // in design units (see `designW`)
  rot: number     // resting z-rotation, degrees
}

// ── Look ─────────────────────────────────────────────────────────────────
// Fractions of each tile's own size, so tiles stay proportional to each other.
const DEPTH    = 0.20   // extrusion thickness
const CORNER   = 0.22   // corner radius — 0.22 gives the smooth squircle
const BEVEL    = 0.045  // rounded edge where face meets side
const FRICTION = 0.94   // spin decay after release; higher = longer coast

// Resting motion, running whether or not the tiles can be grabbed.
const SPIN       = 0.5   // radians/sec of continuous Y rotation
const SWAY       = 0.18  // radians of X tilt at the extremes
const SWAY_SPEED = 0.7   // how fast the tilt oscillates
const DRIFT      = 6     // positional wander, px

// Rather than extrude the SVG's own paths — which puts the glyph and its
// backing plate at the same depth and z-fights — we extrude a clean rounded
// square for the body and paint the icon onto its face as a texture. Any icon
// added later works without touching this file.
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

// Loaded through useLoader, which suspends until the image is ready, so the
// material is built with its map already in place. This matters: three bakes
// map presence into the compiled shader, and assigning `map` afterwards does
// not trigger a recompile — the tile then renders flat white forever.
function useIconTexture(src: string) {
  const tex = useLoader(THREE.TextureLoader, src)

  return useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    tex.needsUpdate = true
    return tex
  }, [tex])
}

function IconTile({
  tile, interactive, scale, width, height,
}: {
  tile: Tile3D
  interactive: boolean
  scale: number
  width: number
  height: number
}) {
  const mesh = useRef<THREE.Mesh>(null)
  const tex  = useIconTexture(tile.tex)

  // Spin state lives in refs so dragging never triggers a React render.
  const vel      = useRef({ x: 0, y: 0 })
  const dragging = useRef(false)
  const last     = useRef({ x: 0, y: 0 })
  const phase    = useMemo(() => Math.random() * Math.PI * 2, [])
  // Tilt the sway oscillates around. Cleared whenever the user takes hold, and
  // re-captured on release so the resting motion picks up from wherever they
  // left the tile instead of snapping back.
  const swayBase = useRef<number | null>(null)
  const [hovered, setHovered] = useState(false)

  const sizePx = Math.round(tile.size * scale)

  const geometry = useMemo(() => {
    // Bevel grows the shape outward, so inset first to keep the finished tile
    // at the size asked for.
    const bevel = sizePx * BEVEL
    const shape = roundedSquare(sizePx - bevel * 2, sizePx * CORNER)
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: sizePx * DEPTH,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 6,
      curveSegments: 32,
    })
    geo.center()

    // ExtrudeGeometry's default UVs are world-space, so the texture would scale
    // with the tile instead of fitting it. Remap to 0..1.
    geo.computeBoundingBox()
    const bb = geo.boundingBox!
    const sx = bb.max.x - bb.min.x
    const sy = bb.max.y - bb.min.y
    const pos = geo.attributes.position
    const nrm = geo.attributes.normal
    const uv  = geo.attributes.uv
    for (let i = 0; i < pos.count; i++) {
      const u = (pos.getX(i) - bb.min.x) / sx
      const v = (pos.getY(i) - bb.min.y) / sy
      // Both caps share a material group, so the back would show the artwork
      // mirrored once a tile turns past 90°. Flipping U on back-facing
      // vertices makes it read correctly from either side.
      uv.setXY(i, nrm.getZ(i) < -0.5 ? 1 - u : u, v)
    }
    uv.needsUpdate = true

    return geo
  }, [sizePx])

  useEffect(() => () => { geometry.dispose() }, [geometry])

  // Fractions are top-left origin with y down; three is centre origin, y up
  const cx = (tile.x - 0.5) * width
  const cy = (0.5 - tile.y) * height
  const restZ = -tile.rot * THREE.MathUtils.DEG2RAD

  useFrame((state, delta) => {
    const m = mesh.current
    if (!m) return
    const t = state.clock.elapsedTime

    const swayAt = Math.sin(t * SWAY_SPEED + phase) * SWAY

    if (dragging.current) {
      // The pointer owns the rotation outright while held
      swayBase.current = null
    } else if (Math.abs(vel.current.x) > 0.0004 || Math.abs(vel.current.y) > 0.0004) {
      // Coast on the throw
      m.rotation.y += vel.current.x
      m.rotation.x += vel.current.y
      vel.current.x *= FRICTION
      vel.current.y *= FRICTION
      swayBase.current = null
    } else {
      // Resting: a slow continuous turn with a sway across it. Both are
      // relative to where the tile already is, never assigned from elapsed
      // time — otherwise letting go would snap it back to whatever angle the
      // clock happened to be at, throwing away the user's rotation.
      vel.current.x = 0
      vel.current.y = 0

      // Subtracting the sway's current value gives a base that leaves
      // rotation.x exactly where it is this frame, so resuming is seamless
      // rather than jumping by the sway offset.
      if (swayBase.current === null) swayBase.current = m.rotation.x - swayAt

      m.rotation.y += SPIN * delta
      m.rotation.x = swayBase.current + swayAt
    }

    m.rotation.z = restZ
    m.position.y = cy + Math.sin(t * 0.7 + phase) * DRIFT
    m.position.x = cx + Math.cos(t * 0.5 + phase) * DRIFT * 0.6

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
    // Horizontal drag turns it about Y, vertical about X — a true 3D tumble
    // rather than a flat spin.
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

  // Y starts at `phase` so the tiles aren't all facing the same way. The old
  // formula folded that offset in every frame; now that rotation accumulates,
  // it has to be the starting value instead.
  //
  // Look-only mode attaches no handlers at all, so R3F skips raycasting these
  // meshes rather than raycasting and discarding the result.
  const handlers = interactive
    ? {
        onPointerDown: onDown,
        onPointerMove: onMove,
        onPointerUp: onUp,
        onPointerCancel: onUp,
        onPointerOver: () => setHovered(true),
        onPointerOut: () => setHovered(false),
      }
    : {}

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      position={[cx, cy, 0]}
      rotation={[0, phase, restZ]}
      {...handlers}
    >
      {/* Group 0 = the two flat caps, group 1 = extruded sides and bevel */}
      <meshStandardMaterial attach="material-0" map={tex} roughness={0.35} metalness={0.05} color="#ffffff" />
      <meshStandardMaterial attach="material-1" color={tile.side} roughness={0.5} metalness={0.05} />
    </mesh>
  )
}

function Scene({ tiles, interactive, designW }: {
  tiles: Tile3D[]
  interactive: boolean
  designW?: number
}) {
  const { size } = useThree()
  // With a design width, tile sizes are in that space and scale with the
  // canvas. Without one they're already CSS pixels.
  const scale = designW ? size.width / designW : 1

  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[-300, 400, 600]} intensity={2.2} />
      <directionalLight position={[400, -200, 300]} intensity={0.8} color="#9effc0" />
      {/* Each tile suspends on its texture; null fallback because the caller's
          own fallback is already covering this moment underneath. */}
      <Suspense fallback={null}>
        {tiles.map(t => (
          <IconTile
            key={t.label}
            tile={t}
            interactive={interactive}
            scale={scale}
            width={size.width}
            height={size.height}
          />
        ))}
      </Suspense>
    </>
  )
}

// R3F reads its container size once on mount and can get zero — inside a stage
// using aspect-ratio with container-type it loses that race, and its observer
// never fires again because the host's size genuinely never changes.
//
// Fires unconditionally. An earlier version skipped once the canvas backing
// store looked right, which was wrong: the canvas can carry correct dimensions
// while R3F's own state is stale, leaving a properly sized canvas rendering
// nothing at all. A resize is the only reliable signal, so send a few and stop.
function useCanvasSizeKick(ready: boolean) {
  useEffect(() => {
    if (!ready) return
    const ids = [50, 250, 600].map(ms =>
      setTimeout(() => window.dispatchEvent(new Event('resize')), ms),
    )
    return () => ids.forEach(clearTimeout)
  }, [ready])
}

export default function Icons3D({
  tiles,
  interactive = false,
  designW,
  fallback = null,
  zIndex = 3,
  eventSource,
}: {
  tiles: Tile3D[]
  interactive?: boolean
  designW?: number
  fallback?: ReactNode
  zIndex?: number
  // Pass the element the canvas sits on top of, and R3F listens there instead
  // of on the canvas. The canvas itself goes pointer-events: none, so clicks
  // still reach the DOM underneath while tiles stay grabbable.
  //
  // The landing hero needs this: its heading and buttons are draggable through
  // their own DOM handlers, and a full-bleed canvas capturing pointer events
  // would silently kill all of it.
  eventSource?: React.RefObject<HTMLElement | null>
}) {
  const host = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  // Mount the Canvas only once the host measures non-zero, so R3F is not
  // sizing against a container that has not been laid out yet.
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

  useCanvasSizeKick(ready)

  return (
    <div
      ref={host}
      style={{
        position: 'absolute', inset: 0, zIndex,
        // Look-only, or delegating events to a parent: either way let clicks
        // and text selection pass straight through.
        pointerEvents: interactive && !eventSource ? 'auto' : 'none',
      }}
    >
      {!ready && fallback}
      {/* R3F's eventSource type wants a non-null element or ref. The Canvas
          only mounts once the host has measured, so the source element is
          guaranteed to exist by this point — hand it over directly. */}
      {ready && (
        <Canvas
          orthographic
          camera={{ position: [0, 0, 1000], near: 0.1, far: 4000, zoom: 1 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
          resize={{ offsetSize: true, debounce: 0 }}
          {...(eventSource?.current ? { eventSource: eventSource.current } : {})}
          style={{
            background: 'transparent',
            ...(eventSource ? { pointerEvents: 'none' as const } : {}),
          }}
        >
          <Scene tiles={tiles} interactive={interactive} designW={designW} />
        </Canvas>
      )}
    </div>
  )
}
