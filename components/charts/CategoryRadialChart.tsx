'use client'

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

// Professional chart color palette using CSS variables
const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
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
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }))

  return (
    <div className={`animate-fade-in ${className}`}>
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
          <RadialBar
            dataKey="value"
            cornerRadius={10}
            background={{ fill: 'var(--bg-tertiary)' }}
          />

          <Tooltip
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
                    <p className="font-semibold mb-1" style={{ color: data.fill }}>
                      {data.name}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      진행률: <span className="font-mono font-medium">{data.value}%</span>
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
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {chartData.slice(0, 6).map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md"
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: item.fill }}
            />
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              {item.name.length > 8 ? item.name.slice(0, 8) + '...' : item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
