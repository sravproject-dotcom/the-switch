import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { currentStreak, last14Days } from '../lib/derive'
import { Flame } from 'lucide-react'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export default function DailyTracker({ logs, saveDay }) {
  const key = todayKey()
  const existing = logs[key] || { coding: 30, debugging: 30, notes: '' }
  const [coding, setCoding] = useState(existing.coding)
  const [debugging, setDebugging] = useState(existing.debugging)
  const [notes, setNotes] = useState(existing.notes)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const e = logs[key]
    if (e) {
      setCoding(e.coding ?? 30)
      setDebugging(e.debugging ?? 30)
      setNotes(e.notes ?? '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const streak = currentStreak(logs)
  const chartData = last14Days(logs)

  function handleSave() {
    saveDay(key, { coding: Number(coding) || 0, debugging: Number(debugging) || 0, notes })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 bg-paper2/60 border border-moss-100 rounded-2xl p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-ink/40">Today</p>
          <h2 className="font-display text-2xl text-ink mt-0.5 mb-4">The 60-minute discipline</h2>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Python coding (min)" value={coding} onChange={setCoding} />
            <Field label="Debugging / implementation (min)" value={debugging} onChange={setDebugging} />
          </div>

          <label className="block mt-4 text-xs font-semibold text-ink/50 uppercase tracking-wide">
            What did you build or break today?
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-xl border border-moss-100 bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-moss-500"
            placeholder="One or two lines is plenty."
          />

          <button
            onClick={handleSave}
            className="mt-4 rounded-xl bg-honey-500 text-ink font-semibold px-5 py-2.5 hover:bg-honey-600 transition-colors"
          >
            {saved ? 'Saved ✓' : 'Log today'}
          </button>
        </div>

        <div className="sm:w-48 bg-moss-600 text-paper rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <Flame size={32} className="text-honey-400" />
          <p className="font-display text-4xl mt-1">{streak}</p>
          <p className="text-xs opacity-80 mt-1">day streak</p>
        </div>
      </div>

      <div className="bg-paper2/60 border border-moss-100 rounded-2xl p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-ink/40 mb-3">Last 14 days</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 6" stroke="#D9E5CC" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#26301F99' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#26301F99' }} axisLine={false} tickLine={false} width={30} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid #D9E5CC', fontSize: 12 }}
              formatter={(v) => [`${v} min`, 'Practice']}
            />
            <Bar dataKey="minutes" radius={[6, 6, 0, 0]} fill="#5B8A57" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs font-semibold text-ink/50 uppercase tracking-wide">{label}</label>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-moss-100 bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-moss-500"
      />
    </div>
  )
}
