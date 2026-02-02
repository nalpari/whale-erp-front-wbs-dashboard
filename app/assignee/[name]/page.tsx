import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTasksByAssignee } from '@/lib/supabase'
import { getAssigneeColorConfig } from '@/lib/assignee-colors'
import { Header } from '@/components/layout/Header'
import { GlowCard } from '@/components/ui/GlowCard'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { AssigneeTaskSection } from './AssigneeTaskSection'
import { AssigneeCategoryChart } from './AssigneeCategoryChart'
import { ArrowLeft, CheckCircle2, Clock, ListTodo, Calendar, AlertTriangle, Bug } from 'lucide-react'

export const revalidate = 60

interface PageProps {
  params: Promise<{ name: string }>
}

export default async function AssigneePage({ params }: PageProps) {
  const { name } = await params
  const decodedName = decodeURIComponent(name)

  const tasks = await getTasksByAssignee(decodedName)

  if (tasks.length === 0) {
    notFound()
  }

  const colorConfig = getAssigneeColorConfig(decodedName)

  const total = tasks.length
  const completed = tasks.filter(t => t.progress === 100).length
  const inProgress = tasks.filter(t => t.progress > 0 && t.progress < 100).length
  const pending = tasks.filter(t => t.progress === 0).length
  const issues = tasks.filter(t => t.status === '이슈').length
  const bugs = tasks.filter(t => t.status === '버그').length
  const overallProgress = total > 0
    ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / total)
    : 0

  // Group tasks by category
  const categories = [...new Set(tasks.map(t => t.category))]
  const categoryData = categories.map(cat => {
    const catTasks = tasks.filter(t => t.category === cat)
    return {
      category: cat,
      total: catTasks.length,
      completed: catTasks.filter(t => t.progress === 100).length,
      pending: catTasks.filter(t => t.progress === 0).length,
      progress: catTasks.length > 0
        ? Math.round(catTasks.reduce((sum, t) => sum + t.progress, 0) / catTasks.length)
        : 0,
    }
  }).sort((a, b) => b.total - a.total)

  // Get upcoming tasks (with due dates)
  const upcomingTasks = tasks
    .filter(t => t.due_date && t.progress < 100)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 5)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Header
        title={`${decodedName}'s Dashboard`}
        subtitle="개인 진행 현황"
      />

      <main className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:gap-3"
          style={{
            background: 'var(--bg-glass)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'var(--text-secondary)',
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Overview로 돌아가기</span>
        </Link>

        {/* Profile & Stats Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <GlowCard
            glowColor={colorConfig.glow}
            delay={0.1}
            className="p-8 lg:col-span-1"
          >
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6 text-4xl font-bold"
                style={{
                  background: 'var(--accent-bg)',
                  border: '2px solid var(--accent)',
                  color: 'var(--accent)',
                }}
              >
                {decodedName.charAt(0)}
              </div>

              <h1
                className="text-3xl font-bold mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                {decodedName}
              </h1>

              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                {categories.length}개 카테고리 담당
              </p>

              {/* Progress Ring */}
              <ProgressRing
                progress={overallProgress}
                size={160}
                strokeWidth={12}
                color={colorConfig.color}
                label="전체 진행률"
              />
            </div>
          </GlowCard>

          {/* Stats Grid */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: '전체', value: total, icon: ListTodo, color: 'var(--accent)' },
              { label: '완료', value: completed, icon: CheckCircle2, color: 'var(--success)' },
              { label: '진행 중', value: inProgress, icon: Clock, color: 'var(--info)' },
              { label: '대기', value: pending, icon: Calendar, color: 'var(--text-muted)' },
              { label: '이슈', value: issues, icon: AlertTriangle, color: 'var(--warning)' },
              { label: '버그', value: bugs, icon: Bug, color: 'var(--error)' },
            ].map((stat, index) => (
              <GlowCard
                key={stat.label}
                glowColor={index === 0 ? colorConfig.glow : undefined}
                delay={0.2 + index * 0.1}
                className="p-6"
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                    style={{
                      background: `${stat.color}15`,
                      border: `1px solid ${stat.color}30`,
                    }}
                  >
                    <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                  <AnimatedCounter
                    value={stat.value}
                    className="text-3xl font-bold font-mono"
                    style={{ color: stat.color }}
                  />
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    {stat.label}
                  </p>
                </div>
              </GlowCard>
            ))}
          </div>
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Progress */}
          <GlowCard glowColor={colorConfig.glow} delay={0.3} className="p-6">
            <h2 className="text-xl font-bold mb-6 gradient-text">카테고리별 진행 현황</h2>
            <AssigneeCategoryChart data={categoryData} color={colorConfig.color} />
          </GlowCard>

          {/* Upcoming Tasks */}
          <GlowCard glowColor="orange" delay={0.4} className="p-6">
            <h2 className="text-xl font-bold mb-6 gradient-text">다가오는 마감일</h2>
            {upcomingTasks.length > 0 ? (
              <div className="space-y-3">
                {upcomingTasks.map((task) => {
                  const dueDate = new Date(task.due_date!)
                  const today = new Date()
                  const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                  const isOverdue = daysLeft < 0
                  const isUrgent = daysLeft <= 3 && daysLeft >= 0

                  return (
                    <div
                      key={task.id}
                      className="p-4 rounded-xl"
                      style={{
                        background: 'var(--bg-secondary)',
                        border: `1px solid ${isOverdue ? 'var(--error)' : isUrgent ? 'var(--warning)' : 'var(--border)'}`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                            {task.task_title}
                          </p>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                            {task.category}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className="text-sm font-mono font-bold"
                            style={{
                              color: isOverdue ? 'var(--error)' : isUrgent ? 'var(--warning)' : 'var(--text-secondary)',
                            }}
                          >
                            {isOverdue ? `${Math.abs(daysLeft)}일 지남` : `D-${daysLeft}`}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {dueDate.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                마감일이 설정된 태스크가 없습니다
              </div>
            )}
          </GlowCard>
        </section>

        {/* Task List Section */}
        <section>
          <GlowCard glowColor={colorConfig.glow} delay={0.5} className="p-6">
            <h2 className="text-xl font-bold mb-6 gradient-text">전체 태스크 목록</h2>
            <AssigneeTaskSection initialTasks={tasks} color={colorConfig.color} />
          </GlowCard>
        </section>
      </main>
    </div>
  )
}
