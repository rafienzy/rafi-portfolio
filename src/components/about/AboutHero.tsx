'use client'

import Image from 'next/image'

// ── Tuning ───────────────────────────────────────────────────────────────
// Set this to your cutout once it's in public/ — a PNG or WebP with a
// transparent background. While it's null you get the placeholder silhouette.
const PHOTO: string | null = null

const HEADLINE = 'RAFI'

// Where the front copy of the headline starts being visible, measured from the
// top of the text block. Everything above this line is clipped away, so the
// letters read as passing behind your head and in front of your body.
// Raise it to bury more of the type; lower it to bring more forward.
const FRONT_CLIP = '58%'

// Height of the cutout. The type is sized off the viewport, so these two want
// adjusting together.
const PHOTO_H = 'min(72vh, 620px)'

const TYPE: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  margin: 0,
  fontSize: 'clamp(72px, 17vw, 300px)',
  fontWeight: 800,
  letterSpacing: '-0.05em',
  lineHeight: 0.85,
  whiteSpace: 'nowrap',
  userSelect: 'none',
  pointerEvents: 'none',
}

export default function AboutHero() {
  return (
    <section
      style={{
        position: 'relative', zIndex: 10,
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '120px 24px 80px',
        overflow: 'hidden',
      }}
    >
      {/* The stage — all three layers share this box so the two copies of the
          headline stay pixel-aligned with each other. */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>

        {/* ── 1. Headline, behind ── */}
        <h1 style={{ ...TYPE, zIndex: 1, color: '#fff' }}>
          {HEADLINE}
        </h1>

        {/* ── 2. Cutout ── */}
        <div style={{ position: 'relative', zIndex: 2, height: PHOTO_H }}>
          {PHOTO ? (
            <Image
              src={PHOTO}
              alt="Rafi"
              width={900}
              height={1200}
              priority
              style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
            />
          ) : (
            <PlaceholderFigure />
          )}
        </div>

        {/* ── 3. Headline again, in front — clipped to its lower portion ──
            aria-hidden because it's the same word as the h1 above; without it
            a screen reader announces the name twice. */}
        <div
          aria-hidden
          style={{
            ...TYPE,
            zIndex: 3,
            color: '#fff',
            clipPath: `inset(${FRONT_CLIP} 0 0 0)`,
          }}
        >
          {HEADLINE}
        </div>
      </div>
    </section>
  )
}

// Stand-in until the real cutout lands. Deliberately plain — it exists to show
// where the figure sits and how the type wraps around it, nothing more.
function PlaceholderFigure() {
  return (
    <svg
      viewBox="0 0 300 400"
      style={{ height: '100%', width: 'auto', display: 'block' }}
      role="img"
      aria-label="Placeholder figure"
    >
      <defs>
        <linearGradient id="ph-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.22)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
        </linearGradient>
      </defs>
      {/* head */}
      <circle cx="150" cy="96" r="62" fill="url(#ph-fill)" />
      {/* shoulders / torso */}
      <path
        d="M150 172c-62 0-108 40-118 96-6 33-9 76-9 132h254c0-56-3-99-9-132-10-56-56-96-118-96z"
        fill="url(#ph-fill)"
      />
      <text
        x="150" y="330"
        textAnchor="middle"
        fill="rgba(255,255,255,0.35)"
        style={{ fontSize: 13, letterSpacing: 3, fontFamily: 'monospace' }}
      >
        PLACEHOLDER
      </text>
    </svg>
  )
}
