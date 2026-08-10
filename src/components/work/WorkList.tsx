'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { PROJECTS, Project } from '@/lib/work-data'
import { navigateWithTransition } from '@/lib/page-transition'
import { isAnimated } from '@/lib/media'
import WorkMobile from './WorkMobile'

// Horizontal strip metrics — single source of truth so the scroll padding and
// the trailing spacer can never drift apart
const H_PAD      = 'max(48px, 11vw)'
const CARD_W     = 'clamp(420px, 42vw, 660px)'
const CARD_RATIO = 16 / 10   // >1 = landscape (width / height)
const GAP        = 24

// Scroll position is driven manually (see the wheel effect) rather than by CSS
// scroll-snap, so mouse wheels and trackpads behave identically.
const WHEEL_SPEED = 1.0   // multiplier on normalised wheel delta
const EASE        = 0.18  // lerp factor per frame — lower = longer glide
const SETTLE_MS   = 90    // wheel silence before easing to the nearest card
const SNAP_TO_CARD = true // set false to let it rest wherever the gesture ended

// A wheel event reporting deltaMode 1 is measured in lines, not pixels
const LINE_PX = 16

// Hover: the media scales up inside a fixed frame, so the card itself never
// moves and neighbours don't shift.
const HOVER_SCALE = 1.06

// Cursor thumbnail
const THUMB_LERP  = 0.1   // follow factor per frame — lower = more lag
const THUMB_GRACE = 80    // ms before collapsing, so row-to-row swaps stay alive
const SCROLL_QUIET = 180  // ms after the last wheel tick before hover re-arms

export default function WorkList() {
  // ── Mobile detection ───────────────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia('(pointer: coarse), (max-width: 767px)').matches)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const stripRef = useRef<HTMLDivElement>(null)

  // ── Cursor thumbnail state ─────────────────────────────────────────────
  // Visibility is decoupled from the hovered card so moving between adjacent
  // cards swaps the content instead of collapsing → re-springing the card.
  const [thumbActive,      setThumbActive]      = useState(false)
  const [displayedProject, setDisplayedProject] = useState<Project | null>(null)
  const exitTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const thumbActiveRef = useRef(false)
  // Cards slide under a stationary cursor while the strip scrolls, which fires
  // enter/leave on every card that passes. Suppress the thumbnail during that.
  const scrollingRef   = useRef(false)

  const setThumb = useCallback((v: boolean) => {
    if (thumbActiveRef.current === v) return
    thumbActiveRef.current = v
    setThumbActive(v)
  }, [])

  const handleCardEnter = useCallback((project: Project) => {
    if (scrollingRef.current) return
    // Cancel any pending collapse
    if (exitTimerRef.current) { clearTimeout(exitTimerRef.current); exitTimerRef.current = null }
    setDisplayedProject(project)   // swap content instantly (card stays at scale 1)
    setThumb(true)
  }, [setThumb])

  // Re-detect what sits under a stationary cursor and re-show the thumbnail.
  // Used after a scroll settles, where no pointer event will fire on its own.
  const reArmHover = useCallback(() => {
    const { x, y } = targetPos.current
    if (x < 0 || y < 0) return
    const card = document.elementFromPoint(x, y)?.closest('[data-card]')
    if (!card) return
    const project = PROJECTS.find(p => p.id === card.getAttribute('data-card'))
    if (!project) return
    setDisplayedProject(project)
    setThumb(true)
  }, [setThumb])

  const handleCardLeave = useCallback(() => {
    // Short grace period — entering another card within THUMB_GRACE cancels it
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current)
    exitTimerRef.current = setTimeout(() => {
      setThumb(false)
      exitTimerRef.current = null
    }, THUMB_GRACE)
  }, [setThumb])

  useEffect(() => () => {
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current)
  }, [])

  // ── Cursor thumbnail — lerp follow for smooth lag effect ──────────────
  const thumbRef  = useRef<HTMLDivElement>(null)
  const rafRef    = useRef<number | null>(null)
  const targetPos = useRef({ x: -400, y: -400 })
  const curPos    = useRef({ x: -400, y: -400 })

  const onMouseMove = useCallback((e: MouseEvent) => {
    targetPos.current = { x: e.clientX, y: e.clientY }
  }, [])

  useEffect(() => {
    if (isMobile) return
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    function tick() {
      curPos.current.x = lerp(curPos.current.x, targetPos.current.x, THUMB_LERP)
      curPos.current.y = lerp(curPos.current.y, targetPos.current.y, THUMB_LERP)
      if (thumbRef.current) {
        thumbRef.current.style.left = (curPos.current.x + 28) + 'px'
        thumbRef.current.style.top  = (curPos.current.y - 90) + 'px'
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    window.addEventListener('mousemove', onMouseMove)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isMobile, onMouseMove])

  // ── Lock the page's vertical scroll while this view is mounted ─────────
  // Class lives on <html> so it can't be clobbered by body-class toggling
  // elsewhere, and is always torn down on unmount / on switching to mobile.
  useEffect(() => {
    if (isMobile) return
    document.documentElement.classList.add('lock-vscroll')
    return () => document.documentElement.classList.remove('lock-vscroll')
  }, [isMobile])

  // ── Wheel → horizontal ─────────────────────────────────────────────────
  // Both axes are routed through one manually-driven target position. CSS
  // scroll-snap is deliberately NOT used: it re-snaps after every incremental
  // scrollLeft write, which cancels discrete mouse-wheel notches outright.
  // Registered natively (not via React's onWheel) because the listener must be
  // non-passive to call preventDefault.
  useEffect(() => {
    if (isMobile) return
    const el = stripRef.current
    if (!el) return

    const target = { x: el.scrollLeft }
    let raf: number | null = null
    let settle: ReturnType<typeof setTimeout> | null = null
    let quiet: ReturnType<typeof setTimeout> | null = null

    const maxScroll = () => el.scrollWidth - el.clientWidth
    const clamp = (v: number) => Math.max(0, Math.min(v, maxScroll()))

    // Wheel deltas arrive in pixels, lines or pages depending on the device
    // and browser — normalise before using them as a distance.
    const toPixels = (e: WheelEvent) => {
      const raw = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX
      if (e.deltaMode === 1) return raw * LINE_PX          // lines
      if (e.deltaMode === 2) return raw * el.clientWidth   // pages
      return raw                                           // already pixels
    }

    // Content offset of each card, measured live so it survives resizes
    const cardOffsets = () => {
      const base = el.getBoundingClientRect().left - el.scrollLeft
      const pad  = parseFloat(getComputedStyle(el).paddingLeft) || 0
      return Array.from(el.querySelectorAll<HTMLElement>('[data-card]')).map(
        c => clamp(c.getBoundingClientRect().left - base - pad)
      )
    }

    const tick = () => {
      const dist = target.x - el.scrollLeft
      if (Math.abs(dist) < 0.5) {
        el.scrollLeft = target.x
        raf = null
        // Cards have stopped moving — safe to re-show the thumbnail for
        // whichever one ended up under the cursor.
        if (!scrollingRef.current) reArmHover()
        return
      }
      el.scrollLeft += dist * EASE
      raf = requestAnimationFrame(tick)
    }

    const run = () => { if (raf === null) raf = requestAnimationFrame(tick) }

    const onWheel = (e: WheelEvent) => {
      const px = toPixels(e)
      if (px === 0) return
      e.preventDefault()

      // Hide the cursor thumbnail for the duration of the gesture — cards
      // sliding past a stationary pointer would otherwise strobe it.
      scrollingRef.current = true
      setThumb(false)
      if (quiet) clearTimeout(quiet)
      quiet = setTimeout(() => {
        scrollingRef.current = false
        // mouseenter only fires when the pointer *crosses* a boundary, and the
        // pointer hasn't moved — so nothing would re-show the thumbnail even
        // though a card is sitting right under it. Re-detect manually, but
        // only if the glide already finished; otherwise tick() handles it.
        if (raf === null) reArmHover()
      }, SCROLL_QUIET)

      target.x = clamp(target.x + px * WHEEL_SPEED)
      run()

      if (settle) clearTimeout(settle)
      if (SNAP_TO_CARD) {
        settle = setTimeout(() => {
          const nearest = cardOffsets().reduce(
            (best, o) => (Math.abs(o - target.x) < Math.abs(best - target.x) ? o : best),
            target.x,
          )
          target.x = nearest
          run()
        }, SETTLE_MS)
      }
    }

    // Keep the target honest if the position moves by any other route —
    // keyboard focus, a resize reflow, or programmatic scrolling.
    const onScroll = () => { if (raf === null) target.x = el.scrollLeft }
    const onResize = () => { target.x = clamp(target.x) }

    // Listen on the window so the wheel works anywhere on the page, not only
    // when the cursor happens to be over a card.
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('resize', onResize)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', onResize)
      el.removeEventListener('scroll', onScroll)
      if (raf !== null) cancelAnimationFrame(raf)
      if (settle) clearTimeout(settle)
      if (quiet) clearTimeout(quiet)
    }
  }, [isMobile, setThumb, reArmHover])

  if (isMobile) return <WorkMobile />

  // ── Horizontal strip ───────────────────────────────────────────────────
  return (
    <>
    <div style={{
      position: 'relative', zIndex: 10,
      height: '100vh',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      // Clear the fixed nav
      paddingTop: 120,
    }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        marginBottom: 20, paddingLeft: H_PAD, paddingRight: H_PAD,
        flexShrink: 0,
      }}>
        <h1 style={{
          fontSize: 'clamp(40px, 6vw, 88px)', fontWeight: 800,
          letterSpacing: '-0.04em', lineHeight: 1,
          color: '#fff', margin: 0,
        }}>
          My Masterpiece
        </h1>
        <span style={{
          fontSize: 11, color: 'rgba(255,255,255,0.2)',
          letterSpacing: '2.5px', fontFamily: 'monospace',
        }}>
          {PROJECTS.length} PROJECTS
        </span>
      </div>

      {/* ── Top divider ── */}
      <div style={{
        height: 1, background: 'rgba(255,255,255,0.1)',
        marginLeft: H_PAD, marginRight: H_PAD, flexShrink: 0,
      }} />

      {/* ── Scroll strip ── */}
      <div
        ref={stripRef}
        className="no-scrollbar"
        style={{
          display: 'flex',
          gap: GAP,
          overflowX: 'auto',
          overflowY: 'hidden',
          // No scrollSnapType — settling is done manually in the wheel effect
          paddingLeft: H_PAD,
          paddingTop: 40,
          paddingBottom: 40,
          flexShrink: 0,
          // Stop horizontal overscroll from triggering browser back-navigation
          overscrollBehaviorX: 'contain',
        }}
      >
        {PROJECTS.map((project, i) => (
          <ProjectCardH
            key={project.id}
            project={project}
            index={i}
            onEnter={handleCardEnter}
            onLeave={handleCardLeave}
          />
        ))}

        {/* Trailing spacer — a flex scroll container drops its padding-right in
            WebKit, so the last card needs a real element to breathe against */}
        <div aria-hidden style={{ flex: '0 0 auto', width: H_PAD }} />
      </div>
    </div>

    {/* ── Cursor thumbnail ── */}
    <div
      ref={thumbRef}
      aria-hidden
      style={{
        position: 'fixed',
        zIndex: 99999,
        pointerEvents: 'none',
        // Spring up on first hover, stay alive while moving between cards,
        // collapse only once the cursor truly leaves them all
        opacity: thumbActive ? 1 : 0,
        transform: thumbActive ? 'rotate(-3deg) scale(1)' : 'rotate(-3deg) scale(0)',
        transition: thumbActive
          ? 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.15s ease'
          : 'transform 0.22s cubic-bezier(0.4, 0, 1, 1), opacity 0.2s ease',
        transformOrigin: 'left top',
        // Card shape
        width: 220,
        height: 140,
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.55)',
        // Initial off-screen position
        left: -300,
        top: -300,
        willChange: 'left, top',
      }}
    >
      {displayedProject && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 100%)',
          borderTop: `3px solid ${displayedProject.accent}`,
        }}>
          {/* Accent glow blob */}
          <div style={{
            position: 'absolute', right: -20, top: -20,
            width: 120, height: 120, borderRadius: '50%',
            background: displayedProject.accent,
            opacity: 0.15,
            filter: 'blur(30px)',
          }} />

          {/* Content */}
          <div style={{
            position: 'absolute', inset: 0, padding: '14px 16px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{
                fontSize: 9, letterSpacing: '2px',
                color: displayedProject.accent, textTransform: 'uppercase',
                fontFamily: 'monospace', fontWeight: 700,
              }}>
                {displayedProject.tags[0]}
              </div>
              <div style={{
                fontSize: 15, fontWeight: 700, color: '#fff',
                marginTop: 5, letterSpacing: '-0.02em', lineHeight: 1.2,
                textTransform: 'uppercase',
              }}>
                {displayedProject.title}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{
                fontSize: 10, color: 'rgba(255,255,255,0.35)',
                letterSpacing: '1px', fontFamily: 'monospace',
              }}>
                {displayedProject.year}
              </span>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: `${displayedProject.accent}22`,
                border: `1px solid ${displayedProject.accent}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 12, color: displayedProject.accent }}>↗</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}

// ── Card ─────────────────────────────────────────────────────────────────
function ProjectCardH({ project, index, onEnter, onLeave }: {
  project: Project
  index: number
  onEnter: (p: Project) => void
  onLeave: () => void
}) {
  const [hovered, setHovered] = useState(false)

  const go = () => navigateWithTransition(`/work/${project.id}`)

  return (
    <div
      data-card={project.id}
      className="no-hover-outline"
      role="button"
      tabIndex={0}
      aria-label={`${project.title}, ${project.year}`}
      onClick={go}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go() }
      }}
      onMouseEnter={() => { setHovered(true); onEnter(project) }}
      onMouseLeave={() => { setHovered(false); onLeave() }}
      style={{
        flex: '0 0 auto',
        width: CARD_W,
        cursor: 'pointer',
      }}
    >
      {/* Media */}
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: String(CARD_RATIO),
        borderRadius: 10,
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        {project.thumbnail ? (
          <Image
            src={project.thumbnail}
            alt={project.title}
            fill
            sizes="(max-width: 767px) 100vw, 42vw"
            unoptimized={isAnimated(project.thumbnail)}
            style={{
              objectFit: 'cover',
              transform: hovered ? `scale(${HOVER_SCALE})` : 'scale(1)',
              transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
        ) : (
          /* Placeholder — stands in until real thumbnails land in work-data.ts.
             Scales with the same curve as a real image so the hover feel
             doesn't change once thumbnails are dropped in. */
          <div style={{
            position: 'absolute', inset: 0,
            transform: hovered ? `scale(${HOVER_SCALE})` : 'scale(1)',
            transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(140deg, ${project.accent}18 0%, transparent 60%)`,
            }} />
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, letterSpacing: '3px', fontFamily: 'monospace',
              color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase',
            }}>
              Placeholder
            </div>
          </div>
        )}

        {/* Index badge */}
        <span style={{
          position: 'absolute', top: 10, left: 18,
          fontSize: 'clamp(24px, 2.6vw, 38px)', fontWeight: 800,
          letterSpacing: '-0.02em', fontFamily: 'monospace',
          color: 'rgba(255,255,255,0.45)',
          pointerEvents: 'none',
        }}>
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      {/* Caption */}
      <div style={{ paddingTop: 16 }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12,
        }}>
          <span style={{
            fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em',
            color: hovered ? '#fff' : 'rgba(255,255,255,0.9)',
            textTransform: 'uppercase', lineHeight: 1.15,
            transition: 'color 0.18s',
          }}>
            {project.title}
          </span>
          <span style={{
            fontSize: 11, color: 'rgba(255,255,255,0.25)',
            fontFamily: 'monospace', flexShrink: 0,
          }}>
            {project.year}
          </span>
        </div>

        {/* Tag pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {project.tags.map((tag) => (
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
    </div>
  )
}
