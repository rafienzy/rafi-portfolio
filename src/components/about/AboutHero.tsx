'use client'

import Image from 'next/image'
import dynamic from 'next/dynamic'
import FlatTiles from './FlatTiles'
import { DESIGN_W as W, DESIGN_H as H, pctW, pctH, cqw } from './tiles'

// three.js is ~150KB gzipped and only needed for the tiles, so it loads on the
// client after paint. Until it arrives the flat SVG tiles hold the exact same
// positions, so nothing shifts when the 3D version takes over.
const Icons3D = dynamic(() => import('./Icons3D'), {
  ssr: false,
  loading: () => <FlatTiles />,
})

// Built to Figma node 24:127, a 1440×1024 frame.
//
// Every position and size below is that frame's value converted to a
// proportion of it: percentages for placement, `cqw` for anything that needs
// to scale (type, radii). The stage declares `container-type: inline-size`, so
// 1cqw == 1% of the stage width and the whole composition scales as one piece
// instead of drifting apart at other viewport widths.
const PHOTO = '/rafi-photo.webp'

export default function AboutHero() {
  return (
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

      {/* ── Tool tiles ── */}
      <Icons3D />

      {/* ── Cutout, in front of the stadium and tiles ── */}
      <div
        style={{
          position: 'absolute',
          left: pctW(359), top: pctH(194),
          width: pctW(684), height: pctH(670),
          zIndex: 4,
          pointerEvents: 'none',
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
  )
}
