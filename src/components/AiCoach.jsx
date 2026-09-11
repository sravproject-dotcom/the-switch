import { useState } from 'react'
import { Bot, Send, Sparkles, X } from 'lucide-react'

export default function AiCoach({ progress, logs, planStart, onAction }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [busy, setBusy] = useState(false)

  async function ask(event) {
    event.preventDefault()
    const trimmed = message.trim()
    if (!trimmed || busy) return
    setMessage('')
    setMessages((current) => [...current, { role: 'user', text: trimmed }])
    setBusy(true)
    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: trimmed, context: { progress, dailyLogs: logs, planStart } }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Assistant unavailable')
      setMessages((current) => [...current, { role: 'assistant', text: data.reply }])
      if (data.action) onAction(data.action)
    } catch (error) {
      setMessages((current) => [...current, { role: 'assistant', text: error.message }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="fixed bottom-5 right-5 z-20 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-bold text-paper shadow-lg hover:bg-moss-700" title="Open AI coach">
        <Sparkles size={16} /> AI coach
      </button>
      {open && (
        <div className="fixed bottom-5 right-5 z-30 flex h-[min(620px,calc(100vh-40px))] w-[min(390px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-moss-100 bg-paper shadow-2xl">
          <div className="flex items-center justify-between bg-ink px-4 py-3 text-paper">
            <div className="flex items-center gap-2"><Bot size={18} /><span className="font-semibold">The Switch coach</span></div>
            <button onClick={() => setOpen(false)} title="Close assistant" className="rounded p-1 hover:bg-paper/10"><X size={18} /></button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {!messages.length && <p className="text-sm leading-6 text-ink/60">Ask about your progress, your next best task, or tell me to reset and start from a new date.</p>}
            {messages.map((item, index) => <div key={index} className={`rounded-xl px-3 py-2 text-sm leading-6 ${item.role === 'user' ? 'ml-8 bg-moss-100 text-ink' : 'mr-4 bg-paper2 text-ink/80'}`}>{item.text}</div>)}
            {busy && <div className="text-sm text-ink/50">Thinking...</div>}
          </div>
          <form onSubmit={ask} className="flex gap-2 border-t border-moss-100 p-3">
            <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask your coach..." className="min-w-0 flex-1 rounded-lg border border-moss-100 bg-paper2 px-3 py-2 text-sm" />
            <button disabled={busy} title="Send message" className="rounded-lg bg-honey-500 px-3 text-ink disabled:opacity-50"><Send size={16} /></button>
          </form>
        </div>
      )}
    </>
  )
}
