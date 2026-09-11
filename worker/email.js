import { WorkerMailer } from 'worker-mailer'
import { getFullStatus } from './status.js'

function renderText(status) {
  const lines = []
  lines.push(`The Switch — weekly report (${status.today})`)
  lines.push('')
  lines.push(`Overall: ${status.overall_percent}%  |  Theory: ${status.theory_percent}%  |  System design: ${status.system_design_percent}%  |  Stories: ${status.stories_done}/${status.stories_total}`)
  lines.push(`Practice streak: ${status.streak_days} day(s)`)
  if (status.program_start_date) {
    lines.push(`Program start date: ${status.program_start_date} (calendar week ${status.calendar_week_number ?? '—'})`)
  }
  lines.push('')
  lines.push('By week:')
  for (const w of status.weeks) {
    lines.push(`  Week ${w.week_number} — ${w.title}: ${w.percent}% (${w.tasks_done}/${w.tasks_total})`)
  }
  lines.push('')
  lines.push('Last 14 days of practice (minutes):')
  lines.push('  ' + status.last_14_days.map((d) => `${d.date}: ${d.minutes}`).join('  '))
  return lines.join('\n')
}

function renderHtml(status) {
  const weekRows = status.weeks
    .map(
      (w) => `<tr>
        <td style="padding:4px 10px 4px 0;">Week ${w.week_number} — ${escapeHtml(w.title)}</td>
        <td style="padding:4px 0; text-align:right; font-weight:600;">${w.percent}%</td>
        <td style="padding:4px 0 4px 10px; color:#666;">${w.tasks_done}/${w.tasks_total}</td>
      </tr>`
    )
    .join('')

  const startLine = status.program_start_date
    ? `<p style="margin:4px 0; color:#444;">Program start date: <b>${status.program_start_date}</b> (calendar week ${status.calendar_week_number ?? '—'})</p>`
    : ''

  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 560px; margin: 0 auto; color: #26301F;">
    <h2 style="margin-bottom:4px;">The Switch — weekly report</h2>
    <p style="color:#888; margin-top:0;">${status.today}</p>
    <div style="display:flex; gap:16px; margin: 16px 0; flex-wrap: wrap;">
      <div style="background:#F3F6EE; border-radius:12px; padding:12px 16px;">
        <div style="font-size:24px; font-weight:700;">${status.overall_percent}%</div>
        <div style="font-size:12px; color:#666;">overall</div>
      </div>
      <div style="background:#F3F6EE; border-radius:12px; padding:12px 16px;">
        <div style="font-size:24px; font-weight:700;">${status.streak_days}</div>
        <div style="font-size:12px; color:#666;">day streak</div>
      </div>
      <div style="background:#F3F6EE; border-radius:12px; padding:12px 16px;">
        <div style="font-size:24px; font-weight:700;">${status.stories_done}/${status.stories_total}</div>
        <div style="font-size:12px; color:#666;">stories</div>
      </div>
    </div>
    ${startLine}
    <p style="margin:12px 0 4px; font-weight:600;">By week</p>
    <table style="width:100%; border-collapse:collapse; font-size:14px;">${weekRows}</table>
    <p style="margin:20px 0 4px; font-weight:600;">Theory ${status.theory_percent}% · System design ${status.system_design_percent}%</p>
    <p style="color:#999; font-size:12px; margin-top:24px;">Outgrow it strategically. 🌱</p>
  </div>`
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

export async function sendWeeklyReport(env) {
  if (!env.SENDER_MAIL || !env.MAIL_PASSWORD || !env.RECEIVER_MAIL) {
    throw new Error('Email is not configured. Set SENDER_MAIL, MAIL_PASSWORD, and RECEIVER_MAIL as Worker secrets.')
  }

  const status = await getFullStatus(env)

  const mailer = await WorkerMailer.connect({
    credentials: { username: env.SENDER_MAIL, password: env.MAIL_PASSWORD },
    authType: 'plain',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
  })

  try {
    await mailer.send({
      from: { name: 'The Switch', email: env.SENDER_MAIL },
      to: { email: env.RECEIVER_MAIL },
      subject: `The Switch — weekly report (${status.today})`,
      text: renderText(status),
      html: renderHtml(status),
    })
  } finally {
    // worker-mailer holds a TCP socket open; always release it.
    if (typeof mailer.close === 'function') await mailer.close()
  }

  return { sent: true, to: env.RECEIVER_MAIL, today: status.today }
}
