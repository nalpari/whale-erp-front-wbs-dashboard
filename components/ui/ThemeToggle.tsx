'use client'

import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full p-1 transition-colors duration-200"
      style={{
        background: theme === 'dark' ? 'var(--bg-tertiary)' : 'var(--bg-tertiary)',
        border: '1px solid var(--border)',
      }}
    >
      <motion.div
        className="w-5 h-5 rounded-full flex items-center justify-center"
        style={{
          background: theme === 'dark' ? 'var(--accent)' : 'var(--warning)',
        }}
        animate={{ x: theme === 'dark' ? 0 : 26 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {theme === 'dark' ? (
          <Moon className="w-3 h-3 text-white" />
        ) : (
          <Sun className="w-3 h-3 text-white" />
        )}
      </motion.div>
    </button>
  )
}
