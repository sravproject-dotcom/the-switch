import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase, isSupabaseConfigured } from './supabaseClient'

const LOCAL_KEY = 'switch_progress_v1'
const LOCAL_LOGS_KEY = 'switch_daily_logs_v1'
const PLAN_START_KEY = 'switch_plan_start_v1'

function readLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full or unavailable — silently skip, in-memory state still works
  }
}

/**
 * Tracks progress for every checklist item across the app.
 * Shape: { [item_id]: { done: bool, notes: string } }
 */
export function useProgress() {
  const [progress, setProgress] = useState(() => readLocal(LOCAL_KEY, {}))
  const [syncState, setSyncState] = useState(isSupabaseConfigured ? 'syncing' : 'offline')
  const loaded = useRef(false)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let cancelled = false
    supabase
      .from('progress')
      .select('item_id, done, notes')
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.error('Supabase load error', error)
          setSyncState('error')
          return
        }
        const merged = { ...readLocal(LOCAL_KEY, {}) }
        for (const row of data || []) {
          merged[row.item_id] = { done: row.done, notes: row.notes || '' }
        }
        setProgress(merged)
        writeLocal(LOCAL_KEY, merged)
        setSyncState('synced')
        loaded.current = true
      })
    return () => {
      cancelled = true
    }
  }, [])

  const update = useCallback((itemId, patch) => {
    setProgress((prev) => {
      const next = {
        ...prev,
        [itemId]: { done: false, notes: '', ...prev[itemId], ...patch },
      }
      writeLocal(LOCAL_KEY, next)
      return next
    })
    if (isSupabaseConfigured) {
      supabase
        .from('progress')
        .upsert(
          { item_id: itemId, ...patch, updated_at: new Date().toISOString() },
          { onConflict: 'item_id' }
        )
        .then(({ error }) => {
          if (error) console.error('Supabase save error', error)
        })
    }
  }, [])

  const toggle = useCallback(
    (itemId) => {
      const current = progress[itemId]?.done || false
      update(itemId, { done: !current })
    },
    [progress, update]
  )

  const reset = useCallback(() => {
    setProgress({})
    writeLocal(LOCAL_KEY, {})
    if (isSupabaseConfigured) {
      supabase.from('progress').delete().neq('item_id', '').then(({ error }) => {
        if (error) console.error('Supabase reset error', error)
      })
    }
  }, [])

  return { progress, toggle, update, reset, syncState }
}

/**
 * Tracks the daily coding-discipline log, keyed by ISO date string.
 */
export function useDailyLogs() {
  const [logs, setLogs] = useState(() => readLocal(LOCAL_LOGS_KEY, {}))

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let cancelled = false
    supabase
      .from('daily_logs')
      .select('log_date, coding_minutes, debugging_minutes, notes')
      .then(({ data, error }) => {
        if (cancelled || error) return
        const merged = { ...readLocal(LOCAL_LOGS_KEY, {}) }
        for (const row of data || []) {
          merged[row.log_date] = {
            coding: row.coding_minutes || 0,
            debugging: row.debugging_minutes || 0,
            notes: row.notes || '',
          }
        }
        setLogs(merged)
        writeLocal(LOCAL_LOGS_KEY, merged)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const saveDay = useCallback((dateStr, entry) => {
    setLogs((prev) => {
      const next = { ...prev, [dateStr]: { ...prev[dateStr], ...entry } }
      writeLocal(LOCAL_LOGS_KEY, next)
      return next
    })
    if (isSupabaseConfigured) {
      supabase
        .from('daily_logs')
        .upsert(
          {
            log_date: dateStr,
            coding_minutes: entry.coding,
            debugging_minutes: entry.debugging,
            notes: entry.notes,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'log_date' }
        )
        .then(({ error }) => {
          if (error) console.error('Supabase save error', error)
        })
    }
  }, [])

  const reset = useCallback(() => {
    setLogs({})
    writeLocal(LOCAL_LOGS_KEY, {})
    if (isSupabaseConfigured) {
      supabase.from('daily_logs').delete().neq('log_date', '1900-01-01').then(({ error }) => {
        if (error) console.error('Supabase log reset error', error)
      })
    }
  }, [])

  return { logs, saveDay, reset }
}

export function usePlanStart() {
  const [planStart, setPlanStartState] = useState(() => readLocal(PLAN_START_KEY, ''))
  const setPlanStart = useCallback((date) => {
    setPlanStartState(date)
    writeLocal(PLAN_START_KEY, date)
  }, [])
  return { planStart, setPlanStart }
}
