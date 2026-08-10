'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Project } from '@/lib/work-data'
import { navigateWithTransition } from '@/lib/page-transition'
import { isAnimated } from '@/lib/media'

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

export default function ProjectDetail({ project }: { project: Project }) {
  const [activeFrame, setActiveFrame] = useState(0)
  const frame = project.frames[activeFrame]

  return (
    <div className="flex flex-col md:flex-row w-full">

      {/* ══ RAIL — fixed in place on desktop, stacked on mobile ══ */}
      <aside
        className="w-full md:w-[32%] md:sticky md:top-0 md:h-screen md:shrink-0 flex flex-col"
        style={{ padding: '120px 40px 40px' }}
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

          {/* Service list */}
          <ul style={{ listStyle: 'none', margin: '28px 0 0', padding: 0 }}>
            {project.tags.map(tag => (
              <li key={tag} style={{
                fontSize: 13, lineHeight: 1.9,
                color: 'rgba(255,255,255,0.45)',
              }}>
                <span style={{ color: 'rgba(255,255,255,0.25)', marginRight: 8 }}>·</span>
                {tag}
              </li>
            ))}
          </ul>

          {/* Spacer pushes the frame section down on tall viewports */}
          <div className="hidden md:block" style={{ flex: 1, minHeight: 40 }} />

          {/* Frame tabs */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 20,
            marginTop: 40, paddingBottom: 4,
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

          {/* Active frame body */}
          {frame?.body && (
            <p style={{
              fontSize: 14, lineHeight: 1.75, letterSpacing: '-0.01em',
              color: 'rgba(255,255,255,0.6)',
              marginTop: 22, marginBottom: 0,
            }}>
              {frame.body}
            </p>
          )}

          {/* Back link */}
          <button
            onClick={() => navigateWithTransition('/work')}
            style={{
              background: 'none', border: 'none', padding: 0,
              marginTop: 36, cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 11, fontWeight: 600, letterSpacing: '2px',
              textTransform: 'uppercase', textAlign: 'left',
              color: 'rgba(255,255,255,0.35)',
              transition: 'color 0.18s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
          >
            ← Back to work
          </button>
        </div>
      </aside>

      {/* ══ MEDIA COLUMN — scrolls with the page ══ */}
      <div
        className="w-full md:grow"
        style={{ padding: '120px 40px 160px', minWidth: 0 }}
      >
        {project.frames.map((f, i) => (
          <section
            key={f.name}
            style={{ marginBottom: i === project.frames.length - 1 ? 0 : 24 }}
          >
            {/* Frame label */}
            <div style={{
              fontSize: 10, fontFamily: 'monospace', letterSpacing: '2.5px',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)',
              marginBottom: 10,
            }}>
              {String(i + 1).padStart(2, '0')} — {f.name}
            </div>

            {f.images && f.images.length > 0 ? (
              f.images.map((src, j) => (
                <div key={j} style={{
                  position: 'relative', width: '100%',
                  aspectRatio: String(MEDIA_RATIO),
                  borderRadius: 8, overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.08)',
                  marginBottom: j === f.images!.length - 1 ? 0 : 16,
                }}>
                  <Image
                    src={src}
                    alt={`${project.title} — ${f.name}`}
                    fill
                    sizes="(max-width: 767px) 100vw, 68vw"
                    unoptimized={isAnimated(src)}
                    style={{ objectFit: MEDIA_FIT }}
                  />
                </div>
              ))
            ) : (
              /* Placeholder — until frame images land in work-data.ts */
              <div style={{
                position: 'relative', width: '100%',
                aspectRatio: String(MEDIA_RATIO),
                borderRadius: 8, overflow: 'hidden',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
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
                  Placeholder
                </div>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
