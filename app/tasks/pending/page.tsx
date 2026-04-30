import { getTasksByStatus } from '@/lib/supabase'
import { Header } from '@/components/layout/Header'
import { PendingTaskSection } from './PendingTaskSection'

export const revalidate = 60

export default async function PendingTasksPage() {
  const tasks = await getTasksByStatus('대기중')

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Header
        title="대기 중 태스크"
        subtitle={`${tasks.length}개의 대기 중인 태스크가 있습니다`}
      />

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <PendingTaskSection initialTasks={tasks} />
      </main>
    </div>
  )
}
