'use client'

import { usePathname } from 'next/navigation'
import SelectionOverlay from './SelectionOverlay'

// Figma-style editing tools — home page only.
//
// SelectionBox (the marquee you got from dragging across empty background) is
// deliberately not mounted: it drew a rectangle but never selected anything,
// so it was noise on every stray drag. The component is still in the tree if
// it ever gets a real behaviour to go with it.
export default function HomeOnlyLayer() {
  const pathname = usePathname()
  if (pathname !== '/') return null

  return <SelectionOverlay />
}
