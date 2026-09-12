function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

export async function onRequestPost({ request, env }) {
  if (env.CRON_SECRET && request.headers.get('authorization') !== `Bearer ${env.CRON_SECRET}`) {
    return json({ error: 'Unauthorized.' }, 401)
  }
  const receiver = env.RECEIVER_MAIL || env.RECIVER_MAIL
  if (!env.RESEND_API_KEY || !env.SENDER_MAIL || !receiver || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return json({ error: 'Daily email needs RESEND_API_KEY, SENDER_MAIL, RECEIVER_MAIL, SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY.' }, 503)
  }

  const headers = { apikey: env.SUPABASE_SERVICE_ROLE_KEY, authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` }
  const scheduleResponse = await fetch(`${env.SUPABASE_URL}/rest/v1/email_schedules?id=eq.daily-motivation&enabled=eq.true&select=time,subject,body`, { headers })
  if (!scheduleResponse.ok) return json({ error: `Could not read daily schedule (${scheduleResponse.status}).` }, 502)
  const [schedule] = await scheduleResponse.json()
  if (!schedule) return json({ sent: false, message: 'No enabled daily reminder is scheduled.' })

  const emailResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: env.SENDER_MAIL, to: [receiver], subject: schedule.subject, text: schedule.body }),
  })
  if (!emailResponse.ok) return json({ error: `Email provider failed (${emailResponse.status}).` }, 502)
  return json({ sent: true, message: `Daily reminder sent to ${receiver}.` })
}