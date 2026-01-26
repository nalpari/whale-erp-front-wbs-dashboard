'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Clock, ListTodo, TrendingUp, AlertTriangle, Bug } from 'lucide-react'
import { GlowCard } from '@/components/ui/GlowCard'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'

interface StatsCardsProps {
  total: number
  completed: number
  inProgress: number
  pending: number
  issues: number
  bugs: number
  overallProgress: number
}

export function StatsCards({
  total,
  completed,
  inProgress,
  issues,
  bugs,
  overallProgress,
}: StatsCardsProps) {
  const stats = [
    {
      label: '전체 태스크',
      value: total,
      icon: ListTodo,
      color: 'cyan',
      gradient: 'from-cyan-500 to-blue-500',
      iconColor: 'var(--neon-cyan)',
    },
    {
      label: '완료',
      value: completed,
      icon: CheckCircle2,
      color: 'green',
      gradient: 'from-green-500 to-emerald-500',
      iconColor: 'var(--neon-green)',
    },
    {
      label: '진행 중',
      value: inProgress,
      icon: Clock,
      color: 'orange',
      gradient: 'from-orange-500 to-amber-500',
      iconColor: 'var(--neon-orange)',
    },
    {
      label: '이슈',
      value: issues,
      icon: AlertTriangle,
      color: 'orange',
      gradient: 'from-orange-500 to-yellow-500',
      iconColor: 'var(--neon-orange)',
    },
    {
      label: '버그',
      value: bugs,
      icon: Bug,
      color: 'pink',
      gradient: 'from-pink-500 to-red-500',
      iconColor: 'var(--neon-pink)',
    },
    {
      label: '전체 진행률',
      value: overallProgress,
      suffix: '%',
      icon: TrendingUp,
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500',
      iconColor: 'var(--neon-purple)',
    },
  ]

  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <GlowCard
          key={stat.label}
          glowColor={stat.color as 'cyan' | 'magenta' | 'purple' | 'pink' | 'green' | 'orange' | 'blue'}
          delay={index * 0.1}
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
                  style={{ color: stat.iconColor }}
                />
                {stat.suffix && (
                  <span
                    className="text-2xl font-bold"
                    style={{ color: stat.iconColor }}
                  >
                    {stat.suffix}
                  </span>
                )}
              </div>
            </div>

            <motion.div
              className="p-3 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${stat.iconColor}20, ${stat.iconColor}05)`,
                border: `1px solid ${stat.iconColor}30`,
              }}
              whileHover={{
                scale: 1.1,
                boxShadow: `0 0 30px ${stat.iconColor}40`,
              }}
            >
              <stat.icon
                className="w-6 h-6"
                style={{ color: stat.iconColor }}
              />
            </motion.div>
          </div>

          {/* Progress bar for overall progress */}
          {stat.suffix === '%' && (
            <div className="mt-4">
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: 'rgba(255, 255, 255, 0.1)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, var(--neon-cyan), var(--neon-purple))`,
                    boxShadow: '0 0 20px var(--neon-cyan)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.value}%` }}
                  transition={{ duration: 1.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          )}

          {/* Shimmer effect */}
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden rounded-2xl">
            <div className="animate-shimmer absolute inset-0" />
          </div>
        </GlowCard>
      ))}
    </div>
  )
}
