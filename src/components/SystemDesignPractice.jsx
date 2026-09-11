import { systemDesignQuestions, sysDesignFramework } from '../data/seed'
import { sysDesignPercent } from '../lib/derive'
import { Check } from 'lucide-react'

export default function SystemDesignPractice({ progress, toggle, update }) {
  const pct = sysDesignPercent(progress)
  return (
    <div className="space-y-6">
      <div className="bg-moss-600 text-paper rounded-2xl p-6">
        <p className="text-xs font-bold uppercase tracking-wide opacity-70">Start here, every time</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {sysDesignFramework.map((step, i) => (
            <span key={step} className="flex items-center gap-2 text-sm">
              <span className="bg-paper/15 rounded-full px-3 py-1">{step}</span>
              {i < sysDesignFramework.length - 1 && <span className="opacity-40">→</span>}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-paper2/60 border border-moss-100 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ink/40">Track 3</p>
            <h2 className="font-display text-2xl text-ink">Practice prompts</h2>
          </div>
          <p className="font-display text-3xl text-honey-600">{pct}%</p>
        </div>
        <ul className="space-y-3">
          {systemDesignQuestions.map((q) => {
            const done = progress[q.id]?.done
            const notes = progress[`${q.id}-notes`]?.notes || ''
            return (
              <li key={q.id} className="rounded-xl border border-moss-100/70 bg-paper p-4">
                <div className="flex items-start gap-3">
                  <span
                    onClick={() => toggle(q.id)}
                    className={`mt-0.5 shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer ${
                      done ? 'bg-moss-600 border-moss-600' : 'border-moss-300'
                    }`}
                  >
                    {done && <Check size={14} className="text-paper" strokeWidth={3} />}
                  </span>
                  <p className={`text-sm font-semibold ${done ? 'text-ink/40 line-through' : 'text-ink'}`}>
                    {q.question}
                  </p>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => update(`${q.id}-notes`, { notes: e.target.value })}
                  placeholder="Sketch your architecture, or note where you got stuck…"
                  rows={2}
                  className="mt-2 w-full rounded-lg border border-moss-100 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-moss-500"
                />
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
