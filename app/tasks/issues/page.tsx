import { getTasksByStatus } from '@/lib/supabase'
import { Header } from '@/components/layout/Header'
import { IssuesTaskSection } from './IssuesTaskSection'

export const revalidate = 60

export default async function IssuesTasksPage() {
  const tasks = await getTasksByStatus('이슈')

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Header
        title="이슈 태스크"
        subtitle={`${tasks.length}개의 이슈 태스크가 있습니다`}
      />

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <IssuesTaskSection initialTasks={tasks} />
      </main>
    </div>
  )
}
