// Content for the about page below the hero. Kept separate from layout so the
// copy can be rewritten without touching components.
//
// PLACEHOLDER text is marked as such. I haven't invented anything about your
// career — dates, titles and claims are yours to fill in.

export const BIO: string[] = [
  'Placeholder — the short version of who you are and what you do. One or two ' +
  'sentences that would still be true in a year, written the way you would say ' +
  'it out loud rather than the way a CV would.',

  'Placeholder — the longer version. What you actually enjoy building, the kind ' +
  'of problem you like being handed, and what someone gets by working with you ' +
  'that they would not get elsewhere. Three or four sentences.',
]

export type Skill = {
  name: string
  // Optional — anything without one renders as a plain chip rather than a
  // missing image. "Kinetic Type" and "Rich Media" are techniques, not
  // products, so no logo exists for them.
  icon?: string
  // The five Adobe/Figma files are full app tiles that carry their own
  // background. The Simple Icons ones are bare glyphs on transparency, so they
  // need a backing plate to sit on or they float against the page.
  glyph?: boolean
}

export type SkillGroup = {
  group: string
  items: Skill[]
}

// The tools themselves are factual — they come from your own icon set and the
// tags already on your projects. Any grouping or ordering is yours to change.
export const SKILLS: SkillGroup[] = [
  {
    group: 'Design',
    items: [
      { name: 'Figma',        icon: '/icon-figma.svg' },
      { name: 'Photoshop',    icon: '/icon-ps.svg' },
      { name: 'Illustrator',  icon: '/icon-ai.svg' },
    ],
  },
  {
    group: 'Motion',
    items: [
      { name: 'After Effects', icon: '/icon-ae.svg' },
      { name: 'Kinetic Type' },
      { name: 'Rich Media' },
    ],
  },
  {
    group: 'Build',
    items: [
      { name: 'HTML5',      icon: '/icon-html5.svg' },
      { name: 'CSS',        icon: '/icon-css.svg',   glyph: true },
      { name: 'JavaScript', icon: '/icon-js.svg',    glyph: true },
      { name: 'React',      icon: '/icon-react.svg', glyph: true },
    ],
  },
]

export type Role = {
  period: string
  title: string
  company: string
  body: string
}

export const ROLES: Role[] = [
  {
    period: '2024 — Now',
    title: 'Placeholder — your title',
    company: 'Gomobile Indonesia',
    body: 'Placeholder — what you own here, at what scale, and what changed ' +
          'because you did it. Specifics beat adjectives.',
  },
  {
    period: 'Placeholder — years',
    title: 'Placeholder — your title',
    company: 'Placeholder — company',
    body: 'Placeholder — the same, for the role before this one.',
  },
]
