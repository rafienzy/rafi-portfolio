'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Project, Media } from '@/lib/work-data'
import { isAnimated, isVideo, toMedia } from '@/lib/media'

// Split layout: a fixed information rail beside a scrolling column of work.
// The rail is sticky rather than `position: fixed` so it participates in normal
// flow — that keeps the two columns aligned and lets the whole thing collapse
// to a single stack on mobile without any position juggling.
// Rail width lives in the Tailwind class below (md:w-[32%]) so it can be
// desktop-only — the columns stack full-width on mobile.
const MEDIA_RATIO = 16 / 10
// 'cover' fills the 16:10 frame and crops anything taller or wider.
// Switch to 'contain' to letterbox instead — nothing gets cut off, but you get
// bars around images whose shape doesn't match.
const MEDIA_FIT: 'cover' | 'contain' = 'cover'
// Empty media blocks rendered while project.media is still unpopulated, so the
// column has enough length to scroll against the sticky rail.
const PLACEHOLDER_COUNT = 5

export default function ProjectDetail({ project }: { project: Project }) {
  const [activeFrame, setActiveFrame] = useState(0)
  const frame = project.frames[activeFrame]

  return (
    <div className="flex flex-col md:flex-row w-full">

      {/* ══ RAIL — fixed in place on desktop, stacked on mobile ══ */}
      {/* Top padding clears the fixed nav: the desktop pill runs 57→123px, so
          200 leaves a real gap rather than tucking the title under its edge.
          Mobile's nav is shorter, so it gets less. */}
      <aside
        className="w-full md:w-[32%] md:sticky md:top-0 md:h-screen md:shrink-0
                   flex flex-col px-6 md:px-10 pt-[136px] md:pt-[200px] pb-10"
      >
        <div className="md:max-w-[420px] flex flex-col h-full">

          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(30px, 3.2vw, 46px)', fontWeight: 700,
            letterSpacing: '-0.035em', lineHeight: 1.05, color: '#fff',
            margin: 0,
          }}>
            {project.title}
          </h1>

          {/* Year */}
          <div style={{
            fontSize: 12, fontFamily: 'monospace', letterSpacing: '1.5px',
            color: 'rgba(255,255,255,0.3)', marginTop: 14,
          }}>
            {project.year}
          </div>

          {/* Narrative tabs */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 20,
            marginTop: 36, paddingBottom: 4,
          }}>
            {project.frames.map((f, i) => {
              const active = i === activeFrame
              return (
                <button
                  key={f.name}
                  onClick={() => setActiveFrame(i)}
                  aria-pressed={active}
                  style={{
                    background: 'none', border: 'none', padding: '0 0 6px',
                    cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: 11, fontWeight: 600, letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    color: active ? '#fff' : 'rgba(255,255,255,0.32)',
                    borderBottom: active
                      ? '1px solid #5CFF85'
                      : '1px solid transparent',
                    transition: 'color 0.18s, border-color 0.18s',
                  }}
                >
                  {f.name}
                </button>
              )
            })}
          </div>

          {/* Active section body — this is now the rail's main argument, so it
              carries more size and contrast than a subtitle would */}
          {frame?.body && (
            <p style={{
              fontSize: 16, lineHeight: 1.7, letterSpacing: '-0.01em',
              color: 'rgba(255,255,255,0.78)',
              marginTop: 22, marginBottom: 0,
            }}>
              {frame.body}
            </p>
          )}

          {/* Spacer pins the category pills to the foot of the rail */}
          <div className="hidden md:block" style={{ flex: 1, minHeight: 40 }} />

          {/* Category pills */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 8,
            marginTop: 36,
          }}>
            {project.tags.map(tag => (
              <span key={tag} style={{
                fontSize: 11, fontWeight: 600, letterSpacing: '0.5px',
                color: '#0B3D1E',
                background: '#5CFF85',
                padding: '4px 12px', borderRadius: 100,
                textTransform: 'uppercase', whiteSpace: 'nowrap',
              }}>
                {tag}
              </span>
            ))}
          </div>

        </div>
      </aside>

      {/* ══ MEDIA COLUMN — scrolls with the page ══ */}
      {/* On desktop this matches the rail so the two columns start level. When
          they stack on mobile the rail has already cleared the nav, so this
          only needs enough to separate it from the copy above. */}
      <div
        className="w-full md:grow px-6 md:px-10 pt-0 md:pt-[200px] pb-[120px] md:pb-[160px]"
        style={{ minWidth: 0 }}
      >
        {/* Media is decoupled from the rail tabs now — the tabs tell a story in
            three parts, while this is simply every asset for the project in
            order. PLACEHOLDER_COUNT empty blocks stand in until project.media
            is populated. */}
        {(project.media?.length
          ? project.media
          : Array.from({ length: PLACEHOLDER_COUNT }, () => null)
        ).map((item, i, arr) => (
          <div
            key={i}
            style={{
              position: 'relative', width: '100%',
              aspectRatio: String(MEDIA_RATIO),
              borderRadius: 8, overflow: 'hidden',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              marginBottom: i === arr.length - 1 ? 0 : 16,
            }}
          >
            {item ? (
              <MediaItem item={item} alt={`${project.title} — ${i + 1}`} />
            ) : (
              <>
                <div style={{
                  position: 'absolute', inset: 0,
                  background: `linear-gradient(140deg, ${project.accent}14 0%, transparent 60%)`,
                }} />
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, letterSpacing: '3px', fontFamily: 'monospace',
                  color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase',
                }}>
                  Placeholder {String(i + 1).padStart(2, '0')}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Single media slot — image, gif or video ──────────────────────────────
function MediaItem({ item, alt }: { item: Media; alt: string }) {
  const { src, poster } = toMedia(item)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Only the visible clips play. A detail page can stack several full-width
  // videos, and decoding them all at once is the expensive part — not the
  // download, which `preload="metadata"` already keeps small.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Rejects when the browser blocks autoplay (iOS Low Power Mode);
          // the poster stays up in that case, which is the intended fallback.
          v.play().catch(() => {})
        } else {
          v.pause()
        }
      },
      { threshold: 0.25 },
    )

    io.observe(v)
    return () => io.disconnect()
  }, [])

  if (isVideo(src)) {
    return (
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        // muted + playsInline are both required or iOS refuses to autoplay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={alt}
        style={{
          width: '100%', height: '100%',
          objectFit: MEDIA_FIT, display: 'block',
        }}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 767px) 100vw, 68vw"
      unoptimized={isAnimated(src)}
      style={{ objectFit: MEDIA_FIT }}
    />
  )
}
