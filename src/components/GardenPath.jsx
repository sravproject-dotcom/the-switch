import { weeks, phases } from '../data/seed'
import { weekPercent } from '../lib/derive'
import { stageFor } from './icons/PlantIcons'

const PHASE_COLOR = {
  moss: '#5B8A57',
  honey: '#E0954F',
  sky: '#5C8A97',
  berry: '#B75D6B',
}

export default function GardenPath({ progress, activeWeek, onSelectWeek }) {
  return (
    <div className="bg-paper2/60 border border-moss-100 rounded-2xl p-5 overflow-x-auto">
      <div className="flex items-end gap-1 min-w-[720px]">
        {weeks.map((w, i) => {
          const pct = weekPercent(w.number, progress)
          const Plant = stageFor(pct)
          const phase = phases.find((p) => p.id === w.phaseId)
          const isActive = activeWeek === w.number
          const wobble = i % 2 === 0 ? 'translate-y-0' : 'translate-y-3'
          return (
            <button
              key={w.number}
              onClick={() => onSelectWeek(w.number)}
              className={`group flex flex-col items-center flex-1 pt-2 pb-3 rounded-xl transition-all ${wobble} ${
                isActive ? 'bg-paper shadow-soft' : 'hover:bg-paper/60'
              }`}
              title={`Week ${w.number}: ${w.title}`}
            >
              <Plant size={44} />
              <span
                className="mt-1 text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center text-paper"
                style={{ backgroundColor: PHASE_COLOR[phase?.color] || '#5B8A57' }}
              >
                {w.number}
              </span>
              <span className="mt-1 text-[10px] text-ink/50 w-16 text-center leading-tight">
                {pct}%
              </span>
            </button>
          )
        })}
      </div>
      <svg width="100%" height="6" className="mt-1">
        <line x1="2%" y1="3" x2="98%" y2="3" stroke="#D9E5CC" strokeWidth="2" strokeDasharray="1 8" strokeLinecap="round" />
      </svg>
    </div>
  )
}
