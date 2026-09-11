const MODEL = 'openai/gpt-oss-120b'

function apiKeys(env) {
  return Object.entries(env)
    .filter(([name, value]) => /^(AI|GROQ)_API_KEY_\d+$/.test(name) && value)
    .sort(([a], [b]) => Number(a.split('_').pop()) - Number(b.split('_').pop()))
    .map(([, value]) => value)
}

function nextKeyIndex(count) {
  const current = Number.parseInt(globalThis.__switchKeyIndex || '0', 10)
  globalThis.__switchKeyIndex = String((current + 1) % count)
  return current % count
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

export async function onRequestPost({ request, env }) {
  const keys = apiKeys(env)
  if (!keys.length) return json({ error: 'No AI_API_KEY_1 or GROQ_API_KEY_1 variables are configured on the server.' }, 503)

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Request body must be JSON.' }, 400)
  }

  const system = `You are the practical AI coach and operations agent inside The Switch, a private AI-engineer learning tracker.
You can inspect progress, daily logs, roadmap, and the last conversation turns. Explain what this app is when asked: it is a private 12-week AI Engineer transition tracker with roadmap tasks, theory, system design, stories, daily practice, and positioning notes.
Be specific, honest, concise, and use the actual supplied task labels. You can make safe calls through one action per response.
Return ONLY valid JSON: {"reply":"string","action":null|{"type":"reset_all"}|{"type":"mark_task","itemId":"string","done":true}|{"type":"set_plan_start","date":"YYYY-MM-DD"}|{"type":"log_day","date":"YYYY-MM-DD","coding":0,"debugging":0,"notes":""}|{"type":"navigate","tab":"overview|roadmap|daily|theory|systemdesign|stories|positioning"}}
Only use an action when the user clearly asks for it. Never invent item IDs. reset_all deletes all checklist progress and daily logs, so only emit it for an explicit reset request. Use log_day when the user reports completed practice. If the user says “next week”, calculate the next Monday from today and use set_plan_start.`

  const history = Array.isArray(body.history)
    ? body.history
        .filter((item) => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string')
        .slice(-15)
    : []

  const user = JSON.stringify({
    today: new Date().toISOString().slice(0, 10),
    message: String(body.message || '').slice(0, 4000),
    progress: body.context?.progress || {},
    dailyLogs: body.context?.dailyLogs || {},
    planStart: body.context?.planStart || null,
    roadmap: body.context?.roadmap || [],
  })

  const messages = [{ role: 'system', content: system }, ...history, { role: 'user', content: user }]
  let result
  let lastError = 'Groq request failed.'
  for (let attempt = 0; attempt < keys.length; attempt++) {
    const key = keys[nextKeyIndex(keys.length)]
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.35,
        max_completion_tokens: 1200,
        response_format: { type: 'json_object' },
      }),
    })
    if (response.ok) {
      result = await response.json()
      break
    }
    const errorText = await response.text()
    lastError = `Groq request failed (${response.status})${errorText ? `: ${errorText.slice(0, 180)}` : '.'}`
  }
  if (!result) return json({ error: lastError }, 502)
  const content = result.choices?.[0]?.message?.content
  if (!content) return json({ error: 'The AI returned an empty response.' }, 502)

  try {
    const parsed = JSON.parse(content)
    return json({ reply: String(parsed.reply || ''), action: parsed.action || null })
  } catch {
    return json({ reply: content, action: null })
  }
}
