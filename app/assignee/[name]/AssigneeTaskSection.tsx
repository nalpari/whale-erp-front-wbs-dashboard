'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Task, updateTask } from '@/lib/supabase'
import { AssigneeTaskList } from './AssigneeTaskList'

interface AssigneeTaskSectionProps {
  initialTasks: Task[]
  color: string
}

export function AssigneeTaskSection({ initialTasks, color }: AssigneeTaskSectionProps) {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  const handleSaveTask = useCallback(async (taskId: number, progress: number, startDate: string | null, dueDate: string | null) => {
    const updatedTask = await updateTask(taskId, {
      progress,
      start_date: startDate,
      due_date: dueDate,
    })

    setTasks(prevTasks =>
      prevTasks.map(t => (t.id === taskId ? updatedTask : t))
    )

    router.refresh()
  }, [router])

  return (
    <AssigneeTaskList
      tasks={tasks}
      color={color}
      onSaveTask={handleSaveTask}
    />
  )
}
