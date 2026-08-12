'use client'

import { PROJECTS } from '@/lib/work-data'
import { navigateWithTransition } from '@/lib/page-transition'

export default function WorkMobile() {
  return (
    <div style={{ position: 'relative', zIndex: 10, paddingTop: 100, paddingBottom: 60, paddingLeft: 24, paddingRight: 24 }}>
      <div style={{ marginBottom: 48 }}>
        <h1 style={{
          fontSize: 'clamp(40px, 10vw, 64px)', fontWeight: 800,
          letterSpacing: '-0.04em', color: '#fff', lineHeight: 1,
        }}>My Masterpiece</h1>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {PROJECTS.map((project, i) => (
          <div
            key={project.id}
            role="button"
            onClick={() => navigateWithTransition(`/work/${project.id}`)}
            style={{
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              padding: '24px 0',
              display: 'flex', alignItems: 'flex-start', gap: 16,
              cursor: 'pointer',
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: project.accent, flexShrink: 0 }} />

            <span style={{
              fontSize: 22, fontWeight: 800, color: 'rgba(255,255,255,0.45)',
              letterSpacing: '-0.02em', minWidth: 34, lineHeight: 1,
            }}>
              {String(i + 1).padStart(2, '0')}
            </span>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: 17, fontWeight: 600,
                letterSpacing: '-0.02em', color: '#fff',
              }}>
                {project.title}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {project.tags.map((tag) => (
                  <span key={tag} style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: '0.5px',
                    color: '#0B3D1E', background: '#5CFF85',
                    padding: '3px 10px', borderRadius: 100,
                    textTransform: 'uppercase', whiteSpace: 'nowrap',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', flexShrink: 0, alignSelf: 'flex-start' }}>
              {project.year}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
