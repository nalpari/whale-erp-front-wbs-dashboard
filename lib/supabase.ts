import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type TaskStatus = '대기중' | '진행중' | '완료' | '이슈' | '버그'

export const TASK_STATUS_LIST: TaskStatus[] = ['대기중', '진행중', '완료', '이슈', '버그']

export const getStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case '완료':
      return 'var(--neon-green)'
    case '진행중':
      return 'var(--neon-cyan)'
    case '대기중':
      return 'var(--text-muted)'
    case '이슈':
      return 'var(--neon-orange)'
    case '버그':
      return 'var(--neon-pink)'
    default:
      return 'var(--text-muted)'
  }
}

export interface Task {
  id: number
  num: number
  category: string
  task_title: string
  description: string | null
  assignee: string | null
  start_date: string | null
  due_date: string | null
  progress: number
  status: TaskStatus
  memo: string | null
  created_at: string
  updated_at: string
}

export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('num', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getTasksByAssignee(assignee: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('assignee', assignee)
    .order('num', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getAssignees(): Promise<string[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('assignee')
    .not('assignee', 'is', null)

  if (error) throw error
  const unique = [...new Set(data?.map(t => t.assignee).filter(Boolean))]
  return unique as string[]
}

export async function getCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('category')

  if (error) throw error
  const unique = [...new Set(data?.map(t => t.category).filter(Boolean))]
  return unique as string[]
}

export interface CategoryStats {
  category: string
  total: number
  completed: number
  inProgress: number
  pending: number
  progress: number
}

export async function getCategoryStats(): Promise<CategoryStats[]> {
  const tasks = await getTasks()
  const categories = [...new Set(tasks.map(t => t.category))]

  return categories.map(category => {
    const categoryTasks = tasks.filter(t => t.category === category)
    const total = categoryTasks.length
    const completed = categoryTasks.filter(t => t.progress === 100).length
    const inProgress = categoryTasks.filter(t => t.progress > 0 && t.progress < 100).length
    const pending = categoryTasks.filter(t => t.progress === 0).length
    const progress = total > 0 ? Math.round(categoryTasks.reduce((sum, t) => sum + t.progress, 0) / total) : 0

    return { category, total, completed, inProgress, pending, progress }
  })
}

export interface AssigneeStats {
  assignee: string
  total: number
  completed: number
  inProgress: number
  pending: number
  progress: number
  categories: string[]
}

export async function getAssigneeStats(): Promise<AssigneeStats[]> {
  const tasks = await getTasks()
  const assignees = [...new Set(tasks.map(t => t.assignee).filter(Boolean))] as string[]

  return assignees.map(assignee => {
    const assigneeTasks = tasks.filter(t => t.assignee === assignee)
    const total = assigneeTasks.length
    const completed = assigneeTasks.filter(t => t.progress === 100).length
    const inProgress = assigneeTasks.filter(t => t.progress > 0 && t.progress < 100).length
    const pending = assigneeTasks.filter(t => t.progress === 0).length
    const progress = total > 0 ? Math.round(assigneeTasks.reduce((sum, t) => sum + t.progress, 0) / total) : 0
    const categories = [...new Set(assigneeTasks.map(t => t.category))]

    return { assignee, total, completed, inProgress, pending, progress, categories }
  })
}

export interface UpdateTaskInput {
  progress?: number
  status?: TaskStatus
  start_date?: string | null
  due_date?: string | null
}

export async function updateTask(taskId: number, updates: UpdateTaskInput): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTask(taskId: number): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (error) throw error
}

export interface CreateTaskInput {
  category: string
  task_title: string
  description?: string | null
  assignee?: string | null
  start_date?: string | null
  due_date?: string | null
  progress?: number
  status?: TaskStatus
  memo?: string | null
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      category: input.category,
      task_title: input.task_title,
      description: input.description ?? null,
      assignee: input.assignee ?? null,
      start_date: input.start_date ?? null,
      due_date: input.due_date ?? null,
      progress: input.progress ?? 0,
      status: input.status ?? '대기중',
      memo: input.memo ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}
