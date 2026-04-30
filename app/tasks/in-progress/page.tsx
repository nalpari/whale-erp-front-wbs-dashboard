import { getTasksByStatus } from '@/lib/supabase'
import { Header } from '@/components/layout/Header'
import { InProgressTaskSection } from './InProgressTaskSection'

export const revalidate = 60

export default async function InProgressTasksPage() {
  const tasks = await getTasksByStatus('진행중')

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Header
        title="진행 중 태스크"
        subtitle={`${tasks.length}개의 진행 중인 태스크가 있습니다`}
      />

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <InProgressTaskSection initialTasks={tasks} />
      </main>
    </div>
  )
}
