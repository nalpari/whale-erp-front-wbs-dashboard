'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GlowCardProps {
  children: ReactNode
  className?: string
  glowColor?: 'cyan' | 'magenta' | 'purple' | 'pink' | 'blue' | 'green' | 'orange'
  delay?: number
  hover?: boolean
}

const glowColors = {
  cyan: {
    border: 'rgba(0, 245, 255, 0.3)',
    glow: '0 0 30px rgba(0, 245, 255, 0.3), 0 0 60px rgba(0, 245, 255, 0.1)',
    hoverGlow: '0 0 40px rgba(0, 245, 255, 0.5), 0 0 80px rgba(0, 245, 255, 0.2)',
  },
  magenta: {
    border: 'rgba(255, 0, 255, 0.3)',
    glow: '0 0 30px rgba(255, 0, 255, 0.3), 0 0 60px rgba(255, 0, 255, 0.1)',
    hoverGlow: '0 0 40px rgba(255, 0, 255, 0.5), 0 0 80px rgba(255, 0, 255, 0.2)',
  },
  purple: {
    border: 'rgba(168, 85, 247, 0.3)',
    glow: '0 0 30px rgba(168, 85, 247, 0.3), 0 0 60px rgba(168, 85, 247, 0.1)',
    hoverGlow: '0 0 40px rgba(168, 85, 247, 0.5), 0 0 80px rgba(168, 85, 247, 0.2)',
  },
  pink: {
    border: 'rgba(236, 72, 153, 0.3)',
    glow: '0 0 30px rgba(236, 72, 153, 0.3), 0 0 60px rgba(236, 72, 153, 0.1)',
    hoverGlow: '0 0 40px rgba(236, 72, 153, 0.5), 0 0 80px rgba(236, 72, 153, 0.2)',
  },
  blue: {
    border: 'rgba(59, 130, 246, 0.3)',
    glow: '0 0 30px rgba(59, 130, 246, 0.3), 0 0 60px rgba(59, 130, 246, 0.1)',
    hoverGlow: '0 0 40px rgba(59, 130, 246, 0.5), 0 0 80px rgba(59, 130, 246, 0.2)',
  },
  green: {
    border: 'rgba(16, 185, 129, 0.3)',
    glow: '0 0 30px rgba(16, 185, 129, 0.3), 0 0 60px rgba(16, 185, 129, 0.1)',
    hoverGlow: '0 0 40px rgba(16, 185, 129, 0.5), 0 0 80px rgba(16, 185, 129, 0.2)',
  },
  orange: {
    border: 'rgba(249, 115, 22, 0.3)',
    glow: '0 0 30px rgba(249, 115, 22, 0.3), 0 0 60px rgba(249, 115, 22, 0.1)',
    hoverGlow: '0 0 40px rgba(249, 115, 22, 0.5), 0 0 80px rgba(249, 115, 22, 0.2)',
  },
}

export function GlowCard({
  children,
  className = '',
  glowColor = 'cyan',
  delay = 0,
  hover = true,
}: GlowCardProps) {
  const colors = glowColors[glowColor]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { scale: 1.02, y: -5 } : undefined}
      className={`relative rounded-2xl overflow-hidden ${className}`}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${colors.border}`,
        boxShadow: colors.glow,
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Animated gradient border */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${colors.border}, transparent, ${colors.border})`,
          padding: '1px',
        }}
      />

      {/* Corner accents */}
      <div
        className="absolute top-0 left-0 w-8 h-8 border-t border-l rounded-tl-2xl"
        style={{ borderColor: colors.border }}
      />
      <div
        className="absolute top-0 right-0 w-8 h-8 border-t border-r rounded-tr-2xl"
        style={{ borderColor: colors.border }}
      />
      <div
        className="absolute bottom-0 left-0 w-8 h-8 border-b border-l rounded-bl-2xl"
        style={{ borderColor: colors.border }}
      />
      <div
        className="absolute bottom-0 right-0 w-8 h-8 border-b border-r rounded-br-2xl"
        style={{ borderColor: colors.border }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Hover overlay */}
      {hover && (
        <motion.div
          className="absolute inset-0 opacity-0 pointer-events-none"
          whileHover={{ opacity: 1 }}
          style={{
            background: `radial-gradient(circle at center, ${colors.border} 0%, transparent 70%)`,
          }}
        />
      )}
    </motion.div>
  )
}
