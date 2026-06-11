import { useState, KeyboardEvent } from 'react'
import { X } from 'lucide-react'

interface Props {
  tags: string[]
  onChange: (tags: string[]) => void
}

const SUGGESTIONS = ['Beach', 'Mountains', 'City', 'Culture', 'Food', 'Adventure', 'Backpacking',
  'Luxury', 'Family', 'Solo', 'Road Trip', 'Hiking', 'History', 'Nature', 'Nightlife',
  'Photography', 'Relaxation', 'Business', 'Festival', 'Winter']

export default function TagInput({ tags, onChange }: Props) {
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const addTag = (tag: string) => {
    const trimmed = tag.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInput('')
    setShowSuggestions(false)
  }

  const removeTag = (tag: string) => {
    onChange(tags.filter(t => t !== tag))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      addTag(input)
    }
    if (e.key === 'Backspace' && !input && tags.length) {
      removeTag(tags[tags.length - 1])
    }
  }

  const filtered = SUGGESTIONS.filter(s =>
    s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s)
  ).slice(0, 6)

  return (
    <div style={{ position: 'relative' }}>
      <div
        className="chip-input-wrap"
        onClick={() => document.getElementById('tag-input')?.focus()}
      >
        {tags.map(tag => (
          <span key={tag} className="chip">
            {tag}
            <button type="button" onClick={() => removeTag(tag)}>
              <X size={11} />
            </button>
          </span>
        ))}
        <input
          id="tag-input"
          value={input}
          onChange={e => { setInput(e.target.value); setShowSuggestions(true) }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={tags.length === 0 ? 'Add tags (press Enter or comma)…' : ''}
        />
      </div>

      {showSuggestions && filtered.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'var(--white)', border: '1px solid var(--sand-200)',
          borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)',
          zIndex: 10, marginTop: 4, overflow: 'hidden'
        }}>
          {filtered.map(s => (
            <button
              key={s}
              type="button"
              onMouseDown={() => addTag(s)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '8px 14px', background: 'none', border: 'none',
                fontSize: 13, cursor: 'pointer', color: 'var(--sand-900)'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--sand-50)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
