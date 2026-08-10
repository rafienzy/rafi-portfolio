'use client'

import { useState } from 'react'
import { Frame } from '@/lib/work-data'
import { toMedia } from '@/lib/media'

interface Props {
  frame: Frame
  index: number
  accentColor: string
  popDelay?: number
}

export default function CanvasFrame({ frame, index, accentColor, popDelay = 0 }: Props) {
  const [selected, setSelected] = useState(false)

  return (
    <div style={{
      position: 'relative', marginBottom: 80,
      animation: `canvas-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${popDelay}ms both`,
      transformOrigin: 'top left',
    }}>
      {/* Figma frame-name label — top-left, floating above the frame */}
      <div style={{
        position: 'absolute', top: -22, left: 0,
        background: selected ? accentColor : 'rgba(92,255,133,0.85)',
        color: '#000',
        fontSize: 11, fontWeight: 600, letterSpacing: '0.01em',
        padding: '2px 8px', borderRadius: 3,
        whiteSpace: 'nowrap', fontFamily: 'monospace',
        pointerEvents: 'none',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        {/* Frame icon */}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1" y="1" width="8" height="8" rx="1" />
          <line x1="3.5" y1="1" x2="3.5" y2="9" />
          <line x1="6.5" y1="1" x2="6.5" y2="9" />
          <line x1="1" y1="3.5" x2="9" y2="3.5" />
          <line x1="1" y1="6.5" x2="9" y2="6.5" />
        </svg>
        {frame.name}
      </div>

      {/* Frame/artboard */}
      <div
        role="button"
        onClick={() => setSelected(s => !s)}
        style={{
          background: 'rgba(10,25,18,0.7)',
          border: selected
            ? '1.5px solid rgba(92,255,133,0.95)'
            : '1px solid rgba(255,255,255,0.08)',
          borderRadius: 4,
          padding: '40px 48px',
          minHeight: 280,
          cursor: 'default',
          transition: 'border-color 0.15s',
          outline: 'none',
        }}
      >
        {/* Frame index watermark */}
        <div style={{
          position: 'absolute', top: 12, right: 16,
          fontSize: 10, fontWeight: 600, letterSpacing: '2px',
          color: 'rgba(255,255,255,0.1)',
          fontFamily: 'monospace',
          pointerEvents: 'none',
        }}>
          {String(index + 1).padStart(2, '0')}
        </div>

        {/* Frame content */}
        {frame.body && (
          <p style={{
            fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.7)',
            maxWidth: 640, fontWeight: 400, letterSpacing: '-0.01em',
          }}>
            {frame.body}
          </p>
        )}

        {/* Image placeholders */}
        {frame.images && frame.images.length > 0 && (
          <div style={{ display: 'flex', gap: 16, marginTop: frame.body ? 32 : 0, flexWrap: 'wrap' }}>
            {frame.images.map(toMedia).map(({ src }, i) => (
              <div key={i} style={{
                width: 260, height: 180,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 4,
                overflow: 'hidden',
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        )}

        {/* Placeholder blocks when no images provided */}
        {(!frame.images || frame.images.length === 0) && (
          <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
            {[300, 220, 180].map((w, i) => (
              <div key={i} style={{
                width: w, height: 140,
                background: 'rgba(255,255,255,0.03)',
                border: '1px dashed rgba(255,255,255,0.06)',
                borderRadius: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                  image
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selection size label — shown when selected */}
      {selected && (
        <div style={{
          position: 'absolute', bottom: -22, left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(92,255,133,0.9)', color: '#000',
          fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 3,
          whiteSpace: 'nowrap', fontFamily: 'monospace', letterSpacing: '0.02em',
          pointerEvents: 'none',
        }}>
          {frame.name} frame
        </div>
      )}
    </div>
  )
}
