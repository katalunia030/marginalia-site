import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'

export default function Settings() {
  const navigate = useNavigate()
  const { user, profile, updateProfile, signOut } = useAuth()
  const [username, setUsername] = useState(profile?.username || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSaveUsername() {
    if (!username.trim() || username === profile?.username) return
    setSaving(true)
    try {
      await updateProfile({ username: username.trim() })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(field) {
    if (!profile) return
    const newValue = !profile[field]
    // Optimistic local update
    const optimistic = { ...profile, [field]: newValue }
    // Don't await — update UI immediately, then persist
    updateProfile({ [field]: newValue }).catch(() => {})
  }

  async function handleExport() {
    const [{ data: outfits }, { data: pieces }, { data: ops }] = await Promise.all([
      supabase.from('outfits').select('*').eq('user_id', user.id),
      supabase.from('pieces').select('*').eq('user_id', user.id),
      supabase.from('outfit_pieces').select('*').eq('outfit_id', user.id)
    ])
    const data = { outfits, pieces, outfit_pieces: ops, exported_at: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `marginalia-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  async function handleSignOut() {
    await signOut()
    navigate('/app')
  }

  return (
    <div className="min-h-screen bg-mg-bg px-6 py-5">
      <button onClick={() => navigate('/app/outfits')} className="text-sm text-mg-muted mb-6">
        ← Back
      </button>
      <h2 className="font-heading text-3xl text-mg-text mb-8">Settings</h2>

      {/* Account */}
      <p className="text-[10px] text-mg-faded tracking-widest uppercase mb-3">Account</p>
      
      <div className="py-3.5 border-t border-mg-line">
        <p className="text-sm text-mg-faded mb-1">Email</p>
        <p className="text-base text-mg-text">{user?.email}</p>
      </div>

      <div className="py-3.5 border-t border-mg-line">
        <p className="text-sm text-mg-faded mb-1.5">Username</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="flex-1 p-2.5 px-3 bg-mg-warm text-sm text-mg-text outline-none"
          />
          <button
            onClick={handleSaveUsername}
            disabled={saving || username === profile?.username}
            className="px-4 py-2 bg-mg-text text-mg-bg text-sm disabled:opacity-30"
          >
            {saved ? 'Saved!' : saving ? '...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Permissions */}
      <p className="text-[10px] text-mg-faded tracking-widest uppercase mt-8 mb-3">Permissions</p>

      <Toggle
        label="Location"
        value={profile?.location_enabled}
        onChange={() => handleToggle('location_enabled')}
      />
      <Toggle
        label="Weather"
        value={profile?.weather_enabled}
        onChange={() => handleToggle('weather_enabled')}
      />
      <Toggle
        label="Emails from Kat"
        sub="Founder updates"
        value={profile?.hear_from_kat}
        onChange={() => handleToggle('hear_from_kat')}
        border
      />

      {/* Data */}
      <p className="text-[10px] text-mg-faded tracking-widest uppercase mt-8 mb-3">Data</p>
      <button
        onClick={handleExport}
        className="w-full py-3.5 bg-transparent text-mg-t3 border border-mg-border text-sm mb-2.5"
      >
        Export your data
      </button>
      <button
        onClick={handleSignOut}
        className="w-full py-3.5 bg-transparent text-red-600 border border-red-200 text-sm"
      >
        Sign out
      </button>
    </div>
  )
}

function Toggle({ label, sub, value, onChange, border }) {
  return (
    <div className={`flex justify-between items-center py-3.5 border-t border-mg-line ${border ? 'border-b' : ''}`}>
      <div className="pr-3">
        <p className="text-base text-mg-text mb-0.5">{label}</p>
        {sub && <p className="text-sm text-mg-faded">{sub}</p>}
      </div>
      <button
        onClick={onChange}
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
