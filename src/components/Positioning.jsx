import { positioning } from '../data/seed'
import { ArrowRight } from 'lucide-react'

export default function Positioning() {
  return (
    <div className="space-y-6">
      <div className="bg-moss-600 text-paper rounded-2xl p-6">
        <p className="text-xs font-bold uppercase tracking-wide opacity-70">Lead with this</p>
        <p className="font-display text-xl sm:text-2xl mt-2">{positioning.headline}</p>
        <p className="text-sm opacity-70 mt-3">Not: {positioning.avoid}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-paper2/60 border border-moss-100 rounded-2xl p-6">
          <h3 className="font-display text-lg text-ink mb-3">Target titles</h3>
          <div className="flex flex-wrap gap-2">
            {positioning.titles.map((t) => (
              <span key={t} className="text-xs font-semibold bg-paper border border-moss-100 rounded-full px-3 py-1.5 text-ink/70">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-paper2/60 border border-moss-100 rounded-2xl p-6">
          <h3 className="font-display text-lg text-ink mb-3">The one stack — go deep, not wide</h3>
          <div className="flex flex-wrap gap-2">
            {positioning.stack.map((t) => (
              <span key={t} className="text-xs font-semibold bg-honey-200/70 border border-honey-400/40 rounded-full px-3 py-1.5 text-ink/80">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-paper2/60 border border-moss-100 rounded-2xl p-6">
        <h3 className="font-display text-lg text-ink mb-4">Resume: outcomes, not buzzwords</h3>
        <div className="space-y-4">
          {positioning.resumeExamples.map((ex, i) => (
            <div key={i} className="grid sm:grid-cols-[1fr_auto_1fr] gap-3 items-center">
              <p className="text-sm text-ink/40 line-through bg-paper rounded-lg p-3 border border-moss-100/50">
                {ex.weak}
              </p>
              <ArrowRight size={18} className="text-honey-500 mx-auto hidden sm:block" />
              <p className="text-sm text-ink font-medium bg-paper rounded-lg p-3 border border-moss-100">
                {ex.strong}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-paper2/60 border border-moss-100 rounded-2xl p-6">
        <h3 className="font-display text-lg text-ink mb-4">The switch, on a timeline</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {positioning.timeline.map((m) => (
            <div key={m.label} className="bg-paper rounded-xl border border-moss-100/70 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-moss-600">{m.label}</p>
              <p className="text-sm text-ink mt-1">{m.detail}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-ink/50 mt-4">
          Don't resign first. Don't announce the search. Leave when there's a better offer — not before.
        </p>
      </div>
    </div>
  )
}
