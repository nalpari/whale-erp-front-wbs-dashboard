'use client'

import { motion } from 'framer-motion'

interface CategoryData {
  category: string
  total: number
  completed: number
  pending: number
  progress: number
}

interface AssigneeCategoryChartProps {
  data: CategoryData[]
  color: string
}

export function AssigneeCategoryChart({ data, color }: AssigneeCategoryChartProps) {
  const maxTotal = Math.max(...data.map(d => d.total))

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <motion.div
          key={item.category}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="space-y-2"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <span
              className="text-sm font-medium truncate max-w-[60%]"
              style={{ color: 'var(--text-primary)' }}
            >
              {item.category}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                {item.completed}/{item.total}
              </span>
              <span
                className="text-sm font-bold font-mono"
                style={{
                  color: item.progress === 100 ? 'var(--neon-green)' : color,
                }}
              >
                {item.progress}%
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-8 rounded-lg overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
            {/* Background bar (total tasks relative to max) */}
            <motion.div
              className="absolute inset-y-0 left-0 rounded-lg"
              style={{ background: 'rgba(255, 255, 255, 0.05)' }}
              initial={{ width: 0 }}
              animate={{ width: `${(item.total / maxTotal) * 100}%` }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            />

            {/* Progress bar */}
            <motion.div
              className="absolute inset-y-0 left-0 rounded-lg"
              style={{
                background: item.progress === 100
                  ? 'linear-gradient(90deg, var(--neon-green), #059669)'
                  : `linear-gradient(90deg, ${color}, var(--neon-purple))`,
                boxShadow: item.progress === 100
                  ? '0 0 20px rgba(16, 185, 129, 0.4)'
                  : `0 0 20px ${color}40`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${(item.total / maxTotal) * (item.progress / 100) * 100}%` }}
              transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
            />

            {/* Task count inside bar */}
            <div className="absolute inset-0 flex items-center px-3">
              <span
                className="text-xs font-mono font-bold"
                style={{ color: 'rgba(255, 255, 255, 0.9)' }}
              >
                {item.total}개
              </span>
            </div>
          </div>
        </motion.div>
      ))}

      {data.length === 0 && (
        <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
          데이터가 없습니다
        </div>
      )}
    </div>
  )
}
