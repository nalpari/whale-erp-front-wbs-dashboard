import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTasksByAssignee, getAssigneeStats, getCategoryStats, Task } from '@/lib/supabase'
import { Header } from '@/components/layout/Header'
import { GlowCard } from '@/components/ui/GlowCard'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { AssigneeTaskList } from './AssigneeTaskList'
import { AssigneeCategoryChart } from './AssigneeCategoryChart'
import { ArrowLeft, CheckCircle2, Clock, ListTodo, Calendar } from 'lucide-react'

export const revalidate = 60

const ASSIGNEE_COLORS: Record<string, { color: string; glow: string }> = {
  '유상욱': { color: '#00f5ff', glow: 'cyan' },
  '최효준': { color: '#a855f7', glow: 'purple' },
  '김다영': { color: '#ff00ff', glow: 'magenta' },
  '김다슬': { color: '#ec4899', glow: 'pink' },
}

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

  const colorConfig = ASSIGNEE_COLORS[decodedName] || { color: '#3b82f6', glow: 'blue' }

  const total = tasks.length
  const completed = tasks.filter(t => t.progress === 100).length
  const inProgress = tasks.filter(t => t.progress > 0 && t.progress < 100).length
  const pending = tasks.filter(t => t.progress === 0).length
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
            glowColor={colorConfig.glow as any}
            delay={0.1}
            className="p-8 lg:col-span-1"
          >
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6 text-4xl font-bold"
                style={{
                  background: `linear-gradient(135deg, ${colorConfig.color}30, ${colorConfig.color}10)`,
                  border: `2px solid ${colorConfig.color}50`,
                  color: colorConfig.color,
                  boxShadow: `0 0 40px ${colorConfig.color}30`,
                }}
              >
                {decodedName.charAt(0)}
              </div>

              <h1
                className="text-3xl font-bold mb-2"
                style={{ color: colorConfig.color }}
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
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: '전체', value: total, icon: ListTodo, color: colorConfig.color },
              { label: '완료', value: completed, icon: CheckCircle2, color: 'var(--neon-green)' },
              { label: '진행 중', value: inProgress, icon: Clock, color: 'var(--neon-orange)' },
              { label: '대기', value: pending, icon: Calendar, color: 'var(--text-muted)' },
            ].map((stat, index) => (
              <GlowCard
                key={stat.label}
                glowColor={index === 0 ? colorConfig.glow as any : undefined}
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
          <GlowCard glowColor={colorConfig.glow as any} delay={0.3} className="p-6">
            <h2 className="text-xl font-bold mb-6 gradient-text">카테고리별 진행 현황</h2>
            <AssigneeCategoryChart data={categoryData} color={colorConfig.color} />
          </GlowCard>

          {/* Upcoming Tasks */}
          <GlowCard glowColor="orange" delay={0.4} className="p-6">
            <h2 className="text-xl font-bold mb-6 gradient-text">다가오는 마감일</h2>
            {upcomingTasks.length > 0 ? (
              <div className="space-y-3">
                {upcomingTasks.map((task, index) => {
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
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: `1px solid ${isOverdue ? 'var(--neon-pink)' : isUrgent ? 'var(--neon-orange)' : 'rgba(255, 255, 255, 0.1)'}30`,
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
                              color: isOverdue ? 'var(--neon-pink)' : isUrgent ? 'var(--neon-orange)' : 'var(--text-secondary)',
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
          <GlowCard glowColor={colorConfig.glow as any} delay={0.5} className="p-6">
            <h2 className="text-xl font-bold mb-6 gradient-text">전체 태스크 목록</h2>
            <AssigneeTaskList tasks={tasks} color={colorConfig.color} />
          </GlowCard>
        </section>
      </main>
    </div>
  )
}
