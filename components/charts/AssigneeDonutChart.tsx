'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { AssigneeStats } from '@/lib/supabase'

interface AssigneeDonutChartProps {
  data: AssigneeStats[]
  className?: string
}

// Professional chart color palette using CSS variables
const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
]

export function AssigneeDonutChart({ data, className = '' }: AssigneeDonutChartProps) {
  const chartData = data.map((item, index) => ({
    name: item.assignee,
    value: item.total,
    progress: item.progress,
    completed: item.completed,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }))

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className={`relative animate-fade-in ${className}`}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke="var(--bg-primary)"
                strokeWidth={2}
              />
            ))}
          </Pie>

          <Tooltip
            wrapperStyle={{ zIndex: 1000 }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <p className="font-semibold mb-1" style={{ color: data.color }}>
                      {data.name}
                    </p>
                    <div className="space-y-0.5 text-sm">
                      <p style={{ color: 'var(--text-secondary)' }}>
                        담당 태스크: <span className="font-mono font-medium">{data.value}개</span>
                      </p>
                      <p style={{ color: 'var(--text-secondary)' }}>
                        진행률: <span className="font-mono font-medium">{data.progress}%</span>
                      </p>
                      <p style={{ color: 'var(--text-secondary)' }}>
                        완료: <span className="font-mono">{data.completed}개</span>
                      </p>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span
          className="text-4xl font-bold font-mono"
          style={{ color: 'var(--text-primary)' }}
        >
          {total}
        </span>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Total Tasks
        </span>
      </div>
    </div>
  )
}
