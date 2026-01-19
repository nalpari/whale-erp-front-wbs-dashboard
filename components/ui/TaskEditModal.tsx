'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, CalendarDays, Percent, Loader2, Flag } from 'lucide-react'
import { Task, TaskStatus, TASK_STATUS_LIST } from '@/lib/supabase'

interface AnchorRect {
  top: number
  left: number
  width: number
  height: number
}

interface TaskEditModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onSave: (taskId: number, progress: number, status: TaskStatus, startDate: string | null, dueDate: string | null) => Promise<void>
  color?: string
  anchorRect?: AnchorRect | null
}

export function TaskEditModal({ task, isOpen, onClose, onSave, color = 'var(--neon-cyan)', anchorRect }: TaskEditModalProps) {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<TaskStatus>('대기중')
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (task) {
      setProgress(task.progress)
      setStatus(task.status)
      setStartDate(task.start_date ? task.start_date.split('T')[0] : '')
      setDueDate(task.due_date ? task.due_date.split('T')[0] : '')
      setError(null)
    }
  }, [task])

  const handleSave = async () => {
    if (!task) return

    setIsLoading(true)
    setError(null)

    try {
      await onSave(task.id, progress, status, startDate || null, dueDate || null)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const modalRef = useRef<HTMLDivElement>(null)
  const MODAL_WIDTH = 400
  const MODAL_HEIGHT = 480

  const modalPosition = useMemo(() => {
    if (!anchorRect) return null

    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800
    const padding = 16

    // 태스크 아이템의 왼쪽 위치에 맞춤
    let left = anchorRect.left
    let top = anchorRect.top

    // 모달이 화면 아래로 벗어나면 위로 조정
    if (top + MODAL_HEIGHT > viewportHeight - padding) {
      top = Math.max(padding, viewportHeight - MODAL_HEIGHT - padding)
    }

    return { top, left }
  }, [anchorRect])

  return (
    <AnimatePresence>
      {isOpen && task && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`fixed inset-0 z-50 ${!modalPosition ? 'flex items-center justify-center' : ''} p-4`}
          style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}
          onClick={handleBackdropClick}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, type: 'spring', damping: 25 }}
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{
              background: 'var(--bg-card)',
              border: `1px solid ${color}30`,
              boxShadow: `0 0 60px ${color}20`,
              ...(modalPosition && {
                position: 'absolute',
                top: modalPosition.top,
                left: modalPosition.left,
                width: MODAL_WIDTH,
              }),
            }}
          >
            {/* Header */}
            <div
              className="p-6 relative"
              style={{
                background: `linear-gradient(135deg, ${color}15, transparent)`,
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg transition-all hover:scale-110"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-muted)',
                }}
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                태스크 수정
              </h2>
              <p className="text-sm mt-1 truncate pr-10" style={{ color: 'var(--text-muted)' }}>
                {task.task_title}
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Progress Input */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  <Percent className="w-4 h-4" style={{ color }} />
                  진행률
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${color} 0%, ${color} ${progress}%, rgba(255,255,255,0.1) ${progress}%, rgba(255,255,255,0.1) 100%)`,
                    }}
                  />
                  <div
                    className="w-16 text-center py-2 rounded-lg font-mono font-bold"
                    style={{
                      background: `${color}15`,
                      border: `1px solid ${color}30`,
                      color,
                    }}
                  >
                    {progress}%
                  </div>
                </div>
              </div>

              {/* Status Select */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  <Flag className="w-4 h-4" style={{ color: 'var(--neon-magenta)' }} />
                  상태
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all cursor-pointer"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {TASK_STATUS_LIST.map((s) => (
                    <option key={s} value={s} style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Inputs */}
              <div className="grid grid-cols-2 gap-4">
                {/* Start Date Input */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    <CalendarDays className="w-4 h-4" style={{ color }} />
                    시작일
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                {/* Due Date Input */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    <Calendar className="w-4 h-4" style={{ color: 'var(--neon-orange)' }} />
                    마감일
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div
                  className="p-3 rounded-lg text-sm"
                  style={{
                    background: 'rgba(255, 0, 100, 0.1)',
                    border: '1px solid rgba(255, 0, 100, 0.3)',
                    color: 'var(--neon-pink)',
                  }}
                >
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="p-6 flex gap-3"
              style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}
            >
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02]"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'var(--text-secondary)',
                }}
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${color}, ${color}80)`,
                  color: 'var(--bg-primary)',
                  boxShadow: `0 0 20px ${color}40`,
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  '저장'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
