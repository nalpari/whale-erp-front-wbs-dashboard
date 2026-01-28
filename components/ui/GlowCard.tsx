'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GlowCardProps {
  children: ReactNode
  className?: string
  /** @deprecated glowColor is no longer used - kept for backward compatibility */
  glowColor?: 'cyan' | 'magenta' | 'purple' | 'pink' | 'blue' | 'green' | 'orange'
  delay?: number
  hover?: boolean
}

export function GlowCard({
  children,
  className = '',
  delay = 0,
  hover = true,
}: GlowCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      className={`card ${hover ? 'card-hover' : ''} ${className}`}
    >
      {children}
    </motion.div>
  )
}
