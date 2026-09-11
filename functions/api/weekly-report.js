function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

export async function onRequestPost({ request, env }) {
  if (!env.SENDER_MAIL || !env.MAIL_PASSWORD || !env.RECIVER_MAIL) {
    return json({ error: 'SENDER_MAIL, MAIL_PASSWORD, and RECIVER_MAIL must be configured.' }, 503)
  }

  const body = await request.json()
  const report = body.report || {}
  const subject = `The Switch weekly report: ${report.overallPercent || 0}% complete`
  const text = [
    `Overall progress: ${report.overallPercent || 0}%`,
    `Practice streak: ${report.streak || 0} days`,
    `Minutes this week: ${report.weekMinutes || 0}`,
    '',
    report.nextStep ? `Next step: ${report.nextStep}` : 'Keep the next task small and concrete.',
  ].join('\n')

  // SMTP delivery is intentionally isolated behind this endpoint. Configure a
  // mail provider webhook/worker for production; credentials never enter the browser.
  return json({ queued: false, subject, text, recipient: env.RECIVER_MAIL, message: 'Report payload prepared. Connect this endpoint to your SMTP provider.' }, 501)
}
