function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

export async function onRequestPost({ request, env }) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return json({ error: 'Scheduling needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY server secrets.' }, 503)
  }
  const body = await request.json()
  if (!/^\d{2}:\d{2}$/.test(body.time || '') || Number(body.time.slice(0, 2)) > 23 || Number(body.time.slice(3)) > 59) {
    return json({ error: 'Use a time in HH:mm format.' }, 400)
  }

  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/email_schedules`, {
    method: 'POST',
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'content-type': 'application/json',
      prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify({ id: 'daily-motivation', time: body.time, subject: body.subject || 'Your daily Switch reminder', body: body.body || 'Make one small step on your next task today.', enabled: true, updated_at: new Date().toISOString() }),
  })
  if (!response.ok) return json({ error: `Could not save schedule (${response.status}). Run the updated schema first.` }, 502)
  return json({ scheduled: true, message: `Daily reminder scheduled for ${body.time}.` })
}