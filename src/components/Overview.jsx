import { weeks, phases } from '../data/seed'
import { overallPercent, phasePercent, currentStreak } from '../lib/derive'
import { stageFor } from './icons/PlantIcons'
import { Flame, ArrowRight } from 'lucide-react'

const PHASE_COLOR = { moss: '#5B8A57', honey: '#E0954F', sky: '#5C8A97', berry: '#B75D6B' }

function findNextUp(progress) {
  for (const w of weeks) {
    const next = w.tasks.find((t) => !progress[t.id]?.done)
    if (next) return { week: w, task: next }
  }
  return null
}

export default function Overview({ progress, logs, onNavigate }) {
  const pct = overallPercent(progress)
  const streak = currentStreak(logs)
  const nextUp = findNextUp(progress)
  const Plant = stageFor(pct)

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="sm:col-span-1 bg-paper2/60 border border-moss-100 rounded-2xl p-6 flex flex-col items-center text-center">
          <Plant size={64} />
          <p className="font-display text-4xl text-ink mt-2">{pct}%</p>
          <p className="text-xs text-ink/50 mt-1">of the 12-week plan</p>
        </div>

        <div className="sm:col-span-1 bg-moss-600 text-paper rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <Flame size={30} className="text-honey-400" />
          <p className="font-display text-4xl mt-1">{streak}</p>
          <p className="text-xs opacity-80 mt-1">day practice streak</p>
        </div>

        <div className="sm:col-span-1 bg-paper2/60 border border-moss-100 rounded-2xl p-6">
          {nextUp ? (
            <>
              <p className="text-xs font-bold uppercase tracking-wide text-ink/40">Next up</p>
              <p className="text-sm font-semibold text-ink mt-1">Week {nextUp.week.number} — {nextUp.week.title}</p>
              <p className="text-sm text-ink/60 mt-1">{nextUp.task.label}</p>
              <button
                onClick={() => onNavigate('roadmap')}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-honey-600 hover:text-honey-500"
              >
                Go do it <ArrowRight size={14} />
              </button>
            </>
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-wide text-ink/40">Status</p>
              <p className="text-sm font-semibold text-ink mt-1">Every week is checked off. 🎉</p>
              <p className="text-sm text-ink/60 mt-1">Time to point this whole thing at applications.</p>
            </>
          )}
        </div>
      </div>

      <div className="bg-paper2/60 border border-moss-100 rounded-2xl p-6">
        <h3 className="font-display text-lg text-ink mb-4">By phase</h3>
        <div className="space-y-3">
          {phases.map((phase) => {
            const p = phasePercent(phase.id, progress)
            return (
              <div key={phase.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-ink">
                    {phase.number}. {phase.title}
                  </span>
                  <span className="text-ink/50">{p}%</span>
                </div>
                <div className="h-2 rounded-full bg-paper overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${p}%`, backgroundColor: PHASE_COLOR[phase.color] }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <NavCard label="Theory" desc="Explain it cold" onClick={() => onNavigate('theory')} />
        <NavCard label="System design" desc="Practice the six prompts" onClick={() => onNavigate('systemdesign')} />
        <NavCard label="Story bank" desc="Load your 10 stories" onClick={() => onNavigate('stories')} />
      </div>
    </div>
  )
}

function NavCard({ label, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-paper2/60 border border-moss-100 rounded-xl p-4 hover:bg-paper2 transition-colors"
    >
      <p className="font-display text-lg text-ink">{label}</p>
      <p className="text-sm text-ink/50 mt-0.5">{desc}</p>
    </button>
  )
}
