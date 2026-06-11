import { useState } from 'react'
import { Globe } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    if (mode === 'signin') {
      const err = await signIn(email, password)
      if (err) setError(err.message)
    } else {
      const err = await signUp(email, password)
      if (err) setError(err.message)
      else setSuccess('Check your email to confirm your account!')
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'var(--terracotta-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Globe size={28} color="var(--terracotta)" />
          </div>
        </div>
        <p className="auth-title">Travel Logger</p>
        <p className="auth-subtitle">
          {mode === 'signin' ? 'Welcome back, explorer' : 'Start your travel journal'}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA',
              color: '#DC2626', padding: '10px 14px', borderRadius: 8,
              fontSize: 13, marginBottom: 16
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              background: '#F0FDF4', border: '1px solid #BBF7D0',
              color: '#16A34A', padding: '10px 14px', borderRadius: 8,
              fontSize: 13, marginBottom: 16
            }}>
              {success}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            disabled={loading}
          >
            {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : null}
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <hr className="divider" />

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--sand-500)' }}>
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setSuccess(null) }}
            style={{ background: 'none', border: 'none', color: 'var(--terracotta)', cursor: 'pointer', fontWeight: 500, fontSize: 14 }}
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
