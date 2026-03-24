import { getTasksByStatus } from '@/lib/supabase'
import { Header } from '@/components/layout/Header'
import { BugTaskSection } from './BugTaskSection'

export const revalidate = 60

export default async function BugsPage() {
  const tasks = await getTasksByStatus('버그')

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Header
        title="버그 태스크"
        subtitle={`${tasks.length}개의 버그가 등록되어 있습니다`}
      />

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <BugTaskSection initialTasks={tasks} />
      </main>
    </div>
  )
}
