import { useState } from 'react'
import { phases } from '../data/seed'
import { phasePercent } from '../lib/derive'
import GardenPath from './GardenPath'
import WeekCard from './WeekCard'

export default function Roadmap({ progress, toggle, update }) {
  const [activeWeek, setActiveWeek] = useState(1)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {phases.map((phase) => {
          const pct = phasePercent(phase.id, progress)
          return (
            <div key={phase.id} className="bg-paper2/60 border border-moss-100 rounded-xl p-4">
              <p className="text-xs font-bold text-ink/40">Phase {phase.number}</p>
              <p className="font-display text-lg text-ink leading-tight mt-0.5">{phase.title}</p>
              <div className="mt-3 h-1.5 rounded-full bg-paper overflow-hidden">
                <div
                  className="h-full rounded-full bg-moss-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-ink/50 mt-1">{pct}% · weeks {phase.weeks.join('–')}</p>
            </div>
          )
        })}
      </div>

      <GardenPath progress={progress} activeWeek={activeWeek} onSelectWeek={setActiveWeek} />

      <WeekCard weekNumber={activeWeek} progress={progress} toggle={toggle} update={update} />
    </div>
  )
}
