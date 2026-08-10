'use client'

import Image from 'next/image'

// Built to Figma node 24:127, a 1440×1024 frame.
//
// Every position and size below is that frame's value converted to a
// proportion of it: percentages for placement, `cqw` for anything that needs
// to scale (type, tile sizes, radii). The stage declares `container-type:
// inline-size`, so 1cqw == 1% of the stage width and the whole composition
// scales as one piece instead of drifting apart at other viewport widths.
//
//   px → %   : px / 1440 (horizontal), px / 1024 (vertical)
//   px → cqw : px / 1440 * 100
const W = 1440
const H = 1024
const pctW = (px: number) => `${(px / W) * 100}%`
const pctH = (px: number) => `${(px / H) * 100}%`
const cqw  = (px: number) => `${(px / W) * 100}cqw`

const PHOTO = '/rafi-photo.webp'

// The four tiles from the design. `box` is the rotated element's bounding box,
// `size` the square inside it — Figma centres the square in that box, so both
// are needed to land the tile where it was drawn.
const TILES = [
  { src: '/icon-figma.svg', label: 'Figma',         left: 184,     top: 405,    box: 134.122, size: 106,     radius: 8,  rot: -18.47 },
  { src: '/icon-ps.svg',    label: 'Photoshop',     left: 1057.21, top: 492.21, box: 129.7,   size: 106,     radius: 8,  rot: 14.91 },
  { src: '/icon-ai.svg',    label: 'Illustrator',   left: 1121,    top: 635,    box: 168.042, size: 136.261, radius: 8,  rot: -15.7 },
  { src: '/icon-ae.svg',    label: 'After Effects', left: 131.88,  top: 695.88, box: 195.849, size: 162.504, radius: 13, rot: 13.45 },
]

export default function AboutHero() {
  return (
    <>
      <div
        style={{
          position: 'relative', zIndex: 10,
          width: '100%', maxWidth: W, margin: '0 auto',
          aspectRatio: `${W} / ${H}`,
          containerType: 'inline-size',
        }}
      >
        {/* ── White stadium, behind everything ── */}
        <div
          style={{
            position: 'absolute',
            left: '50%', transform: 'translateX(-50%)',
            top: pctH(600),
            width: pctW(996), height: pctH(264),
            background: '#fff',
            borderRadius: cqw(132),
            zIndex: 1,
          }}
        />

        {/* ── Name, left ── */}
        <div
          style={{
            position: 'absolute',
            left: pctW(222), top: pctH(230),
            width: pctW(348),
            zIndex: 2,
            fontSize: cqw(68), fontWeight: 700,
            letterSpacing: cqw(-2.04), lineHeight: 1,
            color: '#fff',
          }}
        >
          <h1 style={{ margin: 0, fontSize: 'inherit', fontWeight: 'inherit', letterSpacing: 'inherit' }}>
            RAFI<br />ABDILLAH
          </h1>
        </div>

        {/* ── Role, right ── */}
        <div
          style={{
            position: 'absolute',
            left: pctW(870), top: pctH(356),
            width: pctW(348),
            zIndex: 2,
            fontSize: cqw(50), fontWeight: 700,
            letterSpacing: cqw(-1.5), lineHeight: 1,
            color: '#fff', textAlign: 'right',
          }}
        >
          GRAPHIC<br />DESIGNER
        </div>

        {/* ── Tiles ── */}
        {TILES.map(({ src, label, left, top, box, size, radius, rot }) => (
          <div
            key={label}
            style={{
              position: 'absolute',
              left: pctW(left), top: pctH(top),
              width: cqw(box), height: cqw(box),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 3,
            }}
          >
            <div
              style={{
                width: cqw(size), height: cqw(size),
                transform: `rotate(${rot}deg)`,
                borderRadius: cqw(radius),
                overflow: 'hidden',
                flex: 'none',
              }}
            >
              <Image
                src={src}
                alt={label}
                width={250}
                height={250}
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
            </div>
          </div>
        ))}

        {/* ── Cutout, in front of the stadium and tiles ── */}
        <div
          style={{
            position: 'absolute',
            left: pctW(359), top: pctH(194),
            width: pctW(684), height: pctH(670),
            zIndex: 4,
          }}
        >
          <Image
            src={PHOTO}
            alt="Rafi Abdillah"
            width={1386}
            height={1356}
            priority
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
      </div>
    </>
  )
}
