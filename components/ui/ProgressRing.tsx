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
  color = 'var(--neon-cyan)',
  bgColor = 'rgba(255, 255, 255, 0.1)',
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

        {/* Gradient definition */}
        <defs>
          <linearGradient id={`gradient-${progress}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--neon-cyan)" />
            <stop offset="100%" stopColor="var(--neon-purple)" />
          </linearGradient>

          {/* Glow filter */}
          <filter id={`glow-${progress}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#gradient-${progress})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={isInView ? { strokeDashoffset: offset } : {}}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          filter={`url(#glow-${progress})`}
        />

        {/* Animated dot at the end */}
        {progress > 0 && (
          <motion.circle
            cx={size / 2 + radius * Math.cos((progress / 100) * 2 * Math.PI - Math.PI / 2)}
            cy={size / 2 + radius * Math.sin((progress / 100) * 2 * Math.PI - Math.PI / 2)}
            r={strokeWidth / 2 + 2}
            fill="var(--neon-cyan)"
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ duration: 0.3, delay: 1.5 }}
            filter={`url(#glow-${progress})`}
          />
        )}
      </svg>

      {/* Center content */}
      {showPercentage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatedCounter
            value={progress}
            suffix="%"
            className="text-2xl font-bold font-mono"
            style={{ color }}
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

  let currentOffset = 0

  return (
    <div className={`relative inline-flex ${className}`}>
      <svg ref={ref} width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={strokeWidth}
        />

        {/* Segments */}
        {segments.map((segment, index) => {
          const segmentLength = (segment.value / total) * circumference
          const offset = currentOffset
          currentOffset += segmentLength

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
              transition={{ duration: 0.5, delay: index * 0.2 }}
              style={{
                filter: `drop-shadow(0 0 6px ${segment.color})`,
              }}
            />
          )
        })}
      </svg>

      {/* Center total */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatedCounter
          value={total}
          className="text-3xl font-bold font-mono gradient-text"
        />
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Total Tasks
        </span>
      </div>
    </div>
  )
}
