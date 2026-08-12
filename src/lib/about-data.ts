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

export type SkillGroup = {
  group: string
  items: string[]
}

// The tools themselves are factual — they come from your own icon set and the
// tags already on your projects. Any grouping or ordering is yours to change.
export const SKILLS: SkillGroup[] = [
  { group: 'Design',    items: ['Figma', 'Photoshop', 'Illustrator'] },
  { group: 'Motion',    items: ['After Effects', 'Kinetic Type', 'Rich Media'] },
  { group: 'Build',     items: ['HTML5', 'CSS', 'JavaScript', 'React'] },
  { group: 'Delivery',  items: ['GDN', 'DV360', 'IAB Standard Sizes'] },
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
