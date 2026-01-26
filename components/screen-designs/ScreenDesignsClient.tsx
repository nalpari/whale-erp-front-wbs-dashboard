'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Upload, FileText, Calendar, User, Trash2 } from 'lucide-react'
import { ScreenDesign, deleteScreenDesign } from '@/lib/supabase'
import { GlowCard } from '@/components/ui/GlowCard'
import { ScreenDesignUploadModal } from '@/components/ui/ScreenDesignUploadModal'
import { useRouter } from 'next/navigation'

interface ScreenDesignsClientProps {
  initialDesigns: ScreenDesign[]
}

export function ScreenDesignsClient({ initialDesigns }: ScreenDesignsClientProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const router = useRouter()

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\. /g, '.').replace('.', '')
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

  const handleDelete = async (id: number, documentName: string) => {
    if (!confirm(`'${documentName}' 문서를 삭제하시겠습니까?`)) {
      return
    }

    try {
      await deleteScreenDesign(id)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다')
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

        <motion.button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium"
          style={{
            background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))',
            color: 'var(--bg-primary)',
            boxShadow: '0 0 20px rgba(0, 245, 255, 0.3)',
          }}
          whileHover={{
            scale: 1.05,
            boxShadow: '0 0 30px rgba(0, 245, 255, 0.5)',
          }}
          whileTap={{ scale: 0.95 }}
        >
          <Upload className="w-5 h-5" />
          <span>업로드</span>
        </motion.button>
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
                background: 'rgba(0, 245, 255, 0.1)',
                border: '1px dashed var(--neon-cyan)',
              }}
            >
              <FileText className="w-10 h-10" style={{ color: 'var(--neon-cyan)' }} />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              등록된 화면설계서가 없습니다
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              우측 상단의 업로드 버튼을 클릭하여 첫 번째 문서를 등록해보세요
            </p>
            <motion.button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium"
              style={{
                background: 'rgba(0, 245, 255, 0.1)',
                border: '1px solid var(--neon-cyan)',
                color: 'var(--neon-cyan)',
              }}
              whileHover={{ scale: 1.05, background: 'rgba(0, 245, 255, 0.2)' }}
              whileTap={{ scale: 0.95 }}
            >
              <Upload className="w-4 h-4" />
              첫 문서 업로드하기
            </motion.button>
          </div>
        ) : (
          /* Table */
          <div className="overflow-x-auto">
            {/* Desktop Table */}
            <table className="w-full hidden md:table">
              <thead>
                <tr
                  style={{
                    background: 'rgba(0, 245, 255, 0.05)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--text-secondary)', width: '80px' }}>
                    번호
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    문서명
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--text-secondary)', width: '140px' }}>
                    업데이트 날짜
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--text-secondary)', width: '120px' }}>
                    작성자
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold" style={{ color: 'var(--text-secondary)', width: '120px' }}>
                    관리
                  </th>
                </tr>
              </thead>
              <tbody>
                {initialDesigns.map((design, index) => (
                  <motion.tr
                    key={design.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group transition-colors"
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 245, 255, 0.03)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-mono"
                        style={{
                          background: 'rgba(0, 245, 255, 0.1)',
                          color: 'var(--neon-cyan)',
                        }}
                      >
                        {initialDesigns.length - index}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--neon-purple)' }} />
                        <span className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {design.document_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {formatDate(design.updated_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {design.author}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <motion.button
                          onClick={() => handleDownload(design.file_url, design.file_name)}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-lg transition-all"
                          style={{
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            color: 'var(--neon-green)',
                          }}
                          whileHover={{
                            scale: 1.1,
                            background: 'rgba(16, 185, 129, 0.2)',
                            boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)',
                          }}
                          whileTap={{ scale: 0.95 }}
                          title="다운로드"
                        >
                          <Download className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDelete(design.id, design.document_name)}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-lg transition-all"
                          style={{
                            background: 'rgba(236, 72, 153, 0.1)',
                            border: '1px solid rgba(236, 72, 153, 0.3)',
                            color: 'var(--neon-pink)',
                          }}
                          whileHover={{
                            scale: 1.1,
                            background: 'rgba(236, 72, 153, 0.2)',
                            boxShadow: '0 0 15px rgba(236, 72, 153, 0.3)',
                          }}
                          whileTap={{ scale: 0.95 }}
                          title="삭제"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="md:hidden p-4 space-y-4">
              {initialDesigns.map((design, index) => (
                <motion.div
                  key={design.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-mono flex-shrink-0"
                        style={{
                          background: 'rgba(0, 245, 255, 0.1)',
                          color: 'var(--neon-cyan)',
                        }}
                      >
                        {initialDesigns.length - index}
                      </span>
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--neon-purple)' }} />
                        <span className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {design.document_name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <motion.button
                        onClick={() => handleDownload(design.file_url, design.file_name)}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-lg"
                        style={{
                          background: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          color: 'var(--neon-green)',
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Download className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(design.id, design.document_name)}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-lg"
                        style={{
                          background: 'rgba(236, 72, 153, 0.1)',
                          border: '1px solid rgba(236, 72, 153, 0.3)',
                          color: 'var(--neon-pink)',
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span className="font-mono">{formatDate(design.updated_at)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      <span>{design.author}</span>
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
          총 <span className="font-mono" style={{ color: 'var(--neon-cyan)' }}>{initialDesigns.length}</span>개의 문서
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
