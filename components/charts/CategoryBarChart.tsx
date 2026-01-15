'use client'

import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { CategoryStats } from '@/lib/supabase'

interface CategoryBarChartProps {
  data: CategoryStats[]
  className?: string
}

const COLORS = [
  '#00f5ff', '#a855f7', '#ff00ff', '#ec4899',
  '#3b82f6', '#10b981', '#f97316', '#eab308',
  '#06b6d4', '#8b5cf6', '#f43f5e', '#84cc16',
]

export function CategoryBarChart({ data, className = '' }: CategoryBarChartProps) {
  const chartData = data
    .sort((a, b) => b.total - a.total)
    .slice(0, 12)
    .map((item, index) => ({
      name: item.category.length > 10 ? item.category.slice(0, 10) + '...' : item.category,
      fullName: item.category,
      total: item.total,
      completed: item.completed,
      pending: item.pending,
      progress: item.progress,
      color: COLORS[index % COLORS.length],
    }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
        >
          <defs>
            {chartData.map((entry, index) => (
              <linearGradient
                key={`bar-grad-${index}`}
                id={`bar-grad-${index}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor={entry.color} stopOpacity={0.8} />
                <stop offset="100%" stopColor={entry.color} stopOpacity={0.4} />
              </linearGradient>
            ))}
            <filter id="bar-glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="rgba(255, 255, 255, 0.05)"
          />

          <XAxis
            type="number"
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
          />

          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
            width={90}
          />

          <Tooltip
            cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      background: 'var(--bg-card)',
                      border: `1px solid ${data.color}50`,
                      backdropFilter: 'blur(20px)',
                      boxShadow: `0 0 30px ${data.color}30`,
                    }}
                  >
                    <p className="font-bold mb-2" style={{ color: data.color }}>
                      {data.fullName}
                    </p>
                    <div className="space-y-1 text-sm">
                      <p style={{ color: 'var(--text-secondary)' }}>
                        전체: <span className="font-mono font-bold">{data.total}개</span>
                      </p>
                      <p style={{ color: 'var(--neon-green)' }}>
                        완료: <span className="font-mono">{data.completed}개</span>
                      </p>
                      <p style={{ color: 'var(--text-muted)' }}>
                        대기: <span className="font-mono">{data.pending}개</span>
                      </p>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />

          <Bar
            dataKey="total"
            radius={[0, 8, 8, 0]}
            filter="url(#bar-glow)"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`url(#bar-grad-${index})`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
