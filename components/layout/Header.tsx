'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { LayoutDashboard, Activity, Plus, FileText, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { TaskCreateModal } from '@/components/ui/TaskCreateModal'

type ReloadInterval = 'off' | '1min' | '3min' | '5min'

const reloadConfig: Record<ReloadInterval, { label: string; color: string; ms: number }> = {
  '1min': { label: '1분', color: 'var(--success)', ms: 60000 },
  '3min': { label: '3분', color: 'var(--accent)', ms: 180000 },
  '5min': { label: '5분', color: 'var(--warning)', ms: 300000 },
  'off': { label: 'OFF', color: 'var(--text-muted)', ms: 0 },
}

const reloadOrder: ReloadInterval[] = ['1min', '3min', '5min', 'off']

interface HeaderProps {
  title?: string
  subtitle?: string
}

export function Header({ title = 'WBS Dashboard', subtitle }: HeaderProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [reloadInterval, setReloadInterval] = useState<ReloadInterval>('off')
  const router = useRouter()
  const pathname = usePathname()

  const handleReload = useCallback(() => {
    router.refresh()
  }, [router])

  // 자동 새로고침 로직
  useEffect(() => {
    const config = reloadConfig[reloadInterval]
    if (config.ms === 0) return

    const intervalId = setInterval(() => {
      handleReload()
    }, config.ms)

    return () => clearInterval(intervalId)
  }, [reloadInterval, handleReload])

  const toggleReload = () => {
    const currentIndex = reloadOrder.indexOf(reloadInterval)
    const nextIndex = (currentIndex + 1) % reloadOrder.length
    setReloadInterval(reloadOrder[nextIndex])
  }

  const now = new Date()
  const dateStr = now.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  const handleTaskCreated = () => {
    router.refresh()
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50"
      style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="max-w-[1600px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <Link href="/" className="flex items-center gap-4 group">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'var(--accent)',
              }}
            >
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {subtitle}
                </p>
              )}
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1 ml-8">
            <Link href="/">
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                style={{
                  background: pathname === '/' ? 'var(--bg-tertiary)' : 'transparent',
                  color: pathname === '/' ? 'var(--accent)' : 'var(--text-secondary)',
                }}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>대시보드</span>
              </div>
            </Link>
            <Link href="/screen-designs">
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                style={{
                  background: pathname === '/screen-designs' ? 'var(--bg-tertiary)' : 'transparent',
                  color: pathname === '/screen-designs' ? 'var(--accent)' : 'var(--text-secondary)',
                }}
              >
                <FileText className="w-4 h-4" />
                <span>화면설계서</span>
              </div>
            </Link>
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-4">
            {/* Reload Toggle Button */}
            <button
              onClick={toggleReload}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm transition-colors"
              style={{
                background: 'var(--bg-tertiary)',
                border: `1px solid ${reloadConfig[reloadInterval].color}`,
                color: reloadConfig[reloadInterval].color,
              }}
            >
              <RefreshCw className={`w-4 h-4 ${reloadInterval !== 'off' ? 'animate-spin' : ''}`} style={{ animationDuration: '2s' }} />
              <span>{reloadConfig[reloadInterval].label}</span>
            </button>

            {/* Date */}
            <div className="hidden lg:block text-right">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Whale ERP
              </p>
              <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                {dateStr}
              </p>
            </div>

            {/* Add Task Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                background: 'var(--accent)',
                color: 'white',
              }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Task 등록</span>
            </button>

            {/* Activity icon */}
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
              }}
            >
              <Activity className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Task Create Modal */}
      <TaskCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleTaskCreated}
      />
    </motion.header>
  )
}
