import { callGroqChat } from './groq.js'
import { TOOL_SCHEMAS, MUTATING_TOOLS, executeTool } from './tools.js'
import { todayISO } from './dateMath.js'

const MODEL = 'openai/gpt-oss-120b'
const MAX_STEPS = 8

function systemPrompt() {
  return {
    role: 'system',
    content: [
      'You are the in-app assistant for "The Switch", a 12-week Salesforce-developer to AI-engineer',
      'career-transition tracker. You can see and change everything in the app through your tools:',
      'roadmap task checkboxes and notes, the theory checklist, system-design practice notes, the',
      'story bank, the daily practice log/streak, and the program calendar start date.',
      '',
      `Today's date is ${todayISO()}. Never guess or compute dates yourself — always get them from`,
      'tool results (get_overview_status, get_program_settings) or pass relative amounts (like',
      'weeks_from_now) to restart_program/set_program_start_date and let the server compute the exact date.',
      '',
      'Call get_overview_status whenever you need context before answering — do not assume you know',
      'the current state. When the user asks you to change something (check off a task, log practice,',
      'update notes, reset progress, restart the program), just do it with the appropriate tool — this',
      'app has no confirmation step for destructive actions, so act directly and then report back',
      'exactly what you changed. Be concise and concrete in your replies; reference actual week numbers,',
      'task labels, and percentages rather than vague summaries.',
    ].join('\n'),
  }
}

function safeParseArgs(raw) {
  try {
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

/**
 * Runs the tool-calling loop. `history` is an array of {role, content}
 * messages (no system prompt — that's added here). Returns the assistant's
 * final reply plus whether any mutating tool ran, so the caller can tell
 * the frontend to refetch.
 */
export async function runAgent(env, history) {
  const messages = [systemPrompt(), ...history]
  let dataChanged = false
  const toolLog = []

  for (let step = 0; step < MAX_STEPS; step++) {
    const resp = await callGroqChat(env, {
      model: MODEL,
      messages,
      tools: TOOL_SCHEMAS,
      tool_choice: 'auto',
      temperature: 0.4,
    })

    const choice = resp.choices?.[0]
    if (!choice) throw new Error('Groq returned no completion choices.')
    const msg = choice.message

    messages.push({
      role: 'assistant',
      content: msg.content ?? null,
      tool_calls: msg.tool_calls,
    })

    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      return { reply: msg.content || '', dataChanged, toolLog }
    }

    for (const call of msg.tool_calls) {
      const args = safeParseArgs(call.function?.arguments)
      let result
      try {
        result = await executeTool(call.function.name, args, env)
      } catch (err) {
        result = { error: err.message || String(err) }
      }
      if (MUTATING_TOOLS.has(call.function.name) && !result?.error) {
        dataChanged = true
      }
      toolLog.push({ name: call.function.name, args, result })
      messages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: JSON.stringify(result),
      })
    }
  }

  return {
    reply:
      "I made several changes but hit my step limit before finishing the summary — check the roadmap/overview tab to see exactly what changed, or ask me to continue.",
    dataChanged,
    toolLog,
  }
}
