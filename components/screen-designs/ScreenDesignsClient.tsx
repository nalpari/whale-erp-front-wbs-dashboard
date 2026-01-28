'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Upload, FileText, Calendar, User, Trash2, ChevronDown, Paperclip, X } from 'lucide-react'
import { ScreenDesignPostWithFiles, ScreenDesignFile, deleteScreenDesignPost, deleteScreenDesignFile } from '@/lib/supabase'
import { GlowCard } from '@/components/ui/GlowCard'
import { ScreenDesignUploadModal } from '@/components/ui/ScreenDesignUploadModal'
import { useRouter } from 'next/navigation'

interface ScreenDesignsClientProps {
  initialDesigns: ScreenDesignPostWithFiles[]
}

// File dropdown component for multiple files
function FileDropdown({ 
  files, 
  onDownload, 
  onDelete 
}: { 
  files: ScreenDesignFile[]
  onDownload: (url: string, fileName: string) => void
  onDelete?: (fileId: number, fileName: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        buttonRef.current?.contains(event.target as Node) ||
        dropdownRef.current?.contains(event.target as Node)
      ) {
        return
      }
      setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      })
    }
  }

  useEffect(() => {
    if (isOpen) {
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isOpen])

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  if (files.length === 0) {
    return (
      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
        첨부파일 없음
      </span>
    )
  }

  if (files.length === 1) {
    const file = files[0]
    return (
      <motion.button
        onClick={() => onDownload(file.file_url, file.file_name)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
        style={{
          background: 'var(--success-bg)',
          border: '1px solid var(--success)',
          color: 'var(--success)',
        }}
        whileHover={{ background: 'var(--success-bg)' }}
        whileTap={{ scale: 0.98 }}
        title={file.file_name}
      >
        <Download className="w-4 h-4" />
        <span className="truncate max-w-[150px]">{file.file_name}</span>
      </motion.button>
    )
  }

  return (
    <>
      <motion.button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
        style={{
          background: 'var(--accent-bg)',
          border: '1px solid var(--accent)',
          color: 'var(--accent)',
        }}
        whileHover={{ background: 'var(--accent-bg)' }}
        whileTap={{ scale: 0.98 }}
      >
        <Paperclip className="w-4 h-4" />
        <span>{files.length}개 파일</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      {typeof window !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="fixed z-[9999] min-w-96 max-w-md rounded-xl overflow-hidden"
                style={{
                  top: `${position.top}px`,
                  left: `${position.left}px`,
                  background: 'var(--bg-secondary)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                }}
              >
                <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 group"
                    >
                      <motion.button
                        onClick={() => {
                          onDownload(file.file_url, file.file_name)
                          setIsOpen(false)
                        }}
                        className="flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors"
                        style={{ color: 'var(--text-primary)' }}
                        whileHover={{ background: 'var(--bg-tertiary)' }}
                      >
                        <Download className="w-4 h-4 shrink-0" style={{ color: 'var(--success)' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm break-words">{file.file_name}</p>
                          {file.file_size && (
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {formatFileSize(file.file_size)}
                            </p>
                          )}
                        </div>
                      </motion.button>
                      {onDelete && (
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm(`'${file.file_name}' 파일을 삭제하시겠습니까?`)) {
                              onDelete(file.id, file.file_name)
                            }
                          }}
                          className="p-2 rounded-lg transition-colors flex-shrink-0"
                          style={{
                            background: 'var(--error-bg)',
                            color: 'var(--error)',
                          }}
                          whileHover={{
                            background: 'var(--error-bg)',
                          }}
                          whileTap={{ scale: 0.95 }}
                          title="파일 삭제"
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  )
}

export function ScreenDesignsClient({ initialDesigns }: ScreenDesignsClientProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const router = useRouter()

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}.${month}.${day}`
  }

  const handleUploadSuccess = () => {
    router.refresh()
  }

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch {
      // Fallback: open in new tab if fetch fails
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`'${title}' 게시물을 삭제하시겠습니까?\n첨부된 모든 파일도 함께 삭제됩니다.`)) {
      return
    }

    try {
      await deleteScreenDesignPost(id)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다')
    }
  }

  const handleDeleteFile = async (fileId: number, fileName: string) => {
    try {
      await deleteScreenDesignFile(fileId)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : '파일 삭제 중 오류가 발생했습니다')
    }
  }

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">화면설계서</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            프로젝트 화면설계 문서 관리
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium transition-colors"
          style={{
            background: 'var(--accent)',
            color: 'white',
          }}
        >
          <Upload className="w-5 h-5" />
          <span>업로드</span>
        </button>
      </div>

      {/* Content */}
      <GlowCard glowColor="cyan" delay={0.1} hover={false} className="overflow-hidden">
        {initialDesigns.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
              style={{
                background: 'var(--accent-bg)',
                border: '1px dashed var(--accent)',
              }}
            >
              <FileText className="w-10 h-10" style={{ color: 'var(--accent)' }} />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              등록된 화면설계서가 없습니다
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              우측 상단의 업로드 버튼을 클릭하여 첫 번째 문서를 등록해보세요
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors"
              style={{
                background: 'var(--accent-bg)',
                border: '1px solid var(--accent)',
                color: 'var(--accent)',
              }}
            >
              <Upload className="w-4 h-4" />
              첫 문서 업로드하기
            </button>
          </div>
        ) : (
          /* Table */
          <div className="overflow-x-auto">
            {/* Desktop Table */}
            <table className="w-full hidden md:table">
              <thead>
                <tr
                  style={{
                    background: 'var(--bg-secondary)',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--text-secondary)', width: '80px' }}>
                    번호
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    제목
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--text-secondary)', width: '200px' }}>
                    첨부파일
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--text-secondary)', width: '120px' }}>
                    등록일
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--text-secondary)', width: '100px' }}>
                    등록자
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold" style={{ color: 'var(--text-secondary)', width: '80px' }}>
                    관리
                  </th>
                </tr>
              </thead>
              <tbody>
                {initialDesigns.map((post, index) => (
                  <motion.tr
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group transition-colors"
                    style={{
                      borderBottom: '1px solid var(--border)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-secondary)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-mono"
                        style={{
                          background: 'var(--accent-bg)',
                          color: 'var(--accent)',
                        }}
                      >
                        {initialDesigns.length - index}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                          <span className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                            {post.title}
                          </span>
                        </div>
                        {post.content && (
                          <p className="text-sm truncate ml-7" style={{ color: 'var(--text-muted)' }}>
                            {post.content}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <FileDropdown files={post.files} onDownload={handleDownload} onDelete={handleDeleteFile} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {formatDate(post.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {post.author}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-lg transition-colors hover:opacity-80"
                          style={{
                            background: 'var(--error-bg)',
                            border: '1px solid var(--error)',
                            color: 'var(--error)',
                          }}
                          title="삭제"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="md:hidden p-4 space-y-4">
              {initialDesigns.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-xl"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-mono flex-shrink-0"
                        style={{
                          background: 'var(--accent-bg)',
                          color: 'var(--accent)',
                        }}
                      >
                        {initialDesigns.length - index}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                          <span className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                            {post.title}
                          </span>
                        </div>
                        {post.content && (
                          <p className="text-sm truncate ml-7 mt-1" style={{ color: 'var(--text-muted)' }}>
                            {post.content}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(post.id, post.title)}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0 transition-colors hover:opacity-80"
                      style={{
                        background: 'var(--error-bg)',
                        border: '1px solid var(--error)',
                        color: 'var(--error)',
                      }}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* File download section */}
                  <div className="mb-3 ml-11">
                    <FileDropdown files={post.files} onDownload={handleDownload} onDelete={handleDeleteFile} />
                  </div>

                  <div className="flex items-center gap-4 text-sm ml-11" style={{ color: 'var(--text-muted)' }}>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span className="font-mono">{formatDate(post.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </GlowCard>

      {/* Stats */}
      {initialDesigns.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-sm text-center"
          style={{ color: 'var(--text-muted)' }}
        >
          총 <span className="font-mono" style={{ color: 'var(--accent)' }}>{initialDesigns.length}</span>개의 게시물
        </motion.div>
      )}

      {/* Upload Modal */}
      <ScreenDesignUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </>
  )
}
