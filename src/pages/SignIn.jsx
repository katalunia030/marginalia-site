import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function SignIn() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/app/outfits')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-mg-bg px-6 py-5">
      <button onClick={() => navigate('/app')} className="text-sm text-mg-muted mb-6">
        ← Back
      </button>
      <h2 className="font-heading text-3xl text-mg-text mb-2">Welcome back</h2>
      <p className="text-base text-mg-muted leading-relaxed mb-8">
        Sign in to your diary.
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
          className="w-full p-3 bg-mg-warm border-none text-base text-mg-text outline-none mb-5"
        />

        <label className="text-[10px] text-mg-faded tracking-widest uppercase block mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="your password"
          required
          className="w-full p-3 bg-mg-warm border-none text-base text-mg-text outline-none mb-3"
        />

        <Link to="/app/forgot-password" className="text-sm text-mg-muted underline block mb-8">
          Forgot password?
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-mg-text text-mg-bg text-base tracking-wide hover:opacity-85 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
