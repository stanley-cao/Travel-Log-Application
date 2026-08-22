import { useState, KeyboardEvent, useRef } from 'react'
import { X, ChevronDown, Check } from 'lucide-react'

interface Props {
  tags: string[]
  onChange: (tags: string[]) => void
}

const ALL_SUGGESTIONS = [
  'Adventure', 'Backpacking', 'Beach', 'Business', 'City', 'Culture',
  'Family', 'Festival', 'Food', 'Hiking', 'History', 'Luxury',
  'Mountains', 'Nature', 'Nightlife', 'Photography', 'Relaxation',
  'Road Trip', 'Solo', 'Wellness', 'Wildlife', 'Winter',
]

export default function TagInput({ tags, onChange }: Props) {
  const [input, setInput] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      onChange(tags.filter(t => t !== tag))
    } else {
      onChange([...tags, tag])
    }
    // Keep dropdown open and input focused so user can keep selecting
    inputRef.current?.focus()
  }

  const removeTag = (tag: string) => {
    onChange(tags.filter(t => t !== tag))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      const trimmed = input.trim()
      if (!tags.includes(trimmed)) onChange([...tags, trimmed])
      setInput('')
    }
    if (e.key === 'Backspace' && !input && tags.length) {
      removeTag(tags[tags.length - 1])
    }
    if (e.key === 'Escape') setOpen(false)
  }

  const filtered = ALL_SUGGESTIONS.filter(s =>
    s.toLowerCase().includes(input.toLowerCase())
  )

  return (
    <div style={{ position: 'relative' }}>
      {/* Input box */}
      <div
        className="chip-input-wrap"
        style={{ cursor: 'text', minHeight: 44 }}
        onClick={() => { inputRef.current?.focus(); setOpen(true) }}
      >
        {tags.map(tag => (
          <span key={tag} className="chip">
            {tag}
            <button
              type="button"
              onClick={e => { e.stopPropagation(); removeTag(tag) }}
            >
              <X size={11} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={e => { setInput(e.target.value); setOpen(true) }}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 180)}
          placeholder={tags.length === 0 ? 'Search or type a custom tag…' : ''}
          style={{ minWidth: 140 }}
        />
        <ChevronDown
          size={15}
          color="var(--sand-400)"
          style={{
            marginLeft: 'auto', flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s'
          }}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: 'var(--white)',
          border: '1px solid var(--sand-200)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)',
          zIndex: 50,
          maxHeight: 260,
          overflowY: 'auto',
          padding: '6px 0',
        }}>
          {/* Suggested tags */}
          {filtered.length > 0 && (
            <>
              <div style={{
                fontSize: 11, fontWeight: 600, color: 'var(--sand-400)',
                textTransform: 'uppercase', letterSpacing: '0.5px',
                padding: '4px 14px 6px'
              }}>
                {input ? 'Matching tags' : 'Suggested tags'} — click to select/deselect
              </div>
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 6, padding: '4px 12px 10px'
              }}>
                {filtered.map(s => {
                  const selected = tags.includes(s)
                  return (
                    <button
                      key={s}
                      type="button"
                      onMouseDown={e => { e.preventDefault(); toggleTag(s) }}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '5px 10px',
                        borderRadius: 99,
                        border: selected
                          ? '1.5px solid var(--terracotta)'
                          : '1.5px solid var(--sand-200)',
                        background: selected ? 'var(--terracotta-light)' : 'var(--white)',
                        color: selected ? 'var(--terracotta-dark)' : 'var(--sand-700)',
                        fontSize: 13, fontWeight: selected ? 500 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.12s',
                      }}
                    >
                      {selected && <Check size={11} strokeWidth={2.5} />}
                      {s}
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {/* Custom tag hint */}
          {input.trim() && !ALL_SUGGESTIONS.map(s => s.toLowerCase()).includes(input.trim().toLowerCase()) && (
            <>
              {filtered.length > 0 && <hr style={{ border: 'none', borderTop: '1px solid var(--sand-100)', margin: '2px 0' }} />}
              <button
                type="button"
                onMouseDown={e => {
                  e.preventDefault()
                  const trimmed = input.trim()
                  if (!tags.includes(trimmed)) onChange([...tags, trimmed])
                  setInput('')
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '9px 14px', background: 'none',
                  border: 'none', fontSize: 13, cursor: 'pointer',
                  color: 'var(--terracotta)', fontWeight: 500, textAlign: 'left'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--sand-50)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                + Add "{input.trim()}" as custom tag
              </button>
            </>
          )}

          {filtered.length === 0 && !input.trim() && (
            <div style={{ padding: '10px 14px', fontSize: 13, color: 'var(--sand-400)' }}>
              Type to search or create a custom tag
            </div>
          )}
        </div>
      )}
    </div>
  )
}