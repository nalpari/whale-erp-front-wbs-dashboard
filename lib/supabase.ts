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
  menu_name: string | null
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
  memo?: string | null
  menu_name?: string | null
  description?: string | null
  task_title?: string
  category?: string
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
  menu_name?: string | null
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  // 먼저 insert 실행
  const { data: insertedData, error: insertError } = await supabase
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
      menu_name: input.menu_name ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (insertError) throw insertError

  // insert된 id 값으로 num 컬럼 업데이트
  const { data, error } = await supabase
    .from('tasks')
    .update({ num: insertedData.id })
    .eq('id', insertedData.id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// Screen Designs (화면설계서)
// ============================================

export interface ScreenDesign {
  id: number
  document_name: string
  file_url: string
  file_name: string
  author: string
  created_at: string
  updated_at: string
}

export async function getScreenDesigns(): Promise<ScreenDesign[]> {
  const { data, error } = await supabase
    .from('screen_designs')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data || []
}

export interface UploadScreenDesignInput {
  file: File
  author: string
}

export async function uploadScreenDesign(input: UploadScreenDesignInput): Promise<ScreenDesign> {
  const { file, author } = input

  // Generate unique file path with safe filename (avoid non-ASCII characters)
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 10)
  const fileExtension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
  const safeFileName = `${timestamp}-${randomId}${fileExtension}`
  const filePath = `uploads/${safeFileName}`

  // Upload file to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('screen-designs')
    .upload(filePath, file)

  if (uploadError) throw uploadError

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('screen-designs')
    .getPublicUrl(filePath)

  const fileUrl = urlData.publicUrl

  // Extract document name from file name (without extension)
  const documentName = file.name.replace(/\.[^/.]+$/, '')

  // Insert record to database
  const { data, error: insertError } = await supabase
    .from('screen_designs')
    .insert({
      document_name: documentName,
      file_url: fileUrl,
      file_name: file.name,
      author: author,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (insertError) {
    // Cleanup uploaded file if database insert fails
    await supabase.storage.from('screen-designs').remove([filePath])
    throw insertError
  }

  return data
}

export async function deleteScreenDesign(id: number): Promise<void> {
  // First get the file info to delete from storage
  const { data: design, error: fetchError } = await supabase
    .from('screen_designs')
    .select('file_url')
    .eq('id', id)
    .single()

  if (fetchError) throw fetchError

  // Extract file path from URL
  if (design?.file_url) {
    const urlParts = design.file_url.split('/screen-designs/')
    if (urlParts.length > 1) {
      const filePath = urlParts[1]
      await supabase.storage.from('screen-designs').remove([filePath])
    }
  }

  // Delete database record
  const { error: deleteError } = await supabase
    .from('screen_designs')
    .delete()
    .eq('id', id)

  if (deleteError) throw deleteError
}
