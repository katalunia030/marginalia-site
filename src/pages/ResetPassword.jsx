import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function ResetPassword() {
  const navigate = useNavigate()
  const { updatePassword } = useAuth()
  const [password, setPassword] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await updatePassword(password)
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-mg-bg px-6 py-5">
        <h2 className="font-heading text-3xl text-mg-text mb-4">Password updated</h2>
        <p className="text-base text-mg-t3 leading-relaxed mb-8">
          Your password has been changed.
        </p>
        <button
          onClick={() => navigate('/app/outfits')}
          className="w-full py-4 bg-mg-text text-mg-bg text-base tracking-wide hover:opacity-85 transition-opacity"
        >
          Continue to diary
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-mg-bg px-6 py-5">
      <h2 className="font-heading text-3xl text-mg-text mb-2">New password</h2>
      <p className="text-base text-mg-muted leading-relaxed mb-8">
        Choose a new password for your account.
      </p>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="text-sm text-red-700 bg-red-50 p-3 mb-4">{error}</div>
        )}

        <label className="text-[10px] text-mg-faded tracking-widest uppercase block mb-1.5">New password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter new password"
          required
          minLength={6}
          className="w-full p-3 bg-mg-warm border-none text-base text-mg-text outline-none mb-6"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-mg-text text-mg-bg text-base tracking-wide hover:opacity-85 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update password'}
        </button>
      </form>
    </div>
  )
}
