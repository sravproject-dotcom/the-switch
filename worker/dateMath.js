// Deterministic calendar-week math. The LLM never computes dates itself —
// it only ever sees the outputs of these functions — so "next week" always
// means the same thing regardless of what the model guesses.

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

/** Monday (ISO weekday 1) of the week containing `d` (a Date, UTC-based). */
export function mondayOf(d) {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const day = date.getUTCDay() // 0 = Sunday .. 6 = Saturday
  const diff = day === 0 ? -6 : 1 - day // days to subtract to reach Monday
  date.setUTCDate(date.getUTCDate() + diff)
  return date
}

export function toISO(d) {
  return d.toISOString().slice(0, 10)
}

export function fromISO(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

/**
 * The Monday `weeksFromNow` calendar weeks out from today.
 * weeksFromNow = 0 -> Monday of the current week (could be in the past this week)
 * weeksFromNow = 1 -> Monday of next week
 */
export function mondayWeeksFromToday(weeksFromNow = 1) {
  const thisMonday = mondayOf(new Date())
  thisMonday.setUTCDate(thisMonday.getUTCDate() + weeksFromNow * 7)
  return toISO(thisMonday)
}

export function daysBetween(isoA, isoB) {
  const a = fromISO(isoA)
  const b = fromISO(isoB)
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

/**
 * Given a program start date (Monday) and "today", what calendar week
 * number of the program is it? 1-indexed. Returns null before the start
 * date, and clamps at 12 (the program length) after.
 */
export function calendarWeekNumber(startISO, todayISO_ = todayISO()) {
  if (!startISO) return null
  const days = daysBetween(startISO, todayISO_)
  if (days < 0) return null
  const week = Math.floor(days / 7) + 1
  return Math.min(week, 12)
}
