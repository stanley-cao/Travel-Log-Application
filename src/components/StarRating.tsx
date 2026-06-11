interface Props {
  value: number
  onChange?: (val: number) => void
  readOnly?: boolean
  size?: number
}

export default function StarRating({ value, onChange, readOnly = false, size = 20 }: Props) {
  return (
    <div className="rating-input" style={{ gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          className={`rating-star ${i <= value ? 'active' : ''}`}
          style={{ fontSize: size, cursor: readOnly ? 'default' : 'pointer', padding: 1 }}
          onClick={() => !readOnly && onChange?.(i)}
          disabled={readOnly}
        >
          ★
        </button>
      ))}
    </div>
  )
}
