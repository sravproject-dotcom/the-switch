import { useEffect, useRef, useState } from 'react'
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react'
import { getAuthHash } from './PasswordGate'

const GREETING = {
  role: 'assistant',
  content:
    "Hi — I can see and update everything in your tracker: check off tasks, log practice, edit notes, or reset and restart the program. What do you need?",
}

export default function AIAssistant({ onDataChanged }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([GREETING])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    if (!open) return
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open, sending])

  async function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    const nextMessages = [...messages, { role: 'user', content: text }]
    setMessages(nextMessages)
    setInput('')
    setSending(true)
    setError('')

    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Switch-Auth': getAuthHash(),
        },
        body: JSON.stringify({
          messages: nextMessages
            .filter((m) => m.role === 'user' || m.role === 'assistant')
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}))
        throw new Error(body.error || `Request failed (${resp.status})`)
      }

      const data = await resp.json()
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply || "(no reply)" }])
      if (data.dataChanged) {
        onDataChanged?.()
      }
    } catch (err) {
      setError(err.message || 'Something went wrong talking to the assistant.')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-30 w-14 h-14 rounded-full bg-moss-600 text-paper shadow-lift flex items-center justify-center hover:bg-moss-700 transition-colors"
        aria-label={open ? 'Close assistant' : 'Open assistant'}
      >
        {open ? <X size={24} /> : <Sparkles size={24} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-30 w-[min(92vw,380px)] h-[min(70vh,540px)] bg-paper border border-moss-100 rounded-2xl shadow-lift flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-moss-100 bg-moss-600 text-paper flex items-center gap-2">
            <Sparkles size={18} />
            <div>
              <p className="text-sm font-semibold leading-none">Switch Assistant</p>
              <p className="text-xs opacity-75 leading-none mt-1">Can read and update your progress</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'ml-auto bg-honey-500 text-ink'
                    : 'bg-paper2 border border-moss-100 text-ink'
                }`}
              >
                {m.content}
              </div>
            ))}
            {sending && (
              <div className="flex items-center gap-2 text-xs text-ink/50">
                <Loader2 size={14} className="animate-spin" />
                Thinking…
              </div>
            )}
            {error && <p className="text-xs text-berry-600">{error}</p>}
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-moss-100 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. mark week 2 task 1 done"
              className="flex-1 rounded-xl border border-moss-100 bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-moss-500"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="shrink-0 w-10 h-10 rounded-xl bg-moss-600 text-paper flex items-center justify-center hover:bg-moss-700 transition-colors disabled:opacity-50"
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
