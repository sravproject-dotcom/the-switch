import { getSupabaseAdmin } from './supabaseAdmin.js'
import { getFullStatus } from './status.js'
import { weeks } from '../src/data/seed.js'
import { todayISO, mondayWeeksFromToday } from './dateMath.js'

// Item ids the app already uses (see src/data/seed.js and src/lib/store.js):
//   roadmap task:      w{week}-t{n}          e.g. w3-t2
//   roadmap week notes: w{week}-notes        e.g. w3-notes
//   theory topic:       theory-{i}
//   system design Q:    sysd-{i}
//   system design notes: sysd-{i}-notes
//   story done flag:    story-{i}
//   story field notes:  story-{i}-{field}    fields: problem, constraints,
//                        decision, architecture, implementation, failure,
//                        result, change

export const TOOL_SCHEMAS = [
  {
    type: 'function',
    function: {
      name: 'get_overview_status',
      description:
        "Full snapshot of the user's progress: overall / per-phase / per-week completion percentages, theory and system-design percentages, story-bank count, practice streak, last 14 days of practice minutes, and the program's calendar start date if one is set. Call this first whenever you need context before answering or acting.",
      parameters: { type: 'object', properties: {}, additionalProperties: false },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_week_tasks',
      description: 'List every task in a given roadmap week (1-12), with its item_id, label, and done state.',
      parameters: {
        type: 'object',
        properties: {
          week_number: { type: 'integer', minimum: 1, maximum: 12 },
        },
        required: ['week_number'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'toggle_task',
      description:
        'Mark a single checklist item done or not done — a roadmap task, a theory topic, a system-design question, or a story. Pass the exact item_id (get it from list_week_tasks or get_overview_status). If `done` is omitted, the current state is flipped.',
      parameters: {
        type: 'object',
        properties: {
          item_id: { type: 'string' },
          done: { type: 'boolean' },
        },
        required: ['item_id'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_notes',
      description:
        'Set the free-text notes for an item — week notes (w{N}-notes), a system-design question (sysd-{i}-notes), or a story field (story-{i}-{field}, field one of problem/constraints/decision/architecture/implementation/failure/result/change).',
      parameters: {
        type: 'object',
        properties: {
          item_id: { type: 'string' },
          notes: { type: 'string' },
        },
        required: ['item_id', 'notes'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'log_daily_practice',
      description:
        "Upsert the user's daily 60-minute coding-discipline log for a given date (defaults to today). Use this when the user reports practice they did.",
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'YYYY-MM-DD, defaults to today' },
          coding_minutes: { type: 'integer', minimum: 0 },
          debugging_minutes: { type: 'integer', minimum: 0 },
          notes: { type: 'string' },
        },
        required: ['coding_minutes', 'debugging_minutes'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_program_settings',
      description:
        "Read the program's calendar settings: the start date (if one has been set) and today's date. Use this to figure out what week it is calendar-wise.",
      parameters: { type: 'object', properties: {}, additionalProperties: false },
    },
  },
  {
    type: 'function',
    function: {
      name: 'set_program_start_date',
      description:
        'Set the program calendar-start date directly to a specific date. Prefer restart_program for "start from next week" style requests — this is for setting an exact date.',
      parameters: {
        type: 'object',
        properties: {
          start_date: { type: 'string', description: 'YYYY-MM-DD, should be a Monday' },
        },
        required: ['start_date'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'reset_progress',
      description:
        'Delete progress data immediately — no confirmation step, so only call this when the user has clearly asked to clear/reset/wipe something. scope="checklist" clears all roadmap/theory/system-design/story checkboxes and notes. scope="daily_logs" clears the daily practice log and streak. scope="all" clears both.',
      parameters: {
        type: 'object',
        properties: {
          scope: { type: 'string', enum: ['checklist', 'daily_logs', 'all'] },
        },
        required: ['scope'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'restart_program',
      description:
        'The "start over" tool: wipes checklist progress and moves the program\'s calendar start date to the Monday of a given number of weeks from today, computed deterministically on the server (never guess the date yourself). For "restart from next week", use weeks_from_now=1. For "restart from this week" / right now, use weeks_from_now=0.',
      parameters: {
        type: 'object',
        properties: {
          weeks_from_now: { type: 'integer', minimum: 0, maximum: 12, default: 1 },
          wipe_daily_logs: {
            type: 'boolean',
            default: false,
            description: 'Also clear the daily practice log / streak, not just the checklist.',
          },
        },
        required: ['weeks_from_now'],
        additionalProperties: false,
      },
    },
  },
]

// Tools whose execution changes stored data — the frontend uses this list
// (echoed back per-call in the API response) to know when to refetch.
export const MUTATING_TOOLS = new Set([
  'toggle_task',
  'update_notes',
  'log_daily_practice',
  'set_program_start_date',
  'reset_progress',
  'restart_program',
])

function validItemId(itemId) {
  return typeof itemId === 'string' && itemId.length > 0 && itemId.length < 200
}

export async function executeTool(name, args, env) {
  const db = getSupabaseAdmin(env)

  switch (name) {
    case 'get_overview_status': {
      return await getFullStatus(env)
    }

    case 'list_week_tasks': {
      const week = weeks.find((w) => w.number === args.week_number)
      if (!week) return { error: `No such week: ${args.week_number}` }
      const { data, error } = await db
        .from('progress')
        .select('item_id, done')
        .in('item_id', week.tasks.map((t) => t.id))
      if (error) return { error: error.message }
      const doneMap = new Map((data || []).map((r) => [r.item_id, r.done]))
      return {
        week_number: week.number,
        title: week.title,
        tasks: week.tasks.map((t) => ({ item_id: t.id, label: t.label, done: !!doneMap.get(t.id) })),
      }
    }

    case 'toggle_task': {
      if (!validItemId(args.item_id)) return { error: 'Invalid item_id' }
      let done = args.done
      if (typeof done !== 'boolean') {
        const { data } = await db.from('progress').select('done').eq('item_id', args.item_id).maybeSingle()
        done = !(data?.done)
      }
      const { error } = await db
        .from('progress')
        .upsert({ item_id: args.item_id, done, updated_at: new Date().toISOString() }, { onConflict: 'item_id' })
      if (error) return { error: error.message }
      return { item_id: args.item_id, done }
    }

    case 'update_notes': {
      if (!validItemId(args.item_id)) return { error: 'Invalid item_id' }
      const { error } = await db
        .from('progress')
        .upsert(
          { item_id: args.item_id, notes: args.notes ?? '', updated_at: new Date().toISOString() },
          { onConflict: 'item_id' }
        )
      if (error) return { error: error.message }
      return { item_id: args.item_id, notes: args.notes ?? '' }
    }

    case 'log_daily_practice': {
      const date = args.date || todayISO()
      const { error } = await db.from('daily_logs').upsert(
        {
          log_date: date,
          coding_minutes: args.coding_minutes ?? 0,
          debugging_minutes: args.debugging_minutes ?? 0,
          notes: args.notes ?? '',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'log_date' }
      )
      if (error) return { error: error.message }
      return { date, coding_minutes: args.coding_minutes ?? 0, debugging_minutes: args.debugging_minutes ?? 0 }
    }

    case 'get_program_settings': {
      const { data, error } = await db.from('settings').select('key, value')
      if (error) return { error: error.message }
      const settings = {}
      for (const row of data || []) settings[row.key] = row.value
      return { today: todayISO(), program_start_date: settings.program_start_date || null }
    }

    case 'set_program_start_date': {
      const { error } = await db
        .from('settings')
        .upsert({ key: 'program_start_date', value: args.start_date, updated_at: new Date().toISOString() }, { onConflict: 'key' })
      if (error) return { error: error.message }
      return { program_start_date: args.start_date }
    }

    case 'reset_progress': {
      const result = { scope: args.scope, cleared: [] }
      if (args.scope === 'checklist' || args.scope === 'all') {
        const { error, count } = await db.from('progress').delete({ count: 'exact' }).not('item_id', 'is', null)
        if (error) return { error: error.message }
        result.cleared.push({ table: 'progress', rows: count ?? null })
      }
      if (args.scope === 'daily_logs' || args.scope === 'all') {
        const { error, count } = await db.from('daily_logs').delete({ count: 'exact' }).not('log_date', 'is', null)
        if (error) return { error: error.message }
        result.cleared.push({ table: 'daily_logs', rows: count ?? null })
      }
      return result
    }

    case 'restart_program': {
      const weeksFromNow = Number.isInteger(args.weeks_from_now) ? args.weeks_from_now : 1
      const newStart = mondayWeeksFromToday(weeksFromNow)

      const { error: progErr, count: progCount } = await db
        .from('progress')
        .delete({ count: 'exact' })
        .not('item_id', 'is', null)
      if (progErr) return { error: progErr.message }

      let logsCleared = null
      if (args.wipe_daily_logs) {
        const { error: logErr, count: logCount } = await db
          .from('daily_logs')
          .delete({ count: 'exact' })
          .not('log_date', 'is', null)
        if (logErr) return { error: logErr.message }
        logsCleared = logCount ?? null
      }

      const { error: setErr } = await db
        .from('settings')
        .upsert({ key: 'program_start_date', value: newStart, updated_at: new Date().toISOString() }, { onConflict: 'key' })
      if (setErr) return { error: setErr.message }

      return {
        checklist_rows_cleared: progCount ?? null,
        daily_logs_rows_cleared: logsCleared,
        new_program_start_date: newStart,
      }
    }

    default:
      return { error: `Unknown tool: ${name}` }
  }
}
