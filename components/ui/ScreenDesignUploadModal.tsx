'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, User, Loader2, FileIcon, AlertCircle } from 'lucide-react'
import { uploadScreenDesign } from '@/lib/supabase'

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
  const [file, setFile] = useState<File | null>(null)
  const [author, setAuthor] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (selectedFile: File | null) => {
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    handleFileSelect(selectedFile)
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

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }, [])

  const handleSubmit = async () => {
    // Validation
    if (!file) {
      setError('파일을 선택해주세요')
      return
    }
    if (!author.trim()) {
      setError('작성자 이름을 입력해주세요')
      return
    }

    // File extension validation
    const allowedExtensions = ['.ppt', '.pptx']
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    if (!allowedExtensions.includes(fileExtension)) {
      setError('PPT 또는 PPTX 파일만 업로드 가능합니다')
      return
    }

    // File size limit (50MB)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      setError('파일 크기는 50MB 이하여야 합니다')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await uploadScreenDesign({
        file,
        author: author.trim(),
      })

      // Reset form on success
      setFile(null)
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
      setFile(null)
      setAuthor('')
      setError(null)
      onClose()
    }
  }

  const color = 'var(--neon-cyan)'

  const inputStyle = {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, type: 'spring', damping: 25 }}
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid rgba(0, 245, 255, 0.3)',
              boxShadow: '0 0 60px rgba(0, 245, 255, 0.2)',
            }}
          >
            {/* Header */}
            <div
              className="p-6 relative"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 245, 255, 0.15), transparent)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="absolute top-4 right-4 p-2 rounded-lg transition-all hover:scale-110 disabled:opacity-50"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-muted)',
                }}
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                화면설계서 업로드
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                새로운 화면설계서를 등록합니다
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* File Upload Area */}
              <div className="space-y-2">
                <label
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Upload className="w-4 h-4" style={{ color }} />
                  파일 선택 <span style={{ color: 'var(--neon-pink)' }}>*</span>
                </label>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className="relative cursor-pointer rounded-xl p-6 text-center transition-all"
                  style={{
                    background: isDragging ? 'rgba(0, 245, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: isDragging
                      ? '2px dashed var(--neon-cyan)'
                      : '2px dashed rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleInputChange}
                    className="hidden"
                    accept=".ppt,.pptx"
                  />

                  {file ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileIcon className="w-8 h-8" style={{ color }} />
                      <div className="text-left">
                        <p
                          className="font-medium truncate max-w-[200px]"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {file.name}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload
                        className="w-10 h-10 mx-auto mb-3"
                        style={{ color: 'var(--text-muted)' }}
                      />
                      <p style={{ color: 'var(--text-secondary)' }}>
                        클릭하거나 파일을 드래그하세요
                      </p>
                      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        PPT, PPTX 파일 (최대 50MB)
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Author Input */}
              <div className="space-y-2">
                <label
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <User className="w-4 h-4" style={{ color: 'var(--neon-green)' }} />
                  작성자 <span style={{ color: 'var(--neon-pink)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all focus:ring-2"
                  style={{ ...inputStyle, '--tw-ring-color': color } as React.CSSProperties}
                  placeholder="작성자 이름을 입력하세요"
                  disabled={isLoading}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div
                  className="p-3 rounded-lg text-sm flex items-center gap-2"
                  style={{
                    background: 'rgba(255, 0, 100, 0.1)',
                    border: '1px solid rgba(255, 0, 100, 0.3)',
                    color: 'var(--neon-pink)',
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
              style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}
            >
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'var(--text-secondary)',
                }}
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, var(--neon-cyan), rgba(0, 245, 255, 0.5))',
                  color: 'var(--bg-primary)',
                  boxShadow: '0 0 20px rgba(0, 245, 255, 0.4)',
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
