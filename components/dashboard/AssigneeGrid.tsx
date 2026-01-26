'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { User, ArrowRight } from 'lucide-react'
import { GlowCard } from '@/components/ui/GlowCard'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { AssigneeStats } from '@/lib/supabase'

interface AssigneeGridProps {
  data: AssigneeStats[]
}

// 동적 색상 팔레트 - 새 담당자 추가 시 자동 할당
const COLOR_PALETTE = [
  { color: '#00f5ff', glow: 'cyan' },
  { color: '#a855f7', glow: 'purple' },
  { color: '#ff00ff', glow: 'magenta' },
  { color: '#ec4899', glow: 'pink' },
  { color: '#22c55e', glow: 'green' },
  { color: '#f97316', glow: 'orange' },
  { color: '#3b82f6', glow: 'blue' },
  { color: '#eab308', glow: 'yellow' },
]

function getAssigneeColor(index: number) {
  return COLOR_PALETTE[index % COLOR_PALETTE.length]
}

export function AssigneeGrid({ data }: AssigneeGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {data.map((assignee, index) => {
        const colorConfig = getAssigneeColor(index)

        return (
          <Link
            key={assignee.assignee}
            href={`/assignee/${encodeURIComponent(assignee.assignee)}`}
          >
            <GlowCard
              glowColor={colorConfig.glow as 'cyan' | 'magenta' | 'purple' | 'pink' | 'green' | 'orange' | 'blue'}
              delay={index * 0.15}
              className="p-6 cursor-pointer group h-full"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  className="w-12 h-12 rounded-xl flex items-center justify-center relative"
                  style={{
                    background: `linear-gradient(135deg, ${colorConfig.color}30, ${colorConfig.color}10)`,
                    border: `1px solid ${colorConfig.color}40`,
                  }}
                  whileHover={{
                    scale: 1.1,
                    boxShadow: `0 0 30px ${colorConfig.color}50`,
                  }}
                >
                  <User className="w-6 h-6" style={{ color: colorConfig.color }} />

                  {/* Online indicator */}
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                    style={{
                      background: 'var(--neon-green)',
                      boxShadow: '0 0 10px var(--neon-green)',
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.8, 1],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>

                <div className="flex-1 min-w-0">
                  <h3
                    className="font-bold text-lg truncate"
                    style={{ color: colorConfig.color }}
                  >
                    {assignee.assignee}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {assignee.categories.length}개 카테고리
                  </p>
                </div>
              </div>

              {/* Progress Ring */}
              <div className="flex justify-center mb-6">
                <ProgressRing
                  progress={assignee.progress}
                  size={100}
                  strokeWidth={8}
                  color={colorConfig.color}
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                <div
                  className="p-2 rounded-lg"
                  style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                >
                  <p
                    className="text-lg font-bold font-mono"
                    style={{ color: colorConfig.color }}
                  >
                    {assignee.total}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    전체
                  </p>
                </div>
                <div
                  className="p-2 rounded-lg"
                  style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                >
                  <p
                    className="text-lg font-bold font-mono"
                    style={{ color: 'var(--neon-green)' }}
                  >
                    {assignee.completed}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    완료
                  </p>
                </div>
                <div
                  className="p-2 rounded-lg"
                  style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                >
                  <p
                    className="text-lg font-bold font-mono"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {assignee.pending}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    대기
                  </p>
                </div>
              </div>

              {/* Categories preview */}
              <div className="flex flex-wrap gap-1 mb-4">
                {assignee.categories.slice(0, 3).map((cat) => (
                  <span
                    key={cat}
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      background: `${colorConfig.color}15`,
                      color: 'var(--text-secondary)',
                      border: `1px solid ${colorConfig.color}20`,
                    }}
                  >
                    {cat.length > 8 ? cat.slice(0, 8) + '...' : cat}
                  </span>
                ))}
                {assignee.categories.length > 3 && (
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    +{assignee.categories.length - 3}
                  </span>
                )}
              </div>

              {/* View button */}
              <motion.div
                className="flex items-center justify-center gap-2 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: `${colorConfig.color}15`,
                  border: `1px solid ${colorConfig.color}30`,
                }}
              >
                <span className="text-sm font-medium" style={{ color: colorConfig.color }}>
                  상세 보기
                </span>
                <ArrowRight className="w-4 h-4" style={{ color: colorConfig.color }} />
              </motion.div>
            </GlowCard>
          </Link>
        )
      })}
    </div>
  )
}
