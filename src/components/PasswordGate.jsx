import { useState } from 'react'
import { Sprout } from './icons/PlantIcons'

// SHA-256 of the access phrase. The app never stores the phrase itself,
// only this hash — but note the honest caveat in the README: this is a
// client-side gate on a static site, suitable for keeping casual visitors
// out, not a substitute for real authentication. See README "About the lock".
const PASSPHRASE_HASH =
  '12a52a1b4232f255691ea33ea27fab89d3290e18a4e301310d295819d1ce7714'

const SESSION_KEY = 'switch_unlocked_v1'

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function isUnlocked() {
  return sessionStorage.getItem(SESSION_KEY) === 'true'
}

export default function PasswordGate({ onUnlock }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setChecking(true)
    const hash = await sha256Hex(value.trim())
    setChecking(false)
    if (hash === PASSPHRASE_HASH) {
      sessionStorage.setItem(SESSION_KEY, 'true')
      onUnlock()
    } else {
      setError(true)
      setValue('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-paper2/70 border border-moss-100 rounded-2xl p-8 shadow-lift"
      >
        <div className="flex justify-center mb-4">
          <Sprout size={56} />
        </div>
        <h1 className="font-display text-2xl text-center text-ink mb-1">The Switch</h1>
        <p className="text-center text-sm text-ink/60 mb-6">
          A private field notebook. Enter the passphrase to get in.
        </p>
        <input
          autoFocus
          type="password"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError(false)
          }}
          placeholder="Passphrase"
          className={`w-full rounded-xl border px-4 py-3 bg-paper text-ink font-body outline-none transition-colors ${
            error ? 'border-berry-500' : 'border-moss-100 focus:border-moss-500'
          }`}
        />
        {error && (
          <p className="text-berry-600 text-sm mt-2">That's not it — try again.</p>
        )}
        <button
          type="submit"
          disabled={checking || !value}
          className="mt-5 w-full rounded-xl bg-moss-600 text-paper font-body font-semibold py-3 hover:bg-moss-700 transition-colors disabled:opacity-50"
        >
          {checking ? 'Checking…' : 'Unlock'}
        </button>
      </form>
    </div>
  )
}
