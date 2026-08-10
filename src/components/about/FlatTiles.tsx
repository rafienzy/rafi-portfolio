'use client'

import Image from 'next/image'
import { TILES, pctW, pctH, cqw } from './tiles'

// Flat DOM tiles. Used two ways: as the placeholder while the 3D bundle
// downloads, and as the standing fallback when WebGL is unavailable. Positions
// come from the same TILES data the 3D version uses, so the swap is seamless.
export default function FlatTiles() {
  return (
    <>
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
    </>
  )
}
