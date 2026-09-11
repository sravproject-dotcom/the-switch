import { useState } from 'react'
import { stories, storyFieldOrder } from '../data/seed'
import { ChevronDown, Check } from 'lucide-react'

export default function StoryBank({ progress, toggle, update }) {
  const [openId, setOpenId] = useState(stories[0].id)
  const doneCount = stories.filter((s) => progress[s.id]?.done).length

  return (
    <div className="bg-paper2/60 border border-moss-100 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ink/40">Track 4</p>
          <h2 className="font-display text-2xl text-ink">Your interview ammunition</h2>
          <p className="text-sm text-ink/50 mt-1">
            Problem → Constraints → Decision → Architecture → Implementation → Failure → Result → What I'd change
          </p>
        </div>
        <p className="font-display text-3xl text-honey-600">{doneCount}/{stories.length}</p>
      </div>

      <ul className="space-y-2">
        {stories.map((story) => {
          const done = progress[story.id]?.done
          const isOpen = openId === story.id
          return (
            <li key={story.id} className="rounded-xl border border-moss-100/70 bg-paper overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                <span
                  onClick={() => toggle(story.id)}
                  className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer ${
                    done ? 'bg-moss-600 border-moss-600' : 'border-moss-300'
                  }`}
                >
                  {done && <Check size={14} className="text-paper" strokeWidth={3} />}
                </span>
                <button
                  className="flex-1 text-left"
                  onClick={() => setOpenId(isOpen ? null : story.id)}
                >
                  <p className={`text-sm font-semibold ${done ? 'text-ink/40 line-through' : 'text-ink'}`}>
                    {story.title}
                  </p>
                  <p className="text-xs text-ink/45 mt-0.5">{story.hint}</p>
                </button>
                <ChevronDown
                  size={18}
                  className={`text-ink/40 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                  onClick={() => setOpenId(isOpen ? null : story.id)}
                />
              </div>
              {isOpen && (
                <div className="px-4 pb-4 grid sm:grid-cols-2 gap-3">
                  {storyFieldOrder.map(([field, label]) => {
                    const fieldId = `${story.id}-${field}`
                    return (
                      <div key={field}>
                        <label className="text-xs font-semibold text-ink/50 uppercase tracking-wide">
                          {label}
                        </label>
                        <textarea
                          value={progress[fieldId]?.notes || ''}
                          onChange={(e) => update(fieldId, { notes: e.target.value })}
                          rows={2}
                          className="mt-1 w-full rounded-lg border border-moss-100 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-moss-500"
                        />
                      </div>
                    )
                  })}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
