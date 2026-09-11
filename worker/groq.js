// Round-robins across however many GROQ_API_KEY_1, GROQ_API_KEY_2, ...
// secrets are bound to the Worker, and fails over to the next key if one
// is rate-limited or erroring. No SDK — the Groq API is OpenAI-compatible,
// so this is a plain fetch() against the chat/completions endpoint, which
// keeps the Worker bundle small and avoids any Node-only SDK internals.

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const KEY_PATTERN = /^GROQ_API_KEY_(\d+)$/

// Module-scope counter. Persists for the lifetime of the isolate (i.e.
// across requests handled by the same Worker instance), which is enough
// to get a real round-robin distribution without needing external state.
let rrCursor = 0

export function listGroqKeys(env) {
  const found = []
  for (const key of Object.keys(env)) {
    const m = key.match(KEY_PATTERN)
    if (m && env[key]) {
      found.push({ order: Number(m[1]), value: env[key] })
    }
  }
  // Fall back to a single unsuffixed GROQ_API_KEY if that's all that's set.
  if (found.length === 0 && env.GROQ_API_KEY) {
    found.push({ order: 0, value: env.GROQ_API_KEY })
  }
  found.sort((a, b) => a.order - b.order)
  return found.map((f) => f.value)
}

/**
 * Calls the Groq chat/completions endpoint, rotating the starting key on
 * every call and retrying with the next key on rate limits (429) or server
 * errors (5xx). Throws only if every configured key fails.
 */
export async function callGroqChat(env, body) {
  const keys = listGroqKeys(env)
  if (keys.length === 0) {
    throw new Error(
      'No Groq API key configured. Set GROQ_API_KEY_1 (and optionally _2, _3, ...) as Worker secrets.'
    )
  }

  const startIndex = rrCursor % keys.length
  rrCursor = (rrCursor + 1) % keys.length

  let lastError
  for (let i = 0; i < keys.length; i++) {
    const key = keys[(startIndex + i) % keys.length]
    try {
      const resp = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify(body),
      })

      if (resp.ok) {
        return await resp.json()
      }

      // Retry on rate limit or server-side errors; anything else (bad
      // request, auth, etc.) is a real error worth surfacing immediately.
      if (resp.status === 429 || resp.status >= 500) {
        lastError = new Error(`Groq key #${(startIndex + i) % keys.length + 1} failed: ${resp.status} ${await resp.text()}`)
        continue
      }

      const errText = await resp.text()
      throw new Error(`Groq API error ${resp.status}: ${errText}`)
    } catch (err) {
      lastError = err
      // Network-level failure — also worth trying the next key.
      continue
    }
  }

  throw lastError || new Error('All Groq API keys failed.')
}
