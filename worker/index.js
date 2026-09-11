import { runAgent } from './agent.js'
import { sendWeeklyReport } from './email.js'

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' }

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS })
}

// Soft auth gate: the frontend hashes the same passphrase PasswordGate.jsx
// already checks (see PasswordGate's PASSPHRASE_HASH) and sends it as a
// header. This is the same "keep it off the beaten path" threat model the
// README already documents for the passphrase screen — it stops the API
// from being wide open to anyone who finds the URL, not a real auth system.
function isAuthorized(request, env) {
  if (!env.APP_PASSPHRASE_HASH) return true // not configured -> gate disabled
  const provided = request.headers.get('X-Switch-Auth') || ''
  return provided.length > 0 && provided === env.APP_PASSPHRASE_HASH
}

async function handleChat(request, env) {
  if (!isAuthorized(request, env)) return json({ error: 'Unauthorized' }, 401)

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const history = Array.isArray(body.messages) ? body.messages : []
  if (history.length === 0) return json({ error: 'messages[] is required' }, 400)
  // Only forward the fields Groq expects — never trust arbitrary extra keys from the client.
  const cleanHistory = history
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-20) // keep the request small; the agent doesn't need unbounded history

  try {
    const result = await runAgent(env, cleanHistory)
    return json(result)
  } catch (err) {
    console.error('Agent error:', err)
    return json({ error: err.message || 'Agent failed' }, 500)
  }
}

async function handleTestWeeklyReport(request, env) {
  if (!isAuthorized(request, env)) return json({ error: 'Unauthorized' }, 401)
  try {
    const result = await sendWeeklyReport(env)
    return json(result)
  } catch (err) {
    console.error('Weekly report error:', err)
    return json({ error: err.message || 'Failed to send report' }, 500)
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    if (url.pathname === '/api/chat' && request.method === 'POST') {
      return handleChat(request, env)
    }
    if (url.pathname === '/api/test-weekly-report' && request.method === 'POST') {
      return handleTestWeeklyReport(request, env)
    }
    if (url.pathname === '/api/health') {
      return json({ ok: true })
    }

    // Everything else is the static site (the Vite build in dist/), served
    // through the [assets] binding declared in wrangler.toml.
    return env.ASSETS.fetch(request)
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(
      sendWeeklyReport(env).catch((err) => {
        console.error('Scheduled weekly report failed:', err)
      })
    )
  },
}
