'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronDown, Calendar, CalendarDays, Folder, Loader2, Percent, Trash2, Flag, FileText, LayoutGrid, AlignLeft } from 'lucide-react'
import { Task, TaskStatus, TASK_STATUS_LIST, getStatusColor, UpdateTaskInput } from '@/lib/supabase'

interface AssigneeTaskListProps {
  tasks: Task[]
  color: string
  onUpdateField?: (taskId: number, updates: UpdateTaskInput) => Promise<void>
  onDeleteTask?: (taskId: number) => Promise<void>
}

export function AssigneeTaskList({ tasks, color, onUpdateField, onDeleteTask }: AssigneeTaskListProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedTask, setExpandedTask] = useState<number | null>(null)
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null)
  const [updatingFields, setUpdatingFields] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)

  const categories = [...new Set(tasks.map(t => t.category))]

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.task_title.toLowerCase().includes(search.toLowerCase()) ||
      task.description?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !selectedCategory || task.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleFieldUpdate = useCallback(async (taskId: number, field: keyof UpdateTaskInput, value: unknown) => {
    if (!onUpdateField) return

    const fieldKey = `${taskId}-${field}`
    setUpdatingFields(prev => ({ ...prev, [fieldKey]: true }))
    setError(null)

    try {
      await onUpdateField(taskId, { [field]: value })
    } catch (err) {
      setError(err instanceof Error ? err.message : '업데이트 중 오류가 발생했습니다')
    } finally {
      setUpdatingFields(prev => ({ ...prev, [fieldKey]: false }))
    }
  }, [onUpdateField])

  const handleInputKeyDown = useCallback((
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    taskId: number,
    field: keyof UpdateTaskInput,
    value: unknown
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleFieldUpdate(taskId, field, value)
    }
  }, [handleFieldUpdate])

  const handleDelete = async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!onDeleteTask) return

    const confirmed = window.confirm(`"${task.task_title}" 태스크를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)
    if (!confirmed) return

    setIsDeletingId(task.id)
    setError(null)

    try {
      await onDeleteTask(task.id)
      setExpandedTask(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다')
    } finally {
      setIsDeletingId(null)
    }
  }

  const isFieldUpdating = (taskId: number, field: string) => updatingFields[`${taskId}-${field}`]

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="태스크 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="appearance-none px-4 py-3 pr-10 rounded-xl outline-none cursor-pointer min-w-[200px]"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="">모든 카테고리</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
            style={{ color: 'var(--text-muted)' }}
          />
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        {filteredTasks.length}개의 태스크
      </p>

      {/* Task List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredTasks.map((task, index) => {
            const isExpanded = expandedTask === task.id

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.02 }}
                className="rounded-xl overflow-hidden cursor-pointer"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: isExpanded ? `1px solid ${color}50` : '1px solid rgba(255, 255, 255, 0.05)',
                }}
                onClick={() => setExpandedTask(isExpanded ? null : task.id)}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Task Number */}
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-mono text-sm font-bold"
                      style={{
                        background: `${color}15`,
                        border: `1px solid ${color}30`,
                        color: color,
                      }}
                    >
                      {task.num}
                    </div>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {task.task_title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        {/* Menu Name Badge */}
                        {task.menu_name && (
                          <span
                            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                            style={{
                              background: 'var(--neon-cyan)15',
                              border: '1px solid var(--neon-cyan)30',
                              color: 'var(--neon-cyan)',
                            }}
                          >
                            <LayoutGrid className="w-3 h-3" />
                            {task.menu_name}
                          </span>
                        )}

                        {/* Category Badge */}
                        <span
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          <Folder className="w-3 h-3" />
                          {task.category}
                        </span>

                        {/* Status Badge */}
                        <span
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium"
                          style={{
                            background: `${getStatusColor(task.status)}15`,
                            border: `1px solid ${getStatusColor(task.status)}30`,
                            color: getStatusColor(task.status),
                          }}
                        >
                          <Flag className="w-3 h-3" />
                          {task.status}
                        </span>

                        {/* Due Date */}
                        {task.due_date && (
                          <span
                            className="inline-flex items-center gap-1 text-xs"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            <Calendar className="w-3 h-3" />
                            {new Date(task.due_date).toLocaleDateString('ko-KR')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="text-right shrink-0">
                      <span
                        className="text-lg font-bold font-mono"
                        style={{
                          color: task.progress === 100 ? 'var(--neon-green)' :
                            task.progress > 0 ? 'var(--neon-orange)' : 'var(--text-muted)',
                        }}
                      >
                        {task.progress}%
                      </span>
                      <div
                        className="w-20 h-1.5 rounded-full mt-2 overflow-hidden"
                        style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                      >
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: task.progress === 100 ? 'var(--neon-green)' :
                              task.progress > 0 ? `linear-gradient(90deg, ${color}, var(--neon-purple))` :
                                'var(--text-muted)',
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${task.progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Edit Form */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div
                          className="mt-4 pt-4 space-y-4"
                          style={{
                            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* 설명 */}
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                              <AlignLeft className="w-4 h-4" style={{ color: 'var(--neon-green)' }} />
                              설명
                              {isFieldUpdating(task.id, 'description') && (
                                <Loader2 className="w-3 h-3 animate-spin" style={{ color }} />
                              )}
                            </label>
                            <textarea
                              defaultValue={task.description || ''}
                              placeholder="태스크 설명을 입력하세요..."
                              rows={3}
                              onBlur={(e) => {
                                if (e.target.value !== (task.description || '')) {
                                  handleFieldUpdate(task.id, 'description', e.target.value || null)
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault()
                                  const target = e.target as HTMLTextAreaElement
                                  if (target.value !== (task.description || '')) {
                                    handleFieldUpdate(task.id, 'description', target.value || null)
                                  }
                                }
                              }}
                              className="w-full px-3 py-2 rounded-lg outline-none text-sm resize-none"
                              style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: 'var(--text-primary)',
                              }}
                            />
                          </div>

                          {/* 진행률 */}
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                              <Percent className="w-4 h-4" style={{ color }} />
                              진행률
                              {isFieldUpdating(task.id, 'progress') && (
                                <Loader2 className="w-3 h-3 animate-spin" style={{ color }} />
                              )}
                            </label>
                            <div className="flex items-center gap-4">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                defaultValue={task.progress}
                                onPointerUp={(e) => {
                                  const newProgress = Number((e.target as HTMLInputElement).value)
                                  if (task.status === '대기중' && newProgress > 0) {
                                    onUpdateField?.(task.id, { progress: newProgress, status: '진행중' })
                                  } else {
                                    handleFieldUpdate(task.id, 'progress', newProgress)
                                  }
                                }}
                                className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                                style={{
                                  background: `linear-gradient(to right, ${color} 0%, ${color} ${task.progress}%, rgba(255,255,255,0.1) ${task.progress}%, rgba(255,255,255,0.1) 100%)`,
                                }}
                              />
                              <div
                                className="w-14 text-center py-1.5 rounded-lg font-mono font-bold text-sm"
                                style={{
                                  background: `${color}15`,
                                  border: `1px solid ${color}30`,
                                  color,
                                }}
                              >
                                {task.progress}%
                              </div>
                            </div>
                          </div>

                          {/* 상태 선택 */}
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                              <Flag className="w-4 h-4" style={{ color: 'var(--neon-magenta)' }} />
                              상태
                              {isFieldUpdating(task.id, 'status') && (
                                <Loader2 className="w-3 h-3 animate-spin" style={{ color }} />
                              )}
                            </label>
                            <select
                              value={task.status}
                              onChange={(e) => handleFieldUpdate(task.id, 'status', e.target.value as TaskStatus)}
                              className="w-full px-3 py-2 rounded-lg outline-none text-sm cursor-pointer"
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

                          {/* 날짜 입력 */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                <CalendarDays className="w-4 h-4" style={{ color }} />
                                시작일
                                {isFieldUpdating(task.id, 'start_date') && (
                                  <Loader2 className="w-3 h-3 animate-spin" style={{ color }} />
                                )}
                              </label>
                              <input
                                type="date"
                                defaultValue={task.start_date ? task.start_date.split('T')[0] : ''}
                                onChange={(e) => handleFieldUpdate(task.id, 'start_date', e.target.value || null)}
                                onKeyDown={(e) => handleInputKeyDown(e, task.id, 'start_date', (e.target as HTMLInputElement).value || null)}
                                className="w-full px-3 py-2 rounded-lg outline-none text-sm"
                                style={{
                                  background: 'rgba(255, 255, 255, 0.03)',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                  color: 'var(--text-primary)',
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                <Calendar className="w-4 h-4" style={{ color: 'var(--neon-orange)' }} />
                                마감일
                                {isFieldUpdating(task.id, 'due_date') && (
                                  <Loader2 className="w-3 h-3 animate-spin" style={{ color }} />
                                )}
                              </label>
                              <input
                                type="date"
                                defaultValue={task.due_date ? task.due_date.split('T')[0] : ''}
                                onChange={(e) => handleFieldUpdate(task.id, 'due_date', e.target.value || null)}
                                onKeyDown={(e) => handleInputKeyDown(e, task.id, 'due_date', (e.target as HTMLInputElement).value || null)}
                                className="w-full px-3 py-2 rounded-lg outline-none text-sm"
                                style={{
                                  background: 'rgba(255, 255, 255, 0.03)',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                  color: 'var(--text-primary)',
                                }}
                              />
                            </div>
                          </div>

                          {/* 메뉴명 입력 */}
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                              <LayoutGrid className="w-4 h-4" style={{ color: 'var(--neon-cyan)' }} />
                              메뉴명
                              {isFieldUpdating(task.id, 'menu_name') && (
                                <Loader2 className="w-3 h-3 animate-spin" style={{ color }} />
                              )}
                            </label>
                            <input
                              type="text"
                              defaultValue={task.menu_name || ''}
                              placeholder="메뉴명을 입력하세요..."
                              onBlur={(e) => {
                                if (e.target.value !== (task.menu_name || '')) {
                                  handleFieldUpdate(task.id, 'menu_name', e.target.value || null)
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  const target = e.target as HTMLInputElement
                                  if (target.value !== (task.menu_name || '')) {
                                    handleFieldUpdate(task.id, 'menu_name', target.value || null)
                                  }
                                }
                              }}
                              className="w-full px-3 py-2 rounded-lg outline-none text-sm"
                              style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: 'var(--text-primary)',
                              }}
                            />
                          </div>

                          {/* 메모 입력 */}
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                              <FileText className="w-4 h-4" style={{ color: 'var(--neon-purple)' }} />
                              메모
                              {isFieldUpdating(task.id, 'memo') && (
                                <Loader2 className="w-3 h-3 animate-spin" style={{ color }} />
                              )}
                            </label>
                            <textarea
                              defaultValue={task.memo || ''}
                              placeholder="메모를 입력하세요..."
                              rows={3}
                              onBlur={(e) => {
                                if (e.target.value !== (task.memo || '')) {
                                  handleFieldUpdate(task.id, 'memo', e.target.value || null)
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault()
                                  const target = e.target as HTMLTextAreaElement
                                  if (target.value !== (task.memo || '')) {
                                    handleFieldUpdate(task.id, 'memo', target.value || null)
                                  }
                                }
                              }}
                              className="w-full px-3 py-2 rounded-lg outline-none text-sm resize-none"
                              style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: 'var(--text-primary)',
                              }}
                            />
                          </div>

                          {/* 에러 메시지 */}
                          {error && (
                            <div
                              className="p-2 rounded-lg text-sm"
                              style={{
                                background: 'rgba(255, 0, 100, 0.1)',
                                border: '1px solid rgba(255, 0, 100, 0.3)',
                                color: 'var(--neon-pink)',
                              }}
                            >
                              {error}
                            </div>
                          )}

                          {/* 삭제 버튼 */}
                          {onDeleteTask && (
                            <div className="flex justify-end pt-2">
                              <button
                                onClick={(e) => handleDelete(task, e)}
                                disabled={isDeletingId === task.id}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-105 disabled:opacity-50"
                                style={{
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  border: '1px solid rgba(239, 68, 68, 0.4)',
                                  color: '#ef4444',
                                }}
                              >
                                {isDeletingId === task.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                                <span className="text-sm font-medium">
                                  {isDeletingId === task.id ? '삭제 중...' : '삭제'}
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
          검색 결과가 없습니다
        </div>
      )}
    </div>
  )
}
