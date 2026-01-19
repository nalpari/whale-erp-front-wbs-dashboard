'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Calendar,
  CalendarDays,
  Percent,
  Loader2,
  FileText,
  User,
  FolderOpen,
  StickyNote,
  Flag,
  LayoutGrid,
} from 'lucide-react'
import { createTask, CreateTaskInput, TASK_STATUS_LIST, TaskStatus } from '@/lib/supabase'

interface TaskCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function TaskCreateModal({ isOpen, onClose, onSuccess }: TaskCreateModalProps) {
  const [formData, setFormData] = useState<CreateTaskInput>({
    category: '',
    task_title: '',
    description: '',
    assignee: '',
    start_date: '',
    due_date: '',
    progress: 0,
    status: '대기중',
    memo: '',
    menu_name: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: keyof CreateTaskInput, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    // 유효성 검사
    if (!formData.category.trim()) {
      setError('카테고리를 입력해주세요')
      return
    }
    if (!formData.task_title.trim()) {
      setError('태스크 제목을 입력해주세요')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await createTask({
        ...formData,
        description: formData.description || null,
        assignee: formData.assignee || null,
        start_date: formData.start_date || null,
        due_date: formData.due_date || null,
        memo: formData.memo || null,
        menu_name: formData.menu_name || null,
      })

      // 성공 시 폼 초기화
      setFormData({
        category: '',
        task_title: '',
        description: '',
        assignee: '',
        start_date: '',
        due_date: '',
        progress: 0,
        status: '대기중',
        memo: '',
        menu_name: '',
      })

      onSuccess?.()
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

  const color = 'var(--neon-cyan)'

  const inputStyle = {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'var(--text-primary)',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, type: 'spring', damping: 25 }}
            className="w-full max-w-xl rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
            style={{
              background: 'var(--bg-card)',
              border: `1px solid ${color}30`,
              boxShadow: `0 0 60px ${color}20`,
            }}
          >
            {/* Header */}
            <div
              className="p-6 relative flex-shrink-0"
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
                새 태스크 등록
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                프로젝트에 새로운 태스크를 추가합니다
              </p>
            </div>

            {/* Content - Scrollable */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Menu Name */}
              <div className="space-y-2">
                <label
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <LayoutGrid className="w-4 h-4" style={{ color: 'var(--neon-cyan)' }} />
                  메뉴명
                </label>
                <input
                  type="text"
                  value={formData.menu_name ?? ''}
                  onChange={(e) => handleChange('menu_name', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all focus:ring-2"
                  style={{ ...inputStyle, '--tw-ring-color': color } as React.CSSProperties}
                  placeholder="예: Master Data 관리, 직원 관리"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <FolderOpen className="w-4 h-4" style={{ color: 'var(--neon-purple)' }} />
                  카테고리 <span style={{ color: 'var(--neon-pink)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all focus:ring-2"
                  style={{ ...inputStyle, '--tw-ring-color': color } as React.CSSProperties}
                  placeholder="예: 프론트엔드, 백엔드"
                />
              </div>

              {/* Task Title */}
              <div className="space-y-2">
                <label
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <FileText className="w-4 h-4" style={{ color }} />
                  태스크 제목 <span style={{ color: 'var(--neon-pink)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.task_title}
                  onChange={(e) => handleChange('task_title', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all focus:ring-2"
                  style={{ ...inputStyle, '--tw-ring-color': color } as React.CSSProperties}
                  placeholder="태스크 제목을 입력하세요"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <FileText className="w-4 h-4" style={{ color: 'var(--neon-magenta)' }} />
                  설명
                </label>
                <textarea
                  value={formData.description ?? ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all focus:ring-2 resize-none"
                  style={{ ...inputStyle, '--tw-ring-color': color } as React.CSSProperties}
                  placeholder="태스크에 대한 상세 설명 (선택사항)"
                />
              </div>

              {/* Assignee */}
              <div className="space-y-2">
                <label
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <User className="w-4 h-4" style={{ color: 'var(--neon-green)' }} />
                  담당자
                </label>
                <input
                  type="text"
                  value={formData.assignee ?? ''}
                  onChange={(e) => handleChange('assignee', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all focus:ring-2"
                  style={{ ...inputStyle, '--tw-ring-color': color } as React.CSSProperties}
                  placeholder="담당자 이름"
                />
              </div>

              {/* Date Inputs */}
              <div className="grid grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="space-y-2">
                  <label
                    className="flex items-center gap-2 text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <CalendarDays className="w-4 h-4" style={{ color }} />
                    시작일
                  </label>
                  <input
                    type="date"
                    value={formData.start_date ?? ''}
                    onChange={(e) => handleChange('start_date', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                    style={inputStyle}
                  />
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <label
                    className="flex items-center gap-2 text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Calendar className="w-4 h-4" style={{ color: 'var(--neon-orange)' }} />
                    마감일
                  </label>
                  <input
                    type="date"
                    value={formData.due_date ?? ''}
                    onChange={(e) => handleChange('due_date', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-3">
                <label
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Percent className="w-4 h-4" style={{ color }} />
                  진행률
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={formData.progress}
                    onChange={(e) => handleChange('progress', Number(e.target.value))}
                    className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${color} 0%, ${color} ${formData.progress}%, rgba(255,255,255,0.1) ${formData.progress}%, rgba(255,255,255,0.1) 100%)`,
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
                    {formData.progress}%
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Flag className="w-4 h-4" style={{ color: 'var(--neon-magenta)' }} />
                  상태
                </label>
                <select
                  value={formData.status ?? '대기중'}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all cursor-pointer"
                  style={inputStyle}
                >
                  {TASK_STATUS_LIST.map((s) => (
                    <option key={s} value={s} style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Memo */}
              <div className="space-y-2">
                <label
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <StickyNote className="w-4 h-4" style={{ color: 'var(--neon-pink)' }} />
                  메모
                </label>
                <textarea
                  value={formData.memo ?? ''}
                  onChange={(e) => handleChange('memo', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all focus:ring-2 resize-none"
                  style={{ ...inputStyle, '--tw-ring-color': color } as React.CSSProperties}
                  placeholder="추가 메모 (선택사항)"
                />
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
              className="p-6 flex gap-3 flex-shrink-0"
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
                onClick={handleSubmit}
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
                    등록 중...
                  </>
                ) : (
                  '등록'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
