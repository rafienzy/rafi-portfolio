'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import Nav from '@/components/layout/Nav'
import ProjectDetail from '@/components/work/ProjectDetail'
import ProjectQuickNav from '@/components/work/ProjectQuickNav'
import { PROJECTS } from '@/lib/work-data'
import { navigateWithTransition } from '@/lib/page-transition'

interface Props {
  params: Promise<{ id: string }>
}

export default function WorkDetail({ params }: Props) {
  const { id } = use(params)
  const project = PROJECTS.find(p => p.id === id)

  if (!project) notFound()

  return (
    <main className="relative w-full min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 z-0 bg-cover bg-top" style={{ backgroundImage: "url('/bg.webp')" }} />
      {/* Grid overlay */}
      <div className="fixed inset-0 z-[1] pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.008) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.008) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }} />

      <Nav />

      {/* Back button — sits directly above the quick-nav pill.
          ProjectQuickNav is at bottom:28 and stands 50px tall (40px buttons +
          5px padding each side), so it occupies 28→78px; 90px clears it by 12. */}
      <button
        onClick={() => navigateWithTransition('/work')}
        style={{
          position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 100, padding: '7px 18px',
          color: 'rgba(255,255,255,0.8)', cursor: 'pointer',
          fontSize: 12, fontWeight: 600, letterSpacing: '0.04em',
          fontFamily: 'inherit',
          whiteSpace: 'nowrap',
          transition: 'color 0.15s, border-color 0.15s',
        }}
        onMouseEnter={e => { const el = e.currentTarget; el.style.color = '#fff'; el.style.borderColor = 'rgba(255,255,255,0.4)' }}
        onMouseLeave={e => { const el = e.currentTarget; el.style.color = 'rgba(255,255,255,0.8)'; el.style.borderColor = 'rgba(255,255,255,0.14)' }}
      >
        ← Back
      </button>

      <div style={{ position: 'relative', zIndex: 10 }}>
        <ProjectDetail project={project} />
      </div>

      {/* Quick navigation between projects */}
      <ProjectQuickNav currentId={project.id} />
    </main>
  )
}
