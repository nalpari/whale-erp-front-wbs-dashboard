'use client'

import { motion } from 'framer-motion'
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { CategoryStats } from '@/lib/supabase'

interface CategoryRadialChartProps {
  data: CategoryStats[]
  className?: string
}

const COLORS = [
  '#00f5ff', '#a855f7', '#ff00ff', '#ec4899',
  '#3b82f6', '#10b981', '#f97316', '#eab308',
  '#06b6d4', '#8b5cf6', '#f43f5e', '#84cc16',
  '#14b8a6', '#6366f1', '#fb923c', '#facc15',
  '#22d3ee', '#c084fc', '#f472b6', '#34d399',
]

export function CategoryRadialChart({ data, className = '' }: CategoryRadialChartProps) {
  const chartData = data
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 10)
    .map((item, index) => ({
      name: item.category,
      value: item.progress,
      total: item.total,
      completed: item.completed,
      fill: COLORS[index % COLORS.length],
    }))

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      <ResponsiveContainer width="100%" height={400}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="20%"
          outerRadius="90%"
          barSize={15}
          data={chartData}
          startAngle={180}
          endAngle={-180}
        >
          <defs>
            {chartData.map((entry, index) => (
              <linearGradient
                key={`gradient-${index}`}
                id={`gradient-${index}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor={entry.fill} stopOpacity={1} />
                <stop offset="100%" stopColor={entry.fill} stopOpacity={0.5} />
              </linearGradient>
            ))}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <RadialBar
            dataKey="value"
            cornerRadius={10}
            background={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            filter="url(#glow)"
          />

          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: `0 0 30px ${data.fill}40`,
                    }}
                  >
                    <p className="font-bold mb-2" style={{ color: data.fill }}>
                      {data.name}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      진행률: <span className="font-mono font-bold">{data.value}%</span>
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      완료: <span className="font-mono">{data.completed}/{data.total}</span>
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
        </RadialBarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        {chartData.slice(0, 6).map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: `${item.fill}15`,
              border: `1px solid ${item.fill}30`,
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: item.fill, boxShadow: `0 0 10px ${item.fill}` }}
            />
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              {item.name.length > 8 ? item.name.slice(0, 8) + '...' : item.name}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
