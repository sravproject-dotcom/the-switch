import { getSupabaseAdmin } from './supabaseAdmin.js'
import { weeks, phases, theoryTopics, systemDesignQuestions, stories } from '../src/data/seed.js'
import {
  overallPercent,
  phasePercent,
  weekPercent,
  theoryPercent,
  sysDesignPercent,
  currentStreak,
  last14Days,
} from '../src/lib/derive.js'
import { todayISO, calendarWeekNumber } from './dateMath.js'

/** progress table rows -> { [item_id]: { done, notes } }, same shape the UI uses. */
function mapProgress(rows) {
  const out = {}
  for (const row of rows || []) {
    out[row.item_id] = { done: !!row.done, notes: row.notes || '' }
  }
  return out
}

/** daily_logs rows -> { [date]: { coding, debugging, notes } }, same shape the UI uses. */
function mapLogs(rows) {
  const out = {}
  for (const row of rows || []) {
    out[row.log_date] = {
      coding: row.coding_minutes || 0,
      debugging: row.debugging_minutes || 0,
      notes: row.notes || '',
    }
  }
  return out
}

export async function fetchRawData(env) {
  const db = getSupabaseAdmin(env)
  const [progressRes, logsRes, settingsRes] = await Promise.all([
    db.from('progress').select('item_id, done, notes'),
    db.from('daily_logs').select('log_date, coding_minutes, debugging_minutes, notes'),
    db.from('settings').select('key, value'),
  ])
  if (progressRes.error) throw new Error(`Supabase (progress): ${progressRes.error.message}`)
  if (logsRes.error) throw new Error(`Supabase (daily_logs): ${logsRes.error.message}`)
  if (settingsRes.error) throw new Error(`Supabase (settings): ${settingsRes.error.message}`)

  const settings = {}
  for (const row of settingsRes.data || []) settings[row.key] = row.value

  return {
    progress: mapProgress(progressRes.data),
    logs: mapLogs(logsRes.data),
    settings,
  }
}

/** Full status snapshot: everything the agent or the weekly email needs. */
export async function getFullStatus(env) {
  const { progress, logs, settings } = await fetchRawData(env)
  const today = todayISO()
  const startDate = settings.program_start_date || null

  const weekBreakdown = weeks.map((w) => {
    const doneCount = w.tasks.filter((t) => progress[t.id]?.done).length
    return {
      week_number: w.number,
      title: w.title,
      phase_id: w.phaseId,
      percent: weekPercent(w.number, progress),
      tasks_done: doneCount,
      tasks_total: w.tasks.length,
      notes: progress[`w${w.number}-notes`]?.notes || '',
    }
  })

  const phaseBreakdown = phases.map((p) => ({
    phase_id: p.id,
    number: p.number,
    title: p.title,
    percent: phasePercent(p.id, progress),
    weeks: p.weeks,
  }))

  const storiesDone = stories.filter((s) => progress[s.id]?.done).length

  return {
    today,
    program_start_date: startDate,
    calendar_week_number: calendarWeekNumber(startDate, today),
    overall_percent: overallPercent(progress),
    theory_percent: theoryPercent(progress),
    system_design_percent: sysDesignPercent(progress),
    stories_done: storiesDone,
    stories_total: stories.length,
    streak_days: currentStreak(logs),
    last_14_days: last14Days(logs),
    phases: phaseBreakdown,
    weeks: weekBreakdown,
    theory_topics: theoryTopics.map((t) => ({ id: t.id, topic: t.topic, done: !!progress[t.id]?.done })),
    system_design_questions: systemDesignQuestions.map((q) => ({
      id: q.id,
      question: q.question,
      done: !!progress[q.id]?.done,
      notes: progress[`${q.id}-notes`]?.notes || '',
    })),
  }
}
