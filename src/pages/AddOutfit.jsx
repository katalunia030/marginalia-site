import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

export default function AddOutfit() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const fileRef = useRef()
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [location, setLocation] = useState('')
  const [weather, setWeather] = useState('')
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [pieces, setPieces] = useState([])
  const [pieceSearch, setPieceSearch] = useState('')
  const [allPieces, setAllPieces] = useState([])
  const [basedOn, setBasedOn] = useState(null)
  const [showPicker, setShowPicker] = useState(false)
  const [prevOutfits, setPrevOutfits] = useState([])
  const [saving, setSaving] = useState(false)
  const [wornAt, setWornAt] = useState(new Date())

  useEffect(() => {
    fetchData()
    if (profile?.location_enabled) autoFillLocation()
  }, [user, profile])

  async function autoFillLocation() {
    try {
      if (!navigator.geolocation) return
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords
        // Reverse geocode
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`)
          const geoData = await geoRes.json()
          const city = geoData.address?.city || geoData.address?.town || geoData.address?.village || ''
          const country = geoData.address?.country || ''
          if (city) setLocation(city + (country ? ', ' + country : ''))
        } catch (e) { /* silently fail */ }

        // Weather
        if (profile?.weather_enabled) {
          try {
            const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`)
            const wData = await wRes.json()
            if (wData.current_weather) {
              const temp = Math.round(wData.current_weather.temperature)
              const code = wData.current_weather.weathercode
              const desc = weatherDescription(code)
              setWeather(`${temp}°C, ${desc}`)
            }
          } catch (e) { /* silently fail */ }
        }
      }, () => { /* permission denied, do nothing */ })
    } catch (e) { /* silently fail */ }
  }

  function weatherDescription(code) {
    if (code === 0) return 'clear'
    if (code <= 3) return 'partly cloudy'
    if (code <= 48) return 'foggy'
    if (code <= 57) return 'drizzle'
    if (code <= 67) return 'rainy'
    if (code <= 77) return 'snowy'
    if (code <= 82) return 'showers'
    if (code <= 86) return 'snow showers'
    if (code >= 95) return 'thunderstorm'
    return 'cloudy'
  }

  async function fetchData() {
    const [{ data: pcs }, { data: outfits }] = await Promise.all([
      supabase.from('pieces').select('*').eq('user_id', user.id).order('name'),
      supabase.from('outfits').select('*').eq('user_id', user.id).order('worn_at', { ascending: false }).limit(10)
    ])
    setAllPieces(pcs || [])
    setPrevOutfits(outfits || [])
  }

  async function handleRepeat(outfit) {
    setBasedOn(outfit)
    setName(outfit.name)
    setShowPicker(false)
    // Load pieces for this outfit
    const { data } = await supabase
      .from('outfit_pieces')
      .select('piece_id, pieces(*)')
      .eq('outfit_id', outfit.id)
    if (data) setPieces(data.map(op => op.pieces))
  }

  function handlePhoto(e) {
    const file = e.target.files[0]
    if (!file) return
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  function addPiece(piece) {
    if (!pieces.find(p => p.id === piece.id)) {
      setPieces([...pieces, piece])
    }
    setPieceSearch('')
  }

  function removePiece(id) {
    setPieces(pieces.filter(p => p.id !== id))
  }

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)

    let photoUrl = null
    if (photo) {
      const ext = photo.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('photos').upload(path, photo)
      if (!uploadErr) {
        const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(path)
        photoUrl = publicUrl
      }
    }

    const { data: outfit, error } = await supabase
      .from('outfits')
      .insert({
        user_id: user.id,
        name: name.trim(),
        notes: notes.trim() || null,
        photo_url: photoUrl,
        location: location.trim() || null,
        weather: weather.trim() || null,
        based_on_outfit_id: basedOn?.id || null,
        worn_at: wornAt.toISOString()
      })
      .select()
      .single()

    if (error) { setSaving(false); return }

    // Link pieces
    if (pieces.length > 0) {
      await supabase.from('outfit_pieces').insert(
        pieces.map(p => ({ outfit_id: outfit.id, piece_id: p.id }))
      )
    }

    navigate(`/app/outfits/${outfit.id}`)
  }

  return (
    <div className="min-h-screen bg-mg-bg px-6 py-5">
      <div className="flex justify-between items-center mb-5">
        <button onClick={() => navigate('/app/outfits')} className="text-sm text-mg-muted">
          ← Back
        </button>
        <span className="text-xs text-mg-faded tracking-wide">Autosaved</span>
      </div>

      {/* Repeat picker toggle */}
      {!basedOn && !showPicker && (
        <button
          onClick={() => setShowPicker(true)}
          className="w-full p-3 bg-mg-warm mb-5 flex items-center gap-2 text-left"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M17 1l4 4-4 4" stroke="#8B8580" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 11V9a4 4 0 014-4h14" stroke="#8B8580" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M7 23l-4-4 4-4" stroke="#8B8580" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 13v2a4 4 0 01-4 4H3" stroke="#8B8580" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="text-sm text-mg-muted">Repeat a previous outfit</span>
        </button>
      )}

      {/* Repeat picker */}
      {showPicker && (
        <div className="mb-5">
          <p className="text-[10px] text-mg-faded tracking-widest uppercase mb-2">Choose an outfit to repeat</p>
          <div className="flex gap-2.5 overflow-x-auto pb-2">
            {prevOutfits.map(o => (
              <button
                key={o.id}
                onClick={() => handleRepeat(o)}
                className="bg-mg-card p-1 pb-5 shadow-sm flex-shrink-0"
              >
                <div className="h-20 w-[72px] bg-gradient-to-br from-mg-border/30 to-mg-muted/40 flex items-center justify-center">
                  {o.photo_url ? (
                    <img src={o.photo_url} alt={o.name} className="w-full h-full object-cover" />
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="opacity-20">
                      <circle cx="12" cy="8" r="4" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
                      <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  )}
                </div>
                <span className="font-heading text-[10px] text-mg-text block px-0.5 pt-1 truncate w-[72px]">
                  {o.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Based on link */}
      {basedOn && (
        <button
          onClick={() => navigate(`/app/outfits/${basedOn.id}`)}
          className="w-full p-3 bg-mg-warm mb-5 flex items-center gap-2 text-left"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M17 1l4 4-4 4" stroke="#8B8580" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 11V9a4 4 0 014-4h14" stroke="#8B8580" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M7 23l-4-4 4-4" stroke="#8B8580" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 13v2a4 4 0 01-4 4H3" stroke="#8B8580" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="text-sm text-mg-muted">
            Based on: <span className="text-mg-text">{basedOn.name}</span> →
          </span>
        </button>
      )}

      {/* Photo */}
      <input type="file" accept="image/*" ref={fileRef} onChange={handlePhoto} className="hidden" />
      <button
        onClick={() => fileRef.current.click()}
        className="w-full aspect-[3/4] bg-mg-warm border border-dashed border-mg-border flex flex-col items-center justify-center mb-7 overflow-hidden"
      >
        {photoPreview ? (
          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="mb-3 opacity-40">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="#6B6560" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="3" stroke="#6B6560" strokeWidth="1.5"/>
            </svg>
            <span className="text-sm text-mg-muted">
              {basedOn ? 'Replace with today\'s photo' : 'Add today\'s photo'}
            </span>
          </>
        )}
      </button>

      {/* Name */}
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Name this outfit"
        className="w-full border-b border-mg-border bg-transparent font-heading text-xl text-mg-text py-2 mb-5 outline-none"
      />

      {/* Date */}
      <div className="mb-3">
        <p className="text-[10px] text-mg-faded tracking-widest uppercase mb-1.5">Date</p>
        <input
          type="datetime-local"
          value={wornAt.toISOString().slice(0, 16)}
          onChange={e => setWornAt(new Date(e.target.value))}
          max={new Date().toISOString().slice(0, 16)}
          className="w-full p-2.5 px-3 bg-mg-warm text-sm text-mg-t2 outline-none"
        />
      </div>

      {/* Location + Weather */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1">
          <p className="text-[10px] text-mg-faded tracking-widest uppercase mb-1.5">Location</p>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Where are you?"
            className="w-full p-2.5 px-3 bg-mg-warm text-sm text-mg-t2 outline-none"
          />
        </div>
        <div className="flex-1">
          <p className="text-[10px] text-mg-faded tracking-widest uppercase mb-1.5">Weather</p>
          <input
            type="text"
            value={weather}
            onChange={e => setWeather(e.target.value)}
            placeholder="Conditions"
            className="w-full p-2.5 px-3 bg-mg-warm text-sm text-mg-t2 outline-none"
          />
        </div>
      </div>

      {/* Pieces */}
      <p className="text-[10px] text-mg-faded tracking-widest uppercase mb-1.5">Pieces in this outfit</p>
      {pieces.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {pieces.map(p => (
            <span key={p.id} className="px-3 py-1 bg-mg-line text-sm text-mg-t2 rounded-full inline-flex items-center gap-1.5">
              {p.name}
              <button onClick={() => removePiece(p.id)} className="opacity-50 hover:opacity-100">×</button>
            </span>
          ))}
        </div>
      )}
      <div className="relative mb-6">
        <input
          type="text"
          value={pieceSearch}
          onChange={e => setPieceSearch(e.target.value)}
          placeholder="Add a piece..."
          className="w-full p-2.5 px-3 bg-mg-warm text-sm text-mg-t2 outline-none"
        />
        {pieceSearch && (
          <div className="absolute top-full left-0 right-0 bg-mg-card border border-mg-line shadow-md z-10 max-h-40 overflow-y-auto">
            {allPieces
              .filter(p => p.name.toLowerCase().includes(pieceSearch.toLowerCase()) && !pieces.find(s => s.id === p.id))
              .map(p => (
                <button
                  key={p.id}
                  onClick={() => addPiece(p)}
                  className="w-full text-left px-3 py-2 text-sm text-mg-t2 hover:bg-mg-warm"
                >
                  {p.name}
                </button>
              ))}
            <button
              onClick={async () => {
                const { data } = await supabase.from('pieces').insert({ user_id: user.id, name: pieceSearch.trim() }).select().single()
                if (data) { addPiece(data); setAllPieces([...allPieces, data]) }
              }}
              className="w-full text-left px-3 py-2 text-sm text-mg-muted hover:bg-mg-warm border-t border-mg-line"
            >
              + Create "{pieceSearch.trim()}"
            </button>
          </div>
        )}
      </div>

      {/* Notes */}
      <p className="text-[10px] text-mg-faded tracking-widest uppercase mb-1.5">Notes</p>
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder={basedOn ? "What's different this time?" : "Leave a mark..."}
        rows="3"
        className="w-full p-3 bg-mg-warm text-base text-mg-text leading-relaxed resize-none outline-none mb-6"
      />

      <button
        onClick={handleSave}
        disabled={!name.trim() || saving}
        className="w-full py-4 bg-mg-text text-mg-bg text-base tracking-wide hover:opacity-85 transition-opacity disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save outfit'}
      </button>
    </div>
  )
}
