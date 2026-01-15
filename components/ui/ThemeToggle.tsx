'use client'

import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full p-1 transition-colors duration-300"
      style={{
        background: theme === 'dark'
          ? 'linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))'
          : 'linear-gradient(135deg, #fbbf24, #f97316)',
        boxShadow: theme === 'dark'
          ? '0 0 20px rgba(168, 85, 247, 0.4)'
          : '0 0 20px rgba(251, 191, 36, 0.4)',
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="w-5 h-5 rounded-full bg-white flex items-center justify-center"
        animate={{ x: theme === 'dark' ? 0 : 28 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {theme === 'dark' ? (
          <Moon className="w-3 h-3 text-purple-600" />
        ) : (
          <Sun className="w-3 h-3 text-orange-500" />
        )}
      </motion.div>
    </motion.button>
  )
}
