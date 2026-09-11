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
import { useProgress, useDailyLogs } from './lib/store'

export default function App() {
  const [unlocked, setUnlocked] = useState(isUnlocked())
  const [tab, setTab] = useState('overview')
  const { progress, toggle, update, syncState } = useProgress()
  const { logs, saveDay } = useDailyLogs()

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
    </Layout>
  )
}
