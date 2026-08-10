// Animated sources must bypass the Next image optimiser. Per the Next docs,
// `unoptimized` is the documented handling for animated images — without it a
// GIF gets resized through the optimiser and comes out as a static first frame.
// png / webp / jpg / avif are all optimised normally.
export const isAnimated = (src: string) => /\.gif(\?|#|$)/i.test(src)
