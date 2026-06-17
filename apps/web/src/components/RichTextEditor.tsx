import { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { Node } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'

const ArticleButton = Node.create({
  name: 'articleButton',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      label: { default: 'Button' },
      href: { default: '#' },
    }
  },
  parseHTML() {
    return [{ tag: 'a[data-article-btn]' }]
  },
  renderHTML({ node }) {
    return ['a', { 'data-article-btn': '', href: node.attrs.href, class: 'article-btn', target: '_blank', rel: 'noopener noreferrer' }, node.attrs.label]
  },
})

type Props = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
}

type ToolbarButtonProps = {
  active?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
  disabled?: boolean
}

function ToolbarBtn({ active, onClick, title, children, disabled }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      className={`flex h-7 w-7 items-center justify-center rounded text-sm transition-colors ${
        active
          ? 'bg-slate-900 text-white'
          : 'text-gray-600 hover:bg-neutral-100 hover:text-gray-900'
      } ${disabled ? 'opacity-30 pointer-events-none' : ''}`}
    >
      {children}
    </button>
  )
}

function ToolbarSep() {
  return <span className="mx-1 h-5 w-px bg-gray-200" />
}

export default function RichTextEditor({ value, onChange, placeholder = 'Scrie conținutul articolului…', minHeight = 320 }: Props) {
  const [tab, setTab] = useState<'visual' | 'html'>('visual')
  const [rawHtml, setRawHtml] = useState(value)

  // ── Drag ──────────────────────────────────────────────────────────────────
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragOrigin = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null)

  const onDragHandleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    dragOrigin.current = { mx: e.clientX, my: e.clientY, ox: pos.x, oy: pos.y }
    setIsDragging(true)
  }

  useEffect(() => {
    if (!isDragging) return
    const onMove = (e: MouseEvent) => {
      if (!dragOrigin.current) return
      setPos({
        x: dragOrigin.current.ox + e.clientX - dragOrigin.current.mx,
        y: dragOrigin.current.oy + e.clientY - dragOrigin.current.my,
      })
    }
    const onUp = () => {
      dragOrigin.current = null
      setIsDragging(false)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [isDragging])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: null },
        validate: (href) => /^https?:\/\/|^mailto:/i.test(href),
      }),
      Placeholder.configure({ placeholder }),
      ArticleButton,
    ],
    content: value,
    onUpdate({ editor }) {
      const html = editor.getHTML()
      setRawHtml(html)
      onChange(html)
    },
  })

  // sync external value changes into the editor (e.g. when panel opens a different post)
  useEffect(() => {
    if (!editor) return
    if (tab === 'visual') {
      const current = editor.getHTML()
      if (current !== value) {
        editor.commands.setContent(value || '')
        setRawHtml(value || '')
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const switchToHtml = () => {
    if (!editor) return
    setRawHtml(editor.getHTML())
    setTab('html')
  }

  const switchToVisual = () => {
    if (!editor) return
    editor.commands.setContent(rawHtml || '')
    onChange(rawHtml)
    setTab('visual')
  }

  const setLink = () => {
    if (!editor) return
    const prev = editor.getAttributes('link').href ?? ''
    const url = window.prompt('URL link:', prev)
    if (url === null) return
    if (!url) { editor.chain().focus().unsetLink().run(); return }
    if (!/^https?:\/\/|^mailto:/i.test(url)) {
      window.alert('URL invalid. Folosește https://, http:// sau mailto:')
      return
    }
    editor.chain().focus().setLink({ href: url }).run()
  }

  const insertButton = () => {
    if (!editor) return
    const label = window.prompt('Numele butonului:')
    if (!label?.trim()) return
    const href = window.prompt('Link (URL):')
    if (!href?.trim()) return
    if (!/^https?:\/\/|^mailto:/i.test(href)) { window.alert('URL invalid. Folosește https://, http:// sau mailto:'); return }
    editor.chain().focus().insertContent({ type: 'articleButton', attrs: { label: label.trim(), href: href.trim() } }).run()
  }

  if (!editor) return null

  return (
    <div
      className="rounded-lg border border-zinc-200 bg-white"
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        position: 'relative',
        zIndex: isDragging ? 100 : 1,
        userSelect: isDragging ? 'none' : undefined,
      }}
    >
      {/* Drag handle */}
      <div
        onMouseDown={onDragHandleMouseDown}
        className={`flex items-center justify-center h-6 border-b border-zinc-200 bg-neutral-100 rounded-t-lg ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        title="Trage pentru a muta"
      >
        <svg viewBox="0 0 20 8" className="w-5 h-3 text-gray-400" fill="currentColor" aria-hidden>
          <circle cx="2" cy="2" r="1.5"/><circle cx="10" cy="2" r="1.5"/><circle cx="18" cy="2" r="1.5"/>
          <circle cx="2" cy="6" r="1.5"/><circle cx="10" cy="6" r="1.5"/><circle cx="18" cy="6" r="1.5"/>
        </svg>
      </div>

      {/* Tab bar + toolbar */}
      <div className="flex items-center gap-1 border-b border-zinc-200 bg-neutral-50 px-2 py-1.5 flex-wrap">
        {/* Visual / HTML tabs */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); switchToVisual() }}
          className={`rounded px-2.5 py-1 text-xs font-semibold font-['Inter'] transition-colors ${
            tab === 'visual' ? 'bg-white shadow-sm text-slate-900 border border-zinc-200' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Visual
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); switchToHtml() }}
          className={`rounded px-2.5 py-1 text-xs font-semibold font-['Inter'] transition-colors ${
            tab === 'html' ? 'bg-white shadow-sm text-slate-900 border border-zinc-200' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          HTML
        </button>

        {tab === 'visual' ? (
          <>
            <ToolbarSep />
            {/* Headings */}
            <ToolbarBtn
              active={editor.isActive('heading', { level: 2 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              title="Heading 2"
            >
              <span className="font-bold text-[11px]">H2</span>
            </ToolbarBtn>
            <ToolbarBtn
              active={editor.isActive('heading', { level: 3 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              title="Heading 3"
            >
              <span className="font-bold text-[11px]">H3</span>
            </ToolbarBtn>
            <ToolbarBtn
              active={editor.isActive('heading', { level: 4 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
              title="Heading 4"
            >
              <span className="font-bold text-[11px]">H4</span>
            </ToolbarBtn>
            <ToolbarBtn
              active={editor.isActive('paragraph')}
              onClick={() => editor.chain().focus().setParagraph().run()}
              title="Paragraph"
            >
              <span className="font-bold text-[11px]">P</span>
            </ToolbarBtn>
            <ToolbarSep />
            {/* Inline */}
            <ToolbarBtn
              active={editor.isActive('bold')}
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Bold (Ctrl+B)"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg>
            </ToolbarBtn>
            <ToolbarBtn
              active={editor.isActive('italic')}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Italic (Ctrl+I)"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/></svg>
            </ToolbarBtn>
            <ToolbarBtn
              active={editor.isActive('strike')}
              onClick={() => editor.chain().focus().toggleStrike().run()}
              title="Strikethrough"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M6.85 7.08C6.85 4.37 9.45 3 12.24 3c1.64 0 3 .49 3.9 1.28.77.65 1.46 1.73 1.46 2.68h-2.51c0-.29-.07-.56-.21-.78-.29-.47-.87-.82-1.72-.82-1.24 0-1.71.63-1.71 1.14 0 .55.47.87 1.29 1.16L12 8h-1.73c-2.09-.63-3.42-1.51-3.42-2.92zM21 12H3v-2h18v2zm-7.66 2H9.97l.0.03c.07.2.1.4.1.6 0 1.43-1.34 2.37-3.4 2.37-1.64 0-3.14-.73-4.07-1.96l1.95-1.43c.61.83 1.42 1.27 2.22 1.27.87 0 1.46-.3 1.46-.83 0-.24-.1-.45-.28-.6z"/></svg>
            </ToolbarBtn>
            <ToolbarSep />
            {/* Lists */}
            <ToolbarBtn
              active={editor.isActive('bulletList')}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="Bullet list"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>
            </ToolbarBtn>
            <ToolbarBtn
              active={editor.isActive('orderedList')}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="Ordered list"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/></svg>
            </ToolbarBtn>
            <ToolbarSep />
            {/* Blockquote */}
            <ToolbarBtn
              active={editor.isActive('blockquote')}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              title="Blockquote"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>
            </ToolbarBtn>
            {/* Link */}
            <ToolbarBtn
              active={editor.isActive('link')}
              onClick={setLink}
              title="Link"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
            </ToolbarBtn>
            <ToolbarSep />
            {/* HR */}
            <ToolbarBtn
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Linie orizontală"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M19 13H5v-2h14v2z"/></svg>
            </ToolbarBtn>
            {/* Button */}
            <ToolbarBtn onClick={insertButton} title="Inserează buton">
              <span className="text-[10px] font-bold px-0.5">BTN</span>
            </ToolbarBtn>
            <ToolbarSep />
            {/* Undo / Redo */}
            <ToolbarBtn
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo (Ctrl+Z)"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>
            </ToolbarBtn>
            <ToolbarBtn
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo (Ctrl+Y)"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>
            </ToolbarBtn>
          </>
        ) : null}
      </div>

      {/* Editor area — resizable */}
      <div style={{ resize: 'vertical', overflow: 'auto', minHeight: `${minHeight}px`, minWidth: 260 }}>
        {tab === 'visual' ? (
          <EditorContent
            editor={editor}
            className="prose prose-slate max-w-none font-['Inter'] prose-headings:font-extrabold prose-h2:text-xl prose-h3:text-lg prose-p:leading-7 prose-a:text-slate-700 prose-a:underline px-3 py-2 focus-within:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[--rte-min-h] [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-gray-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0"
            style={{ '--rte-min-h': `${minHeight}px` } as React.CSSProperties}
          />
        ) : (
          <textarea
            className="w-full h-full px-3 py-2 text-xs font-mono focus:outline-none resize-none"
            style={{ minHeight: `${minHeight}px` }}
            value={rawHtml}
            onChange={(e) => {
              setRawHtml(e.target.value)
              onChange(e.target.value)
            }}
            spellCheck={false}
          />
        )}
      </div>
    </div>
  )
}
