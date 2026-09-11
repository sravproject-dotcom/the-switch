import { Sprout } from './icons/PlantIcons'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'daily', label: 'Daily practice' },
  { id: 'theory', label: 'Theory' },
  { id: 'systemdesign', label: 'System design' },
  { id: 'stories', label: 'Story bank' },
  { id: 'positioning', label: 'Positioning' },
]

export default function Layout({ active, onChange, syncState, children }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-moss-100/80 bg-paper/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sprout size={32} />
            <div>
              <h1 className="font-display text-xl leading-none text-ink">The Switch</h1>
              <p className="text-xs text-ink/50 leading-none mt-1">Salesforce dev → AI Engineer, one week at a time</p>
            </div>
          </div>
          <SyncBadge state={syncState} />
        </div>
        <nav className="max-w-5xl mx-auto px-6 overflow-x-auto">
          <ul className="flex gap-1 -mb-px">
            {TABS.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => onChange(tab.id)}
                  className={`whitespace-nowrap px-3.5 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
                    active === tab.id
                      ? 'border-honey-500 text-ink'
                      : 'border-transparent text-ink/50 hover:text-ink/80'
                  }`}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
      <footer className="max-w-5xl mx-auto px-6 pb-10 pt-4 text-xs text-ink/40">
        Outgrow it strategically. 🌱
      </footer>
    </div>
  )
}

function SyncBadge({ state }) {
  const map = {
    synced: { text: 'Synced to Supabase', dot: 'bg-moss-500' },
    syncing: { text: 'Syncing…', dot: 'bg-honey-500 animate-pulse' },
    offline: { text: 'Saved on this device', dot: 'bg-sky-500' },
    error: { text: 'Sync issue — saved locally', dot: 'bg-berry-500' },
  }
  const cfg = map[state] || map.offline
  return (
    <div className="flex items-center gap-2 text-xs text-ink/50 shrink-0">
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      {cfg.text}
    </div>
  )
}
