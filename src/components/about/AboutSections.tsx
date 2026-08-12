'use client'

import Image from 'next/image'
import { BIO, SKILLS, ROLES, type Skill } from '@/lib/about-data'

// Sections below the about hero. Gutters match the nav (50px desktop / 24px
// mobile) so everything lines up with the logo and Let's Talk button, the same
// as the project detail page.
//
// No eyebrow labels: headings carry their own sections.

const MAXW = 1440
const ICON = 22

// One chip shape for everything, so a tool with a logo and one without still
// sit on the same line without looking like two different components.
//
// The two icon sources don't match visually: the Adobe/Figma files are app
// tiles with their own coloured background, while the Simple Icons ones are
// bare glyphs on transparency. Giving the glyphs a backing plate at the same
// size lets both read as the same object.
function SkillChip({ skill }: { skill: Skill }) {
  const { name, icon, glyph } = skill

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 100,
      padding: icon ? '5px 14px 5px 5px' : '7px 14px',
      whiteSpace: 'nowrap',
    }}>
      {icon && (
        <span style={{
          width: ICON, height: ICON,
          borderRadius: glyph ? 6 : 5,
          overflow: 'hidden',
          flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: glyph ? 'rgba(255,255,255,0.08)' : 'transparent',
        }}>
          <Image
            src={icon}
            alt=""
            width={ICON}
            height={ICON}
            style={{
              width: glyph ? ICON * 0.68 : ICON,
              height: glyph ? ICON * 0.68 : ICON,
              display: 'block',
            }}
          />
        </span>
      )}
      <span style={{
        fontSize: 12, fontWeight: 600, letterSpacing: '0.01em',
        color: 'rgba(255,255,255,0.85)',
      }}>
        {name}
      </span>
    </span>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="px-6 md:px-[50px]"
      style={{ maxWidth: MAXW, margin: '0 auto', paddingTop: 96, paddingBottom: 0 }}
    >
      <h2 style={{
        fontSize: 'clamp(28px, 4vw, 56px)', fontWeight: 800,
        letterSpacing: '-0.04em', lineHeight: 1, color: '#fff', margin: 0,
      }}>
        {title}
      </h2>

      <div style={{
        height: 1, background: 'rgba(255,255,255,0.1)',
        marginTop: 24, marginBottom: 40,
      }} />

      {children}
    </section>
  )
}

export default function AboutSections() {
  return (
    <div style={{ position: 'relative', zIndex: 10, paddingBottom: 160 }}>

      {/* ── Bio ── */}
      <Section title="About">
        <div style={{ maxWidth: 780 }}>
          {BIO.map((para, i) => (
            <p
              key={i}
              style={{
                fontSize: 'clamp(15px, 1.4vw, 18px)',
                lineHeight: 1.75, letterSpacing: '-0.01em',
                color: 'rgba(255,255,255,0.72)',
                margin: 0, marginBottom: i === BIO.length - 1 ? 0 : 20,
              }}
            >
              {para}
            </p>
          ))}
        </div>
      </Section>

      {/* ── Tools & skills ── */}
      <Section title="Tools">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 32,
        }}>
          {SKILLS.map(({ group, items }) => (
            <div key={group}>
              <div style={{
                fontSize: 12, fontWeight: 700, letterSpacing: '0.02em',
                color: '#fff', marginBottom: 14,
              }}>
                {group}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {items.map(item => (
                  <SkillChip key={item.name} skill={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Experience ── */}
      <Section title="Experience">
        <div>
          {ROLES.map((role, i) => (
            <div
              key={`${role.company}-${i}`}
              className="flex flex-col md:flex-row"
              style={{
                gap: 24,
                paddingTop: i === 0 ? 0 : 32,
                paddingBottom: 32,
                borderBottom: i === ROLES.length - 1
                  ? 'none'
                  : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* Period — fixed column on desktop so the roles line up */}
              <div
                className="md:w-[200px] md:shrink-0"
                style={{
                  fontSize: 12, fontFamily: 'monospace', letterSpacing: '1.5px',
                  color: 'rgba(255,255,255,0.35)', paddingTop: 4,
                }}
              >
                {role.period}
              </div>

              <div style={{ maxWidth: 720 }}>
                <div style={{
                  fontSize: 'clamp(18px, 2vw, 22px)', fontWeight: 700,
                  letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.2,
                }}>
                  {role.title}
                </div>
                <div style={{
                  fontSize: 13, color: '#5CFF85',
                  marginTop: 6, fontWeight: 600,
                }}>
                  {role.company}
                </div>
                <p style={{
                  fontSize: 15, lineHeight: 1.7, letterSpacing: '-0.01em',
                  color: 'rgba(255,255,255,0.6)', marginTop: 12, marginBottom: 0,
                }}>
                  {role.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
