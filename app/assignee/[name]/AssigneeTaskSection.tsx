'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Task, updateTask, deleteTask, UpdateTaskInput } from '@/lib/supabase'
import { AssigneeTaskList } from './AssigneeTaskList'

interface AssigneeTaskSectionProps {
  initialTasks: Task[]
  color: string
}

export function AssigneeTaskSection({ initialTasks, color }: AssigneeTaskSectionProps) {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  const handleUpdateField = useCallback(async (taskId: number, updates: UpdateTaskInput) => {
    const updatedTask = await updateTask(taskId, updates)

    setTasks(prevTasks =>
      prevTasks.map(t => (t.id === taskId ? updatedTask : t))
    )

    router.refresh()
  }, [router])

  const handleDeleteTask = useCallback(async (taskId: number) => {
    await deleteTask(taskId)

    setTasks(prevTasks =>
      prevTasks.filter(t => t.id !== taskId)
    )

    router.refresh()
  }, [router])

  return (
    <AssigneeTaskList
      tasks={tasks}
      color={color}
      onUpdateField={handleUpdateField}
      onDeleteTask={handleDeleteTask}
    />
  )
}
