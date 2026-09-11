import { weeks, phases, theoryTopics, systemDesignQuestions } from '../data/seed'

export function weekTasks(weekNumber) {
  const w = weeks.find((w) => w.number === weekNumber)
  return w ? w.tasks : []
}

export function weekPercent(weekNumber, progress) {
  const tasks = weekTasks(weekNumber)
  if (!tasks.length) return 0
  const done = tasks.filter((t) => progress[t.id]?.done).length
  return Math.round((done / tasks.length) * 100)
}

export function phasePercent(phaseId, progress) {
  const phase = phases.find((p) => p.id === phaseId)
  if (!phase) return 0
  const allTasks = weeks
    .filter((w) => w.phaseId === phaseId)
    .flatMap((w) => w.tasks)
  if (!allTasks.length) return 0
  const done = allTasks.filter((t) => progress[t.id]?.done).length
  return Math.round((done / allTasks.length) * 100)
}

export function overallPercent(progress) {
  const allTasks = weeks.flatMap((w) => w.tasks)
  if (!allTasks.length) return 0
  const done = allTasks.filter((t) => progress[t.id]?.done).length
  return Math.round((done / allTasks.length) * 100)
}

export function theoryPercent(progress) {
  if (!theoryTopics.length) return 0
  const done = theoryTopics.filter((t) => progress[t.id]?.done).length
  return Math.round((done / theoryTopics.length) * 100)
}

export function sysDesignPercent(progress) {
  if (!systemDesignQuestions.length) return 0
  const done = systemDesignQuestions.filter((q) => progress[q.id]?.done).length
  return Math.round((done / systemDesignQuestions.length) * 100)
}

export function currentStreak(logs) {
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const entry = logs[key]
    const didPractice = entry && (entry.coding > 0 || entry.debugging > 0)
    if (didPractice) {
      streak++
    } else if (i === 0) {
      // today not logged yet — don't break the streak, just don't count it
      continue
    } else {
      break
    }
  }
  return streak
}

export function last14Days(logs) {
  const out = []
  const today = new Date()
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const entry = logs[key] || { coding: 0, debugging: 0 }
    out.push({
      date: key.slice(5),
      minutes: (entry.coding || 0) + (entry.debugging || 0),
    })
  }
  return out
}
