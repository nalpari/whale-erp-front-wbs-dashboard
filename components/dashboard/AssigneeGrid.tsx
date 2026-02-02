'use client'

import Link from 'next/link'
import { User, ArrowRight } from 'lucide-react'
import { GlowCard } from '@/components/ui/GlowCard'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { AssigneeStats } from '@/lib/supabase'
import { getAssigneeColorConfig } from '@/lib/assignee-colors'

interface AssigneeGridProps {
  data: AssigneeStats[]
}

export function AssigneeGrid({ data }: AssigneeGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {data.map((assignee, index) => {
        const colorConfig = getAssigneeColorConfig(assignee.assignee)
        const color = colorConfig.color

        return (
          <Link
            key={assignee.assignee}
            href={`/assignee/${encodeURIComponent(assignee.assignee)}`}
          >
            <GlowCard
              delay={index * 0.08}
              className="p-6 cursor-pointer group h-full"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center relative"
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <User className="w-6 h-6" style={{ color }} />

                  {/* Static online indicator */}
                  <div
                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                    style={{
                      background: 'var(--success)',
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className="font-bold text-lg truncate"
                    style={{ color: 'var(--text-primary)' }}
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
                  color={color}
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                <div
                  className="p-2 rounded-lg"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  <p
                    className="text-lg font-bold font-mono"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {assignee.total}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    전체
                  </p>
                </div>
                <div
                  className="p-2 rounded-lg"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  <p
                    className="text-lg font-bold font-mono"
                    style={{ color: 'var(--success)' }}
                  >
                    {assignee.completed}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    완료
                  </p>
                </div>
                <div
                  className="p-2 rounded-lg"
                  style={{ background: 'var(--bg-tertiary)' }}
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
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {cat.length > 8 ? cat.slice(0, 8) + '...' : cat}
                  </span>
                ))}
                {assignee.categories.length > 3 && (
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    +{assignee.categories.length - 3}
                  </span>
                )}
              </div>

              {/* View button */}
              <div
                className="flex items-center justify-center gap-2 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                }}
              >
                <span className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
                  상세 보기
                </span>
                <ArrowRight className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              </div>
            </GlowCard>
          </Link>
        )
      })}
    </div>
  )
}
