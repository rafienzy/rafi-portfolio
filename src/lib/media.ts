import type { Media } from './work-data'

// Animated sources must bypass the Next image optimiser. Per the Next docs,
// `unoptimized` is the documented handling for animated images — without it a
// GIF gets resized through the optimiser and comes out as a static first frame.
// png / webp / jpg / avif are all optimised normally.
export const isAnimated = (src: string) => /\.gif(\?|#|$)/i.test(src)

// Video is rendered through a <video> element rather than next/image.
export const isVideo = (src: string) => /\.(mp4|webm|mov)(\?|#|$)/i.test(src)

// Media entries accept a bare path for the common case, or an object when a
// poster frame is needed. This normalises both into one shape.
export const toMedia = (m: Media): { src: string; poster?: string } =>
  typeof m === 'string' ? { src: m } : m
