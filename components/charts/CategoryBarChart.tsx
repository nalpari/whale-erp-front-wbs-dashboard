'use client'

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

// Professional chart color palette using CSS variables
const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
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
      color: CHART_COLORS[index % CHART_COLORS.length],
    }))

  return (
    <div className={`animate-fade-in ${className}`}>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="var(--border)"
          />

          <XAxis
            type="number"
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--border)' }}
          />

          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--border)' }}
            width={90}
          />

          <Tooltip
            cursor={{ fill: 'var(--bg-tertiary)', opacity: 0.5 }}
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
                      {data.fullName}
                    </p>
                    <div className="space-y-0.5 text-sm">
                      <p style={{ color: 'var(--text-secondary)' }}>
                        전체: <span className="font-mono font-medium">{data.total}개</span>
                      </p>
                      <p style={{ color: 'var(--success)' }}>
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
            radius={[0, 6, 6, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                opacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
