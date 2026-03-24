'use client'

import { useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo,
  ImagePlus,
} from 'lucide-react'
import { uploadTaskImage } from '@/lib/supabase'

interface TiptapEditorProps {
  content?: string
  onChange?: (html: string) => void
  placeholder?: string
}

function ToolbarButton({
  onClick,
  isActive,
  children,
  title,
}: {
  onClick: () => void
  isActive?: boolean
  children: React.ReactNode
  title: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-1.5 rounded transition-colors"
      style={{
        background: isActive ? 'var(--accent)' : 'transparent',
        color: isActive ? 'white' : 'var(--text-muted)',
      }}
    >
      {children}
    </button>
  )
}

// 개별 파일 업로드 실패 시 해당 파일만 건너뛰고 나머지 계속 처리
async function handleImageFiles(files: File[], insertImage: (url: string) => void) {
  const imageFiles = files.filter((f) => f.type.startsWith('image/'))
  for (const file of imageFiles) {
    try {
      const url = await uploadTaskImage(file)
      insertImage(url)
    } catch (err) {
      console.error('이미지 업로드 실패:', file.name, err)
      alert(`이미지 업로드에 실패했습니다: ${file.name}`)
    }
  }
}

export function TiptapEditor({ content = '', onChange, placeholder }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder ?? '',
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'tiptap-image',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'tiptap-content outline-none min-h-[120px] px-4 py-3',
        style: 'color: var(--text-primary)',
      },
      handlePaste(view, event) {
        const items = event.clipboardData?.items
        if (!items) return false

        const imageItems = Array.from(items).filter((item) => item.type.startsWith('image/'))
        if (imageItems.length === 0) return false

        event.preventDefault()
        const files = imageItems.map((item) => item.getAsFile()).filter(Boolean) as File[]
        handleImageFiles(files, (url) => {
          if (view.isDestroyed) return
          view.dispatch(
            view.state.tr.replaceSelectionWith(
              view.state.schema.nodes.image.create({ src: url }),
            ),
          )
        })
        return true
      },
      handleDrop(view, event) {
        const files = event.dataTransfer?.files
        if (!files || files.length === 0) return false

        const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'))
        if (imageFiles.length === 0) return false

        event.preventDefault()
        const coords = view.posAtCoords({ left: event.clientX, top: event.clientY })
        let insertPos = coords?.pos ?? view.state.selection.from
        handleImageFiles(imageFiles, (url) => {
          if (view.isDestroyed) return
          const node = view.state.schema.nodes.image.create({ src: url })
          const tr = view.state.tr.insert(insertPos, node)
          view.dispatch(tr)
          insertPos += node.nodeSize
        })
        return true
      },
    },
    immediatelyRender: false,
  })

  const handleImageButtonClick = useCallback(() => {
    if (!editor) return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = () => {
      const files = Array.from(input.files || [])
      handleImageFiles(files, (url) => {
        editor.chain().focus().setImage({ src: url }).run()
      })
    }
    input.click()
  }, [editor])

  if (!editor) return null

  const iconSize = 'w-4 h-4'

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center gap-0.5 px-2 py-1.5"
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
        }}
      >
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="굵게"
        >
          <Bold className={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="기울임"
        >
          <Italic className={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="취소선"
        >
          <Strikethrough className={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="인라인 코드"
        >
          <Code className={iconSize} />
        </ToolbarButton>

        <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="제목 1"
        >
          <Heading1 className={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="제목 2"
        >
          <Heading2 className={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="제목 3"
        >
          <Heading3 className={iconSize} />
        </ToolbarButton>

        <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="글머리 기호 목록"
        >
          <List className={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="번호 매기기 목록"
        >
          <ListOrdered className={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="인용구"
        >
          <Quote className={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="구분선"
        >
          <Minus className={iconSize} />
        </ToolbarButton>

        <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />

        <ToolbarButton
          onClick={handleImageButtonClick}
          title="이미지 삽입"
        >
          <ImagePlus className={iconSize} />
        </ToolbarButton>

        <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="실행 취소"
        >
          <Undo className={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="다시 실행"
        >
          <Redo className={iconSize} />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}
