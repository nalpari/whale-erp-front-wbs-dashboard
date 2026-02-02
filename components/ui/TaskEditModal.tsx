'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { X, Calendar, CalendarDays, Percent, Loader2, Flag, LayoutGrid } from 'lucide-react'
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
  onSave: (taskId: number, progress: number, status: TaskStatus, startDate: string | null, dueDate: string | null, menuName: string | null) => Promise<void>
  /** @deprecated color prop is no longer used */
  color?: string
  anchorRect?: AnchorRect | null
}

export function TaskEditModal({ task, isOpen, onClose, onSave, anchorRect }: TaskEditModalProps) {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<TaskStatus>('대기중')
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [menuName, setMenuName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (task) {
      setProgress(task.progress)
      setStatus(task.status)
      setStartDate(task.start_date ? task.start_date.split('T')[0] : '')
      setDueDate(task.due_date ? task.due_date.split('T')[0] : '')
      setMenuName(task.menu_name || '')
      setError(null)
    }
  }, [task])

  const handleSave = async () => {
    if (!task) return

    setIsLoading(true)
    setError(null)

    try {
      await onSave(task.id, progress, status, startDate || null, dueDate || null, menuName || null)
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
    const left = anchorRect.left
    let top = anchorRect.top

    // 모달이 화면 아래로 벗어나면 위로 조정
    if (top + MODAL_HEIGHT > viewportHeight - padding) {
      top = Math.max(padding, viewportHeight - MODAL_HEIGHT - padding)
    }

    return { top, left }
  }, [anchorRect])

  const inputStyle = {
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
  }

  return (
    <AnimatePresence>
      {isOpen && task && (
        <div
          className={`fixed inset-0 z-50 ${!modalPosition ? 'flex items-center justify-center' : ''} p-4 animate-fade-in`}
          style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
          onClick={handleBackdropClick}
        >
          <div
            ref={modalRef}
            className="w-full max-w-md rounded-xl overflow-hidden animate-slide-up"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
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
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg transition-colors hover:bg-[var(--bg-tertiary)]"
                style={{
                  color: 'var(--text-muted)',
                }}
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
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
                  <Percent className="w-4 h-4" style={{ color: 'var(--accent)' }} />
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
                      background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${progress}%, var(--bg-tertiary) ${progress}%, var(--bg-tertiary) 100%)`,
                    }}
                  />
                  <div
                    className="w-16 text-center py-2 rounded-lg font-mono font-medium text-sm"
                    style={{
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border)',
                      color: 'var(--accent)',
                    }}
                  >
                    {progress}%
                  </div>
                </div>
              </div>

              {/* Status Select */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  <Flag className="w-4 h-4" style={{ color: 'var(--info)' }} />
                  상태
                </label>
                <select
                  value={status}
                  onChange={(e) => {
                    const newStatus = e.target.value as TaskStatus
                    setStatus(newStatus)
                    // 상태에 따라 진행률 자동 변경
                    if (newStatus === '완료') {
                      setProgress(100)
                    } else if (newStatus === '대기중' || newStatus === '버그' || newStatus === '이슈' || newStatus === '취소') {
                      setProgress(0)
                    }
                  }}
                  className="w-full px-4 py-3 rounded-lg outline-none transition-all cursor-pointer focus:ring-2 focus:ring-[var(--accent)]"
                  style={inputStyle}
                >
                  {TASK_STATUS_LIST.map((s) => (
                    <option key={s} value={s} style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Menu Name Input */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  <LayoutGrid className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                  메뉴명
                </label>
                <input
                  type="text"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  placeholder="메뉴명을 입력하세요"
                  className="w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2 focus:ring-[var(--accent)]"
                  style={inputStyle}
                />
              </div>

              {/* Date Inputs */}
              <div className="grid grid-cols-2 gap-4">
                {/* Start Date Input */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    <CalendarDays className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                    시작일
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2 focus:ring-[var(--accent)]"
                    style={inputStyle}
                  />
                </div>

                {/* Due Date Input */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    <Calendar className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                    마감일
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2 focus:ring-[var(--accent)]"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div
                  className="p-3 rounded-lg text-sm"
                  style={{
                    background: 'var(--error-bg)',
                    border: '1px solid var(--error)',
                    color: 'var(--error)',
                  }}
                >
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="p-6 flex gap-3"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors hover:bg-[var(--bg-tertiary)]"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: 'var(--accent)',
                  color: 'white',
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
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
