import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-mg-bg px-6 py-5">
        <button onClick={() => navigate('/app/signin')} className="text-sm text-mg-muted mb-6">
          ← Back to sign in
        </button>
        <h2 className="font-heading text-3xl text-mg-text mb-4">Check your email</h2>
        <p className="text-base text-mg-t3 leading-relaxed">
          We've sent a password reset link to <strong>{email}</strong>. It may take a minute to arrive.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-mg-bg px-6 py-5">
      <button onClick={() => navigate('/app/signin')} className="text-sm text-mg-muted mb-6">
        ← Back
      </button>
      <h2 className="font-heading text-3xl text-mg-text mb-2">Forgot password</h2>
      <p className="text-base text-mg-muted leading-relaxed mb-8">
        Enter your email and we'll send you a reset link.
      </p>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="text-sm text-red-700 bg-red-50 p-3 mb-4">{error}</div>
        )}

        <label className="text-[10px] text-mg-faded tracking-widest uppercase block mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your email"
          required
          className="w-full p-3 bg-mg-warm border-none text-base text-mg-text outline-none mb-6"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-mg-text text-mg-bg text-base tracking-wide hover:opacity-85 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
    </div>
  )
}
