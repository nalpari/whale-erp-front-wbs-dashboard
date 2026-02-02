'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Clock, ListTodo, TrendingUp, AlertTriangle, Bug, XCircle } from 'lucide-react'
import { GlowCard } from '@/components/ui/GlowCard'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'

interface StatsCardsProps {
  total: number
  completed: number
  inProgress: number
  pending: number
  issues: number
  bugs: number
  cancelled: number
  overallProgress: number
}

export function StatsCards({
  total,
  completed,
  inProgress,
  issues,
  bugs,
  cancelled,
  overallProgress,
}: StatsCardsProps) {
  const stats = [
    {
      label: '전체 태스크',
      value: total,
      icon: ListTodo,
      color: 'var(--accent)',
    },
    {
      label: '완료',
      value: completed,
      icon: CheckCircle2,
      color: 'var(--success)',
    },
    {
      label: '진행 중',
      value: inProgress,
      icon: Clock,
      color: 'var(--warning)',
    },
    {
      label: '이슈',
      value: issues,
      icon: AlertTriangle,
      color: 'var(--warning)',
    },
    {
      label: '버그',
      value: bugs,
      icon: Bug,
      color: 'var(--error)',
    },
    {
      label: '취소',
      value: cancelled,
      icon: XCircle,
      color: 'var(--text-secondary)',
    },
    {
      label: '전체 진행률',
      value: overallProgress,
      suffix: '%',
      icon: TrendingUp,
      color: 'var(--accent)',
    },
  ]

  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <GlowCard
          key={stat.label}
          delay={index * 0.05}
          className="p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <p
                className="text-sm font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                {stat.label}
              </p>
              <div className="flex items-baseline gap-1">
                <AnimatedCounter
                  value={stat.value}
                  className="text-4xl font-bold font-mono"
                  style={{ color: stat.color }}
                />
                {stat.suffix && (
                  <span
                    className="text-2xl font-bold"
                    style={{ color: stat.color }}
                  >
                    {stat.suffix}
                  </span>
                )}
              </div>
            </div>

            <div
              className="p-3 rounded-xl transition-colors"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
              }}
            >
              <stat.icon
                className="w-6 h-6"
                style={{ color: stat.color }}
              />
            </div>
          </div>

          {/* Progress bar for overall progress */}
          {stat.suffix === '%' && (
            <div className="mt-4">
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: 'var(--bg-tertiary)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'var(--accent)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.value}%` }}
                  transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}
        </GlowCard>
      ))}
    </div>
  )
}
