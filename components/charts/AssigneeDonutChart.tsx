'use client'

import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { AssigneeStats } from '@/lib/supabase'

interface AssigneeDonutChartProps {
  data: AssigneeStats[]
  className?: string
}

// 동적 색상 팔레트 - 새 담당자 추가 시 자동 할당
const COLOR_PALETTE = ['#00f5ff', '#a855f7', '#ff00ff', '#ec4899', '#22c55e', '#f97316', '#3b82f6', '#eab308']

export function AssigneeDonutChart({ data, className = '' }: AssigneeDonutChartProps) {
  const chartData = data.map((item, index) => ({
    name: item.assignee,
    value: item.total,
    progress: item.progress,
    completed: item.completed,
    color: COLOR_PALETTE[index % COLOR_PALETTE.length],
  }))

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className={`relative ${className}`}
    >
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <defs>
            {chartData.map((entry, index) => (
              <linearGradient
                key={`grad-${index}`}
                id={`grad-${entry.name}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                <stop offset="100%" stopColor={entry.color} stopOpacity={0.6} />
              </linearGradient>
            ))}
            <filter id="donut-glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
            filter="url(#donut-glow)"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`url(#grad-${entry.name})`}
                stroke={entry.color}
                strokeWidth={2}
              />
            ))}
          </Pie>

          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-xl"
                    style={{
                      background: 'var(--bg-card)',
                      border: `1px solid ${data.color}50`,
                      backdropFilter: 'blur(20px)',
                      boxShadow: `0 0 30px ${data.color}30`,
                    }}
                  >
                    <p className="font-bold text-lg mb-2" style={{ color: data.color }}>
                      {data.name}
                    </p>
                    <div className="space-y-1 text-sm">
                      <p style={{ color: 'var(--text-secondary)' }}>
                        담당 태스크: <span className="font-mono font-bold">{data.value}개</span>
                      </p>
                      <p style={{ color: 'var(--text-secondary)' }}>
                        진행률: <span className="font-mono font-bold">{data.progress}%</span>
                      </p>
                      <p style={{ color: 'var(--text-secondary)' }}>
                        완료: <span className="font-mono">{data.completed}개</span>
                      </p>
                    </div>
                  </motion.div>
                )
              }
              return null
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-4xl font-bold font-mono gradient-text"
        >
          {total}
        </motion.span>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Total Tasks
        </span>
      </div>
    </motion.div>
  )
}
