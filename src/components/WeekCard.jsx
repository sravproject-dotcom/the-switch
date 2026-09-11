import { weeks, phases } from '../data/seed'
import { weekPercent } from '../lib/derive'
import { Check } from 'lucide-react'

export default function WeekCard({ weekNumber, progress, toggle, update }) {
  const week = weeks.find((w) => w.number === weekNumber)
  if (!week) return null
  const phase = phases.find((p) => p.id === week.phaseId)
  const pct = weekPercent(weekNumber, progress)
  const notesId = `w${weekNumber}-notes`
  const notes = progress[notesId]?.notes || ''

  return (
    <div className="bg-paper2/60 border border-moss-100 rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-moss-600/70">
            Phase {phase?.number} · {phase?.title}
          </p>
          <h2 className="font-display text-2xl text-ink mt-0.5">
            Week {week.number}: {week.title}
          </h2>
        </div>
        <div className="text-right shrink-0">
          <p className="font-display text-3xl text-honey-600">{pct}%</p>
          <p className="text-xs text-ink/50">complete</p>
        </div>
      </div>

      <ul className="space-y-2">
        {week.tasks.map((task) => {
          const done = progress[task.id]?.done
          return (
            <li key={task.id}>
              <label className="flex items-start gap-3 p-3 rounded-xl bg-paper hover:bg-white cursor-pointer border border-moss-100/70 transition-colors">
                <span
                  onClick={(e) => {
                    e.preventDefault()
                    toggle(task.id)
                  }}
                  className={`mt-0.5 shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                    done ? 'bg-moss-600 border-moss-600' : 'border-moss-300 bg-transparent'
                  }`}
                >
                  {done && <Check size={14} className="text-paper" strokeWidth={3} />}
                </span>
                <span className={`text-sm ${done ? 'text-ink/40 line-through' : 'text-ink'}`}>
                  {task.label}
                </span>
              </label>
            </li>
          )
        })}
      </ul>

      <div className="mt-4">
        <label className="text-xs font-semibold text-ink/50 uppercase tracking-wide">
          Notes for this week
        </label>
        <textarea
          value={notes}
          onChange={(e) => update(notesId, { notes: e.target.value })}
          placeholder="What clicked, what didn't, what to revisit…"
          rows={3}
          className="mt-1 w-full rounded-xl border border-moss-100 bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-moss-500"
        />
      </div>
    </div>
  )
}
