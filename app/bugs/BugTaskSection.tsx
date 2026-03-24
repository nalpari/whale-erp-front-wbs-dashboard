'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Task, updateTask, deleteTask, UpdateTaskInput } from '@/lib/supabase'
import { AssigneeTaskList } from '@/app/assignee/[name]/AssigneeTaskList'

interface BugTaskSectionProps {
  initialTasks: Task[]
}

export function BugTaskSection({ initialTasks }: BugTaskSectionProps) {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  const handleUpdateField = useCallback(async (taskId: number, updates: UpdateTaskInput) => {
    try {
      const updatedTask = await updateTask(taskId, updates)
      setTasks(prevTasks =>
        prevTasks.map(t => (t.id === taskId ? updatedTask : t))
      )
      router.refresh()
    } catch (err) {
      console.error('태스크 업데이트 실패:', taskId, err)
      alert('태스크 수정에 실패했습니다. 다시 시도해주세요.')
    }
  }, [router])

  const handleDeleteTask = useCallback(async (taskId: number) => {
    try {
      await deleteTask(taskId)
      setTasks(prevTasks =>
        prevTasks.filter(t => t.id !== taskId)
      )
      router.refresh()
    } catch (err) {
      console.error('태스크 삭제 실패:', taskId, err)
      alert('태스크 삭제에 실패했습니다. 다시 시도해주세요.')
    }
  }, [router])

  return (
    <AssigneeTaskList
      tasks={tasks}
      onUpdateField={handleUpdateField}
      onDeleteTask={handleDeleteTask}
    />
  )
}
