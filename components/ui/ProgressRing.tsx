'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { AnimatedCounter } from './AnimatedCounter'

interface ProgressRingProps {
  progress: number
  size?: number
  strokeWidth?: number
  color?: string
  bgColor?: string
  showPercentage?: boolean
  className?: string
  label?: string
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  color = 'var(--accent)',
  bgColor = 'var(--border)',
  showPercentage = true,
  className = '',
  label,
}: ProgressRingProps) {
  const ref = useRef<SVGSVGElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <svg
        ref={ref}
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={isInView ? { strokeDashoffset: offset } : {}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>

      {/* Center content */}
      {showPercentage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatedCounter
            value={progress}
            suffix="%"
            className="text-2xl font-bold font-mono"
            style={{ color: 'var(--text-primary)' }}
          />
          {label && (
            <span className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

interface MultiProgressRingProps {
  segments: Array<{
    value: number
    color: string
    label: string
  }>
  size?: number
  strokeWidth?: number
  className?: string
}

export function MultiProgressRing({
  segments,
  size = 200,
  strokeWidth = 12,
  className = '',
}: MultiProgressRingProps) {
  const ref = useRef<SVGSVGElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const total = segments.reduce((sum, s) => sum + s.value, 0)

  // Pre-compute offsets for each segment
  const segmentOffsets = segments.reduce<number[]>((acc, segment, index) => {
    const prevOffset = index === 0 ? 0 : acc[index - 1] + (segments[index - 1].value / total) * circumference
    acc.push(prevOffset)
    return acc
  }, [])

  return (
    <div className={`relative inline-flex ${className}`}>
      <svg ref={ref} width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />

        {/* Segments */}
        {segments.map((segment, index) => {
          const segmentLength = (segment.value / total) * circumference
          const offset = segmentOffsets[index]

          return (
            <motion.circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
              strokeDashoffset={-offset}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            />
          )
        })}
      </svg>

      {/* Center total */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatedCounter
          value={total}
          className="text-3xl font-bold font-mono"
          style={{ color: 'var(--text-primary)' }}
        />
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Total Tasks
        </span>
      </div>
    </div>
  )
}
