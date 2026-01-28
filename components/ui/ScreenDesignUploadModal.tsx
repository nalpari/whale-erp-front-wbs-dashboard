'use client'

import { useState, useRef, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { X, Upload, User, Loader2, FileIcon, AlertCircle, Plus, Trash2, FileText, AlignLeft } from 'lucide-react'
import { createScreenDesignPost } from '@/lib/supabase'

interface ScreenDesignUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ScreenDesignUploadModal({
  isOpen,
  onClose,
  onSuccess,
}: ScreenDesignUploadModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [author, setAuthor] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback((file: File): string | null => {
    const allowedExtensions = ['.ppt', '.pptx']
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    if (!allowedExtensions.includes(fileExtension)) {
      return `${file.name}: PPT 또는 PPTX 파일만 업로드 가능합니다`
    }
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return `${file.name}: 파일 크기는 50MB 이하여야 합니다`
    }
    return null
  }, [])

  const handleFilesSelect = useCallback((selectedFiles: File[]) => {
    const newFiles: File[] = []
    for (const file of selectedFiles) {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }
      // 중복 파일 체크
      if (!files.some(f => f.name === file.name && f.size === file.size)) {
        newFiles.push(file)
      }
    }
    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles])
      setError(null)
    }
  }, [files, validateFile])

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length > 0) {
      handleFilesSelect(selectedFiles)
    }
    // Reset input value so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length > 0) {
      handleFilesSelect(droppedFiles)
    }
  }, [handleFilesSelect])

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      setError('제목을 입력해주세요')
      return
    }
    if (files.length === 0) {
      setError('파일을 선택해주세요')
      return
    }
    if (!author.trim()) {
      setError('등록자 이름을 입력해주세요')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await createScreenDesignPost({
        title: title.trim(),
        content: content.trim() || null,
        author: author.trim(),
        files,
      })

      // Reset form on success
      setTitle('')
      setContent('')
      setFiles([])
      setAuthor('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setTitle('')
      setContent('')
      setFiles([])
      setAuthor('')
      setError(null)
      onClose()
    }
  }

  const inputStyle = {
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
          onClick={handleBackdropClick}
        >
          <div
            className="relative w-full max-w-md rounded-xl overflow-hidden animate-slide-up"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
            }}
          >
            {/* Header */}
            <div
              className="p-6 relative"
              style={{
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="absolute top-4 right-4 p-2 rounded-lg transition-colors hover:bg-[var(--bg-tertiary)] disabled:opacity-50"
                style={{
                  color: 'var(--text-muted)',
                }}
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                화면설계서 업로드
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                새로운 화면설계서를 등록합니다
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              {/* Title Input */}
              <div className="space-y-2">
                <label
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <FileText className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                  제목 <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2 focus:ring-[var(--accent)]"
                  style={inputStyle}
                  placeholder="제목을 입력하세요"
                  disabled={isLoading}
                />
              </div>

              {/* Content Input */}
              <div className="space-y-2">
                <label
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <AlignLeft className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  내용
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2 focus:ring-[var(--accent)] resize-none"
                  style={inputStyle}
                  placeholder="내용을 입력하세요 (선택)"
                  disabled={isLoading}
                />
              </div>

              {/* File Upload Area */}
              <div className="space-y-2">
                <label
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Upload className="w-4 h-4" style={{ color: 'var(--success)' }} />
                  파일 선택 <span style={{ color: 'var(--error)' }}>*</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    (여러 파일 선택 가능)
                  </span>
                </label>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className="relative cursor-pointer rounded-lg p-4 text-center transition-all"
                  style={{
                    background: isDragging ? 'var(--accent-bg)' : 'var(--bg-tertiary)',
                    border: isDragging
                      ? '2px dashed var(--accent)'
                      : '2px dashed var(--border)',
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleInputChange}
                    className="hidden"
                    accept=".ppt,.pptx"
                    multiple
                  />
                  <div className="flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>
                      클릭하거나 파일을 드래그하세요
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    PPT, PPTX 파일 (최대 50MB)
                  </p>
                </div>

                {/* File List */}
                {files.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {files.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between p-3 rounded-lg"
                        style={{
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileIcon className="w-5 h-5 shrink-0" style={{ color: 'var(--success)' }} />
                          <div className="min-w-0">
                            <p
                              className="font-medium truncate text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {file.name}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveFile(index)
                          }}
                          className="p-1.5 rounded-lg transition-colors hover:bg-[var(--error-bg)]"
                          style={{
                            color: 'var(--error)',
                          }}
                          disabled={isLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Author Input */}
              <div className="space-y-2">
                <label
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <User className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                  등록자 <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2 focus:ring-[var(--accent)]"
                  style={inputStyle}
                  placeholder="등록자 이름을 입력하세요"
                  disabled={isLoading}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div
                  className="p-3 rounded-lg text-sm flex items-center gap-2"
                  style={{
                    background: 'var(--error-bg)',
                    border: '1px solid var(--error)',
                    color: 'var(--error)',
                  }}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="p-6 flex gap-3"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors hover:bg-[var(--bg-tertiary)] disabled:opacity-50"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: 'var(--accent)',
                  color: 'white',
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    업로드 중...
                  </>
                ) : (
                  '업로드'
                )}
              </button>
            </div>

            {/* Loading Overlay */}
            {isLoading && (
              <div
                className="absolute inset-0 flex items-center justify-center rounded-xl animate-fade-in"
                style={{
                  background: 'rgba(0, 0, 0, 0.6)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 animate-spin" style={{ color: 'var(--accent)' }} />
                  <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                    업로드 중...
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    파일을 업로드하고 있습니다. 잠시만 기다려주세요.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
