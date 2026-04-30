import { getTasksByStatus } from '@/lib/supabase'
import { Header } from '@/components/layout/Header'
import { CancelledTaskSection } from './CancelledTaskSection'

export const revalidate = 60

export default async function CancelledTasksPage() {
  const tasks = await getTasksByStatus('취소')

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Header
        title="취소 태스크"
        subtitle={`${tasks.length}개의 취소된 태스크가 있습니다`}
      />

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <CancelledTaskSection initialTasks={tasks} />
      </main>
    </div>
  )
}
