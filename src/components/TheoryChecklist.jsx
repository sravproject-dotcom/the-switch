import { theoryTopics } from '../data/seed'
import { theoryPercent } from '../lib/derive'
import { Check } from 'lucide-react'

export default function TheoryChecklist({ progress, toggle }) {
  const pct = theoryPercent(progress)
  return (
    <div className="bg-paper2/60 border border-moss-100 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ink/40">Track 2</p>
          <h2 className="font-display text-2xl text-ink">Can you explain it without notes?</h2>
        </div>
        <p className="font-display text-3xl text-honey-600">{pct}%</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        {theoryTopics.map((t) => {
          const done = progress[t.id]?.done
          return (
            <label
              key={t.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-paper border border-moss-100/70 cursor-pointer hover:bg-white transition-colors"
            >
              <span
                onClick={(e) => {
                  e.preventDefault()
                  toggle(t.id)
                }}
                className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                  done ? 'bg-moss-600 border-moss-600' : 'border-moss-300'
                }`}
              >
                {done && <Check size={14} className="text-paper" strokeWidth={3} />}
              </span>
              <span className={`text-sm ${done ? 'text-ink/40 line-through' : 'text-ink'}`}>{t.topic}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
