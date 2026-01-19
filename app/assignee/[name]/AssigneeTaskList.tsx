'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronDown, Calendar, CalendarDays, Folder, Edit2, X, Loader2, Percent, Check, Trash2, Flag, FileText, LayoutGrid } from 'lucide-react'
import { Task, TaskStatus, TASK_STATUS_LIST, getStatusColor } from '@/lib/supabase'

interface AssigneeTaskListProps {
  tasks: Task[]
  color: string
  onSaveTask?: (taskId: number, progress: number, status: TaskStatus, startDate: string | null, dueDate: string | null, memo: string | null, menuName: string | null) => Promise<void>
  onDeleteTask?: (taskId: number) => Promise<void>
}

export function AssigneeTaskList({ tasks, color, onSaveTask, onDeleteTask }: AssigneeTaskListProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedTask, setExpandedTask] = useState<number | null>(null)
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)

  // 편집 폼 상태
  const [editProgress, setEditProgress] = useState(0)
  const [editStatus, setEditStatus] = useState<TaskStatus>('대기중')
  const [editStartDate, setEditStartDate] = useState('')
  const [editDueDate, setEditDueDate] = useState('')
  const [editMemo, setEditMemo] = useState('')
  const [editMenuName, setEditMenuName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const categories = [...new Set(tasks.map(t => t.category))]

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.task_title.toLowerCase().includes(search.toLowerCase()) ||
      task.description?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !selectedCategory || task.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleStartEdit = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingTaskId(task.id)
    setEditProgress(task.progress)
    setEditStatus(task.status)
    setEditStartDate(task.start_date ? task.start_date.split('T')[0] : '')
    setEditDueDate(task.due_date ? task.due_date.split('T')[0] : '')
    setEditMemo(task.memo || '')
    setEditMenuName(task.menu_name || '')
    setError(null)
  }

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingTaskId(null)
    setError(null)
  }

  const handleSave = async (taskId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!onSaveTask) return

    setIsLoading(true)
    setError(null)

    try {
      await onSaveTask(taskId, editProgress, editStatus, editStartDate || null, editDueDate || null, editMemo || null, editMenuName || null)
      setEditingTaskId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

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
            const isEditing = editingTaskId === task.id

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
                  border: isEditing ? `1px solid ${color}50` : '1px solid rgba(255, 255, 255, 0.05)',
                }}
                onClick={() => !isEditing && setExpandedTask(expandedTask === task.id ? null : task.id)}
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

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {expandedTask === task.id && (
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
                        >
                          {/* 편집 모드 */}
                          {isEditing ? (
                            <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                              {/* 진행률 */}
                              <div className="space-y-2">
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
                                    value={editProgress}
                                    onChange={(e) => setEditProgress(Number(e.target.value))}
                                    className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                                    style={{
                                      background: `linear-gradient(to right, ${color} 0%, ${color} ${editProgress}%, rgba(255,255,255,0.1) ${editProgress}%, rgba(255,255,255,0.1) 100%)`,
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
                                    {editProgress}%
                                  </div>
                                </div>
                              </div>

                              {/* 상태 선택 */}
                              <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                  <Flag className="w-4 h-4" style={{ color: 'var(--neon-magenta)' }} />
                                  상태
                                </label>
                                <select
                                  value={editStatus}
                                  onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
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
                                  </label>
                                  <input
                                    type="date"
                                    value={editStartDate}
                                    onChange={(e) => setEditStartDate(e.target.value)}
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
                                  </label>
                                  <input
                                    type="date"
                                    value={editDueDate}
                                    onChange={(e) => setEditDueDate(e.target.value)}
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
                                </label>
                                <input
                                  type="text"
                                  value={editMenuName}
                                  onChange={(e) => setEditMenuName(e.target.value)}
                                  placeholder="메뉴명을 입력하세요..."
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
                                </label>
                                <textarea
                                  value={editMemo}
                                  onChange={(e) => setEditMemo(e.target.value)}
                                  placeholder="메모를 입력하세요..."
                                  rows={3}
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

                              {/* 버튼 */}
                              <div className="flex justify-end gap-2 pt-2">
                                <button
                                  onClick={handleCancelEdit}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all hover:scale-105"
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: 'var(--text-secondary)',
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                  취소
                                </button>
                                <button
                                  onClick={(e) => handleSave(task.id, e)}
                                  disabled={isLoading}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105 disabled:opacity-50"
                                  style={{
                                    background: `linear-gradient(135deg, ${color}, ${color}80)`,
                                    color: 'var(--bg-primary)',
                                  }}
                                >
                                  {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Check className="w-4 h-4" />
                                  )}
                                  {isLoading ? '저장 중...' : '저장'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* 날짜 정보 (보기 모드) */}
                              <div className="flex flex-wrap gap-4">
                                {task.start_date && (
                                  <div className="flex items-center gap-2">
                                    <CalendarDays
                                      className="w-4 h-4"
                                      style={{ color }}
                                    />
                                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                      시작일
                                    </span>
                                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                      {new Date(task.start_date).toLocaleDateString('ko-KR')}
                                    </span>
                                  </div>
                                )}
                                {task.due_date && (
                                  <div className="flex items-center gap-2">
                                    <Calendar
                                      className="w-4 h-4"
                                      style={{ color: 'var(--neon-orange)' }}
                                    />
                                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                      마감일
                                    </span>
                                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                      {new Date(task.due_date).toLocaleDateString('ko-KR')}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* 설명 */}
                              {task.description && (
                                <div
                                  className="text-sm"
                                  style={{ color: 'var(--text-secondary)' }}
                                >
                                  {task.description}
                                </div>
                              )}

                              {/* 수정/삭제 버튼 */}
                              {(onSaveTask || onDeleteTask) && (
                                <div className="flex justify-end gap-2">
                                  {onSaveTask && (
                                    <button
                                      onClick={(e) => handleStartEdit(task, e)}
                                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-105"
                                      style={{
                                        background: `${color}20`,
                                        border: `1px solid ${color}40`,
                                        color: color,
                                      }}
                                    >
                                      <Edit2 className="w-4 h-4" />
                                      <span className="text-sm font-medium">수정</span>
                                    </button>
                                  )}
                                  {onDeleteTask && (
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
                                  )}
                                </div>
                              )}
                            </>
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
