'use client'

import { motion } from 'framer-motion'
import { LayoutDashboard, Activity } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface HeaderProps {
  title?: string
  subtitle?: string
}

export function Header({ title = 'WBS Dashboard', subtitle }: HeaderProps) {
  const now = new Date()
  const dateStr = now.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 glass"
      style={{
        background: 'var(--bg-header)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <div className="max-w-[1600px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <Link href="/" className="flex items-center gap-4 group">
            <motion.div
              className="relative w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))',
                boxShadow: '0 0 30px rgba(0, 245, 255, 0.3)',
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <LayoutDashboard className="w-6 h-6 text-white" />

              {/* Animated ring */}
              <motion.div
                className="absolute inset-0 rounded-xl"
                style={{
                  border: '2px solid transparent',
                  borderImage: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-purple)) 1',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>

            <div>
              <h1 className="text-xl font-bold tracking-tight">
                <span className="gradient-text">{title}</span>
              </h1>
              {subtitle && (
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {subtitle}
                </p>
              )}
            </div>
          </Link>

          {/* Right section */}
          <div className="flex items-center gap-6">
            {/* Live indicator */}
            <div className="hidden md:flex items-center gap-2">
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{ background: 'var(--neon-green)' }}
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
                LIVE
              </span>
            </div>

            {/* Date */}
            <div className="hidden lg:block text-right">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Whale ERP
              </p>
              <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                {dateStr}
              </p>
            </div>

            {/* Activity icon */}
            <motion.div
              className="w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer"
              style={{
                background: 'var(--bg-glass)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              whileHover={{
                scale: 1.05,
                borderColor: 'var(--neon-cyan)',
                boxShadow: '0 0 20px rgba(0, 245, 255, 0.3)',
              }}
            >
              <Activity className="w-5 h-5" style={{ color: 'var(--neon-cyan)' }} />
            </motion.div>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </motion.header>
  )
}
