import { getTasks, getCategoryStats, getAssigneeStats } from '@/lib/supabase'
import { Header } from '@/components/layout/Header'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { AssigneeGrid } from '@/components/dashboard/AssigneeGrid'
import { CategoryRadialChart } from '@/components/charts/CategoryRadialChart'
import { AssigneeDonutChart } from '@/components/charts/AssigneeDonutChart'
import { CategoryBarChart } from '@/components/charts/CategoryBarChart'
import { GlowCard } from '@/components/ui/GlowCard'

export const revalidate = 60 // Revalidate every 60 seconds

export default async function Home() {
  const [tasks, categoryStats, assigneeStats] = await Promise.all([
    getTasks(),
    getCategoryStats(),
    getAssigneeStats(),
  ])

  const total = tasks.length
  const completed = tasks.filter(t => t.progress === 100).length
  const inProgress = tasks.filter(t => t.progress > 0 && t.progress < 100).length
  const pending = tasks.filter(t => t.progress === 0).length
  const issues = tasks.filter(t => t.status === '이슈').length
  const bugs = tasks.filter(t => t.status === '버그').length
  const cancelled = tasks.filter(t => t.status === '취소').length
  const overallProgress = total > 0
    ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / total)
    : 0

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Header
        title="WBS Dashboard"
        subtitle="Whale ERP Project Overview"
      />

      <main className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards */}
        <section>
          <StatsCards
            total={total}
            completed={completed}
            inProgress={inProgress}
            pending={pending}
            issues={issues}
            bugs={bugs}
            cancelled={cancelled}
            overallProgress={overallProgress}
          />
        </section>

        {/* Charts Row */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Radial Chart */}
          <GlowCard glowColor="cyan" delay={0.2} className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold gradient-text">카테고리별 진행률</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  상위 10개 카테고리
                </p>
              </div>
              <div
                className="px-3 py-1 rounded-full text-xs font-mono"
                style={{
                  background: 'var(--accent-bg)',
                  color: 'var(--accent)',
                  border: '1px solid var(--accent)',
                }}
              >
                {categoryStats.length}개 카테고리
              </div>
            </div>
            <CategoryRadialChart data={categoryStats} />
          </GlowCard>

          {/* Assignee Donut Chart */}
          <GlowCard glowColor="purple" delay={0.3} className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold gradient-text">담당자별 분포</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  태스크 할당 현황
                </p>
              </div>
              <div
                className="px-3 py-1 rounded-full text-xs font-mono"
                style={{
                  background: 'var(--info-bg)',
                  color: 'var(--info)',
                  border: '1px solid var(--info)',
                }}
              >
                {assigneeStats.length}명
              </div>
            </div>
            <AssigneeDonutChart data={assigneeStats} />

            {/* Legend */}
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              {assigneeStats.map((stat, index) => {
                const colorPalette = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)', 'var(--chart-6)']
                const color = colorPalette[index % colorPalette.length]

                return (
                  <div key={stat.assignee} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        background: color,
                      }}
                    />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {stat.assignee}
                    </span>
                    <span className="text-sm font-mono" style={{ color }}>
                      {stat.total}
                    </span>
                  </div>
                )
              })}
            </div>
          </GlowCard>
        </section>

        {/* Category Bar Chart */}
        <section>
          <GlowCard glowColor="magenta" delay={0.4} className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold gradient-text">카테고리별 태스크 수</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  상위 12개 카테고리
                </p>
              </div>
            </div>
            <CategoryBarChart data={categoryStats} />
          </GlowCard>
        </section>

        {/* Assignee Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold gradient-text">담당자별 현황</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                클릭하여 상세 대시보드로 이동
              </p>
            </div>
          </div>
          <AssigneeGrid data={assigneeStats} />
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t" style={{ borderColor: 'var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Whale ERP WBS Dashboard &copy; 2026
          </p>
          <p className="text-xs mt-2 font-mono" style={{ color: 'var(--text-muted)' }}>
            Built with Next.js, Supabase, Recharts & Framer Motion
          </p>
        </footer>
      </main>
    </div>
  )
}
