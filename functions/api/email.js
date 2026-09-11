function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

export async function onRequestPost({ request, env }) {
  const receiver = env.RECEIVER_MAIL || env.RECIVER_MAIL
  if (!env.RESEND_API_KEY || !env.SENDER_MAIL || !receiver) {
    return json({ error: 'Email is not configured. Add RESEND_API_KEY, SENDER_MAIL, and RECEIVER_MAIL as server secrets.' }, 503)
  }

  const body = await request.json()
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: env.SENDER_MAIL,
      to: [receiver],
      subject: String(body.subject || 'The Switch reminder').slice(0, 180),
      text: String(body.text || '').slice(0, 10000),
    }),
  })

  if (!response.ok) return json({ error: `Email provider failed (${response.status}).` }, 502)
  return json({ sent: true, message: `Reminder sent to ${receiver}.` })
}