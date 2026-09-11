import { useState } from 'react'
import PasswordGate, { isUnlocked } from './components/PasswordGate'
import Layout from './components/Layout'
import Overview from './components/Overview'
import Roadmap from './components/Roadmap'
import DailyTracker from './components/DailyTracker'
import TheoryChecklist from './components/TheoryChecklist'
import SystemDesignPractice from './components/SystemDesignPractice'
import StoryBank from './components/StoryBank'
import Positioning from './components/Positioning'
import AiCoach from './components/AiCoach'
import { weeks } from './data/seed'
import { useProgress, useDailyLogs, usePlanStart } from './lib/store'

export default function App() {
  const [unlocked, setUnlocked] = useState(isUnlocked())
  const [tab, setTab] = useState('overview')
  const { progress, toggle, update, reset: resetProgress, syncState } = useProgress()
  const { logs, saveDay, reset: resetLogs } = useDailyLogs()
  const { planStart, setPlanStart } = usePlanStart()

  function applyAssistantAction(action) {
    if (!action) return
    if (action.type === 'reset_all') {
      resetProgress()
      resetLogs()
      setPlanStart('')
    } else if (action.type === 'mark_task' && typeof action.itemId === 'string') {
      update(action.itemId, { done: Boolean(action.done) })
    } else if (action.type === 'set_plan_start' && /^\d{4}-\d{2}-\d{2}$/.test(action.date)) {
      setPlanStart(action.date)
    }
  }

  if (!unlocked) {
    return <PasswordGate onUnlock={() => setUnlocked(true)} />
  }

  return (
    <Layout active={tab} onChange={setTab} syncState={syncState}>
      {tab === 'overview' && <Overview progress={progress} logs={logs} onNavigate={setTab} />}
      {tab === 'roadmap' && <Roadmap progress={progress} toggle={toggle} update={update} />}
      {tab === 'daily' && <DailyTracker logs={logs} saveDay={saveDay} />}
      {tab === 'theory' && <TheoryChecklist progress={progress} toggle={toggle} />}
      {tab === 'systemdesign' && (
        <SystemDesignPractice progress={progress} toggle={toggle} update={update} />
      )}
      {tab === 'stories' && <StoryBank progress={progress} toggle={toggle} update={update} />}
      {tab === 'positioning' && <Positioning />}
      <AiCoach progress={progress} logs={logs} planStart={planStart} roadmap={weeks} onAction={applyAssistantAction} />
    </Layout>
  )
}
