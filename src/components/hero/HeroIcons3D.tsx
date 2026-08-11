'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { Tile3D } from '@/components/three/Icons3D'

// three.js is ~150KB gzipped, so it loads after paint. No fallback here: the
// hero reads fine without the tiles for the moment it takes to arrive, and a
// flat stand-in would only pop as it swaps.
const Icons3D = dynamic(() => import('@/components/three/Icons3D'), { ssr: false })

// Positions carried over from the DOM version this replaces, as fractions of
// the hero. Sizes are CSS pixels — no design width is passed, so they stay put
// rather than scaling with the viewport.
const SIZE = 74

const DESKTOP: Tile3D[] = [
  { tex: '/icon-ai.png',    side: '#330000', label: 'Illustrator',   x: 0.21, y: 0.30, size: SIZE, rot: -12 },
  { tex: '/icon-ps.png',    side: '#001E36', label: 'Photoshop',     x: 0.25, y: 0.65, size: SIZE, rot: 9 },
  { tex: '/icon-ae.png',    side: '#00005B', label: 'After Effects', x: 0.79, y: 0.26, size: SIZE, rot: 14 },
  { tex: '/icon-figma.png', side: '#171717', label: 'Figma',         x: 0.79, y: 0.60, size: SIZE, rot: -8 },
  { tex: '/icon-html5.png', side: '#E44D26', label: 'HTML5',         x: 0.67, y: 0.74, size: SIZE, rot: 11 },
]

const MOBILE: Tile3D[] = [
  { tex: '/icon-ai.png',    side: '#330000', label: 'Illustrator',   x: 0.12, y: 0.07, size: 52, rot: -12 },
  { tex: '/icon-ps.png',    side: '#001E36', label: 'Photoshop',     x: 0.47, y: 0.05, size: 52, rot: 9 },
  { tex: '/icon-ae.png',    side: '#00005B', label: 'After Effects', x: 0.80, y: 0.07, size: 52, rot: 14 },
  { tex: '/icon-figma.png', side: '#171717', label: 'Figma',         x: 0.25, y: 0.87, size: 52, rot: -8 },
  { tex: '/icon-html5.png', side: '#E44D26', label: 'HTML5',         x: 0.68, y: 0.85, size: 52, rot: 11 },
]

export default function HeroIcons3D({
  sectionRef,
}: {
  sectionRef: React.RefObject<HTMLElement | null>
}) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia('(max-width: 767px)').matches)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <Icons3D
      tiles={isMobile ? MOBILE : DESKTOP}
      interactive
      zIndex={5}
      // Events are delegated to the hero section so the canvas doesn't swallow
      // the pointer events the draggable headings depend on.
      eventSource={sectionRef}
    />
  )
}
