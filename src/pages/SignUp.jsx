import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'

export default function SignUp() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [locationEnabled, setLocationEnabled] = useState(false)
  const [weatherEnabled, setWeatherEnabled] = useState(false)
  const [hearFromKat, setHearFromKat] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await signUp(email, password, username)
      const userId = data?.user?.id
      if (userId) {
        // Wait for the trigger to create the profile
        let profile = null
        for (let i = 0; i < 10; i++) {
          await new Promise(r => setTimeout(r, 300))
          const { data: p } = await supabase.from('profiles').select('id').eq('id', userId).single()
          if (p) { profile = p; break }
        }
        if (profile) {
          await supabase.from('profiles').update({
            location_enabled: locationEnabled,
            weather_enabled: weatherEnabled,
            hear_from_kat: hearFromKat,
            updated_at: new Date().toISOString()
          }).eq('id', userId)
        }
      }
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
      <h2 className="font-heading text-3xl text-mg-text mb-2">Welcome</h2>
      <p className="text-base text-mg-muted leading-relaxed mb-8">
        Set up your space. Everything here is private.
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

        <label className="text-[10px] text-mg-faded tracking-widest uppercase block mb-1.5">Username</label>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="choose a username"
          required
          className="w-full p-3 bg-mg-warm border-none text-base text-mg-text outline-none mb-5"
        />

        <label className="text-[10px] text-mg-faded tracking-widest uppercase block mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Create a password"
          required
          minLength={6}
          className="w-full p-3 bg-mg-warm border-none text-base text-mg-text outline-none mb-7"
        />

        <div className="h-px bg-mg-line mb-6" />

        <p className="text-sm text-mg-t3 leading-relaxed mb-5">
          Marginalia can add location and weather to your outfits automatically.
          This data is only shared if you choose to share an outfit.
        </p>

        <Toggle label="Location" sub="Auto-fill where you are" value={locationEnabled} onChange={setLocationEnabled} />
        <Toggle label="Weather" sub="Auto-fill conditions today" value={weatherEnabled} onChange={setWeatherEnabled} border />

        <div className="h-px bg-mg-line my-6" />

        <Toggle
          label="Hear from Kat"
          sub="Occasional emails from the founder about Marginalia, how it's evolving, and invitations to shape what comes next."
          value={hearFromKat}
          onChange={setHearFromKat}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-mg-text text-mg-bg text-base tracking-wide mt-6 hover:opacity-85 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Start your diary'}
        </button>
      </form>
    </div>
  )
}

function Toggle({ label, sub, value, onChange, border }) {
  return (
    <div className={`flex justify-between items-center py-3.5 border-t border-mg-line ${border ? 'border-b' : ''}`}>
      <div className="pr-3">
        <p className="text-base text-mg-text mb-0.5">{label}</p>
        {sub && <p className="text-sm text-mg-faded leading-relaxed">{sub}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full relative flex-shrink-0 transition-colors ${
          value ? 'bg-mg-text' : 'bg-mg-border'
        }`}
      >
        <div className={`w-[18px] h-[18px] rounded-full bg-mg-card absolute top-[3px] transition-all shadow-sm ${
          value ? 'left-[23px]' : 'left-[3px]'
        }`} />
      </button>
    </div>
  )
}
