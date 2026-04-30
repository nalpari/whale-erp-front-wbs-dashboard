import { getTasksByStatus } from '@/lib/supabase'
import { Header } from '@/components/layout/Header'
import { CompletedTaskSection } from './CompletedTaskSection'

export const revalidate = 60

export default async function CompletedTasksPage() {
  const tasks = await getTasksByStatus('완료')

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Header
        title="완료 태스크"
        subtitle={`${tasks.length}개의 완료된 태스크가 있습니다`}
      />

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <CompletedTaskSection initialTasks={tasks} />
      </main>
    </div>
  )
}
