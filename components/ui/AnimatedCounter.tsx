'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useSpring, useTransform } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
  suffix?: string
  prefix?: string
  decimals?: number
  style?: React.CSSProperties
}

export function AnimatedCounter({
  value,
  duration = 1,
  className = '',
  suffix = '',
  prefix = '',
  decimals = 0,
  style,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [hasAnimated, setHasAnimated] = useState(false)

  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  })

  const display = useTransform(spring, (current) =>
    current.toFixed(decimals)
  )

  useEffect(() => {
    if (isInView && !hasAnimated) {
      requestAnimationFrame(() => {
        spring.set(value)
        setHasAnimated(true)
      })
    }
  }, [isInView, value, spring, hasAnimated])

  return (
    <motion.span
      ref={ref}
      className={`tabular-nums ${className}`}
      style={style}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </motion.span>
  )
}

interface AnimatedPercentageProps {
  value: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  className?: string
}

export function AnimatedPercentage({
  value,
  size = 'md',
  color = 'var(--accent)',
  className = '',
}: AnimatedPercentageProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
    xl: 'text-8xl',
  }

  return (
    <div className={`font-bold ${sizeClasses[size]} ${className}`}>
      <AnimatedCounter
        value={value}
        suffix="%"
        className="font-mono"
        style={{ color }}
      />
    </div>
  )
}
