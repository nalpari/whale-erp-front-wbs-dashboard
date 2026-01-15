'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronDown, Calendar, CalendarDays, Folder } from 'lucide-react'
import { Task } from '@/lib/supabase'

interface AssigneeTaskListProps {
  tasks: Task[]
  color: string
}

export function AssigneeTaskList({ tasks, color }: AssigneeTaskListProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedTask, setExpandedTask] = useState<number | null>(null)

  const categories = [...new Set(tasks.map(t => t.category))]

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.task_title.toLowerCase().includes(search.toLowerCase()) ||
      task.description?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !selectedCategory || task.category === selectedCategory
    return matchesSearch && matchesCategory
  })

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
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.02 }}
              className="rounded-xl overflow-hidden cursor-pointer"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: `1px solid rgba(255, 255, 255, 0.05)`,
              }}
              onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
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

                {/* Expanded Description */}
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
                        className="mt-4 pt-4 space-y-3"
                        style={{
                          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        {/* 날짜 정보 */}
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
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
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
