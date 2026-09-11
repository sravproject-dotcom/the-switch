// Four growth stages, hand-drawn as simple SVG paths, used to represent
// a week's completion percentage without resorting to a generic progress bar.

const stem = '#3F6B4F'
const leaf = '#5B8A57'
const leafLight = '#9DBB88'
const soil = '#26301F'
const bloomPetal = '#E0954F'
const bloomCenter = '#EAB25C'

export function Seed({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <ellipse cx="20" cy="33" rx="14" ry="3.5" fill={soil} opacity="0.15" />
      <path d="M20 20c4 3 4 9 0 12-4-3-4-9 0-12z" fill={leafLight} />
      <circle cx="20" cy="26" r="1.4" fill={stem} />
    </svg>
  )
}

export function Sprout({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <ellipse cx="20" cy="33" rx="14" ry="3.5" fill={soil} opacity="0.15" />
      <path d="M20 33V20" stroke={stem} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M20 24c-3-5-9-5-11-3 1 5 7 6 11 3z" fill={leaf} />
      <path d="M20 21c2-4 7-4 9-2-1 4-6 5-9 2z" fill={leafLight} />
    </svg>
  )
}

export function Sapling({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <ellipse cx="20" cy="33" rx="14" ry="3.5" fill={soil} opacity="0.15" />
      <path d="M20 33V14" stroke={stem} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M20 24c-4-6-11-5-13-2 1 6 9 7 13 2z" fill={leaf} />
      <path d="M20 20c3-6 10-5 12-2-1 6-8 7-12 2z" fill={leafLight} />
      <path d="M20 15c-2-4-7-4-9-1.5 1 4 6 4.5 9 1.5z" fill={leaf} />
    </svg>
  )
}

export function Bloom({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <ellipse cx="20" cy="33" rx="15" ry="3.5" fill={soil} opacity="0.18" />
      <path d="M20 33V16" stroke={stem} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M20 25c-4-6-12-5-14-1 1 6 10 7 14 1z" fill={leaf} />
      <path d="M20 22c3-6 11-5 13-1-1 6-9 7-13 1z" fill={leafLight} />
      <g>
        <circle cx="20" cy="10" r="3.6" fill={bloomCenter} />
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <ellipse
            key={deg}
            cx={20 + 6 * Math.cos((deg * Math.PI) / 180)}
            cy={10 + 6 * Math.sin((deg * Math.PI) / 180)}
            rx="3.4"
            ry="2.1"
            fill={bloomPetal}
            transform={`rotate(${deg} ${20 + 6 * Math.cos((deg * Math.PI) / 180)} ${10 + 6 * Math.sin((deg * Math.PI) / 180)})`}
          />
        ))}
      </g>
    </svg>
  )
}

export function stageFor(pct) {
  if (pct >= 100) return Bloom
  if (pct >= 50) return Sapling
  if (pct > 0) return Sprout
  return Seed
}
