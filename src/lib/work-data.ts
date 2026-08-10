// A media entry is usually just a path. Use the object form when a video needs
// a poster frame — iOS Low Power Mode blocks autoplay, and the poster is what
// gets shown in that case.
//   'shot.webp'
//   'demo.mp4'
//   { src: 'demo.mp4', poster: 'demo-poster.webp' }
export type Media = string | { src: string; poster?: string }

// One narrative section in the detail rail. These are the tabs — they carry the
// story, not the service taxonomy (that's what `tags` is for).
export type Frame = {
  name: string
  body?: string
  images?: Media[]   // images, gifs or video — dispatched on file extension
}

export type Project = {
  id: string
  title: string
  year: string
  tags: string[]      // category pills, shown at the foot of the detail rail
  accent: string      // card top-strip / thumbnail accent colour
  thumbnail?: Media   // optional preview image or video for the work-list card
  media?: Media[]     // the scrolling column on the detail page
  frames: Frame[]     // rail tabs: the challenge / approach / outcome
}

// ─────────────────────────────────────────────────────────────────────────
// PLACEHOLDER COPY — replace per project.
// Each section answers something the category pills cannot. Keep them
// specific: the constraint you were under, the decision you made and why,
// what actually changed as a result.
// ─────────────────────────────────────────────────────────────────────────
const TODO_CHALLENGE =
  'Placeholder — what made this one hard. The constraint you were working ' +
  'against, the thing that could have gone wrong, or the tension between what ' +
  'was asked for and what the format actually allowed. Two or three sentences.'

const TODO_APPROACH =
  'Placeholder — the decision you made, and why that one over the obvious ' +
  'alternative. This is the section that shows how you think, so it should ' +
  'name a real trade-off rather than describe the deliverables.'

const TODO_OUTCOME =
  'Placeholder — what actually changed. Numbers if you have them: sizes ' +
  'shipped, turnaround, engagement, how long it stayed in market. A concrete ' +
  'result beats an adjective every time.'

const narrative = (): Frame[] => [
  { name: 'The Challenge', body: TODO_CHALLENGE },
  { name: 'Approach',      body: TODO_APPROACH },
  { name: 'Outcome',       body: TODO_OUTCOME },
]

export const PROJECTS: Project[] = [
  {
    id: 'gomobile',
    title: 'Gomobile Indonesia',
    year: '2024–Now',
    tags: ['Digital Marketing', 'HTML5', 'Graphic Design'],
    accent: '#5CFF85',
    frames: narrative(),
  },
  {
    id: 'acaii',
    title: 'Acaii Tea & Dessert',
    year: '2024',
    tags: ['Motion Design', 'E-commerce', 'Graphic Design'],
    accent: '#5CFF85',
    frames: narrative(),
  },
  {
    id: 'banner-ads',
    title: 'Banner Advertising Design',
    year: '2024–Now',
    tags: ['Static', 'Motion', 'HTML5'],
    accent: '#5CFF85',
    frames: narrative(),
  },
  {
    id: 'ui-gallery',
    title: 'UI Design Gallery',
    year: '2022–2025',
    tags: ['UI/UX', 'HTML+JS', 'UI Design'],
    accent: '#5CFF85',
    frames: narrative(),
  },
]
