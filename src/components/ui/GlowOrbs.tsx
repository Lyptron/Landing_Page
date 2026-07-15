'use client'

// Three fixed-position blur(30-50px) layers with infinite CSS animations
// forced the compositor to redraw the entire viewport every scroll frame.
// On integrated GPUs that alone was enough to break 60fps scroll. Pulled
// entirely — they were opacity 0.08 on mobile (invisible) and the desktop
// contribution wasn't worth the cost.
export default function GlowOrbs() {
  return null
}
