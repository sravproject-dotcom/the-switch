const MODEL = 'openai/gpt-oss-120b'

function apiKeys(env) {
  return Object.entries(env)
    .filter(([name, value]) => /^AI_API_KEY_\d+$/.test(name) && value)
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
  if (!keys.length) return json({ error: 'No AI_API_KEY_1, AI_API_KEY_2, ... variables are configured.' }, 503)

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Request body must be JSON.' }, 400)
  }

  const system = `You are the practical AI coach and operations agent inside The Switch, a private AI-engineer learning tracker.
You can inspect the supplied progress and daily logs. Be specific, honest, and concise. Help the learner decide what to do next and monitor consistency.
Return ONLY valid JSON with this shape: {"reply":"string","action":null|{"type":"reset_all"}|{"type":"mark_task","itemId":"string","done":true}|{"type":"set_plan_start","date":"YYYY-MM-DD"}}
Only request an action when the user clearly asks for it. Never invent item IDs. A reset_all action deletes all checklist progress and daily logs, so only emit it for an explicit reset request.
If the user says “next week”, calculate the next Monday from the supplied today date and use set_plan_start.`

  const user = JSON.stringify({
    today: new Date().toISOString().slice(0, 10),
    message: String(body.message || '').slice(0, 4000),
    progress: body.context?.progress || {},
    dailyLogs: body.context?.dailyLogs || {},
    planStart: body.context?.planStart || null,
  })

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${keys[nextKeyIndex(keys.length)]}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      temperature: 0.35,
      max_completion_tokens: 1200,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) return json({ error: `Groq request failed (${response.status}).` }, 502)
  const result = await response.json()
  const content = result.choices?.[0]?.message?.content
  if (!content) return json({ error: 'The AI returned an empty response.' }, 502)

  try {
    const parsed = JSON.parse(content)
    return json({ reply: String(parsed.reply || ''), action: parsed.action || null })
  } catch {
    return json({ reply: content, action: null })
  }
}
