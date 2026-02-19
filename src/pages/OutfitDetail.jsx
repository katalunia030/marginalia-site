import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

export default function OutfitDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileRef = useRef()
  const [outfit, setOutfit] = useState(null)
  const [pieces, setPieces] = useState([])
  const [wornAgain, setWornAgain] = useState([])
  const [loading, setLoading] = useState(true)
  const [shared, setShared] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [editWeather, setEditWeather] = useState('')
  const [editPieces, setEditPieces] = useState([])
  const [allPieces, setAllPieces] = useState([])
  const [pieceSearch, setPieceSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => { fetchOutfit() }, [id])

  async function fetchOutfit() {
    const [{ data: outfit }, { data: ops }, { data: repeats }] = await Promise.all([
      supabase.from('outfits').select('*').eq('id', id).single(),
      supabase.from('outfit_pieces').select('piece_id, pieces(*)').eq('outfit_id', id),
      supabase.from('outfits').select('id, worn_at').eq('based_on_outfit_id', id).order('worn_at', { ascending: false })
    ])
    setOutfit(outfit)
    setPieces(ops?.map(op => op.pieces) || [])
    setWornAgain(repeats || [])
    setLoading(false)
  }

  async function startEdit() {
    setEditName(outfit.name)
    setEditNotes(outfit.notes || '')
    setEditLocation(outfit.location || '')
    setEditWeather(outfit.weather || '')
    setEditPieces([...pieces])
    // Fetch all user pieces for the search/add
    const { data } = await supabase.from('pieces').select('*').eq('user_id', user.id).order('name')
    setAllPieces(data || [])
    setEditing(true)
  }

  async function saveEdit() {
    setSaving(true)
    const { data } = await supabase.from('outfits').update({
      name: editName.trim(),
      notes: editNotes.trim() || null,
      location: editLocation.trim() || null,
      weather: editWeather.trim() || null,
      updated_at: new Date().toISOString()
    }).eq('id', outfit.id).select().single()
    if (data) setOutfit(data)

    // Update pieces: delete all existing links and re-insert
    await supabase.from('outfit_pieces').delete().eq('outfit_id', outfit.id)
    if (editPieces.length > 0) {
      await supabase.from('outfit_pieces').insert(
        editPieces.map(p => ({ outfit_id: outfit.id, piece_id: p.id }))
      )
    }
    setPieces([...editPieces])

    setEditing(false)
    setSaving(false)
  }

  async function handlePhotoReplace(e) {
    const file = e.target.files[0]
    if (!file) return
    const ext = file.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('photos').upload(path, file)
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(path)
      const { data } = await supabase.from('outfits').update({ photo_url: publicUrl }).eq('id', outfit.id).select().single()
      if (data) setOutfit(data)
    }
  }

  async function handleDelete() {
    await supabase.from('outfit_pieces').delete().eq('outfit_id', outfit.id)
    await supabase.from('outfits').delete().eq('id', outfit.id)
    navigate('/app/outfits')
  }

  async function handleShare() {
    if (!outfit.share_slug) {
      const slug = Math.random().toString(36).substring(2, 10)
      await supabase.from('outfits').update({ is_public: true, share_slug: slug }).eq('id', outfit.id)
      setOutfit({ ...outfit, is_public: true, share_slug: slug })
      navigator.clipboard?.writeText(`${window.location.origin}/outfit/${slug}`)
    } else {
      navigator.clipboard?.writeText(`${window.location.origin}/outfit/${outfit.share_slug}`)
    }
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ', ' + d.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  if (loading || !outfit) return <div className="px-5 py-8"><p className="text-sm text-mg-faded">Loading...</p></div>

  return (
    <div className="min-h-screen bg-mg-bg px-6 py-5">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate('/app/outfits')} className="text-sm text-mg-muted">← Back</button>
        <button onClick={handleShare} className="flex items-center gap-1.5 text-sm text-mg-muted">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="18" cy="5" r="3" stroke="#8B8580" strokeWidth="1.5"/>
            <circle cx="6" cy="12" r="3" stroke="#8B8580" strokeWidth="1.5"/>
            <circle cx="18" cy="19" r="3" stroke="#8B8580" strokeWidth="1.5"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="#8B8580" strokeWidth="1.5"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="#8B8580" strokeWidth="1.5"/>
          </svg>
          {shared ? 'Link copied!' : 'Share'}
        </button>
      </div>

      {/* Photo card */}
      <input type="file" accept="image/*" ref={fileRef} onChange={handlePhotoReplace} className="hidden" />
      <div className="bg-mg-card p-2.5 pb-11 mb-6 shadow-sm">
        <button onClick={() => editing && fileRef.current.click()} className="w-full aspect-[3/4] bg-gradient-to-br from-mg-border/30 to-mg-muted/40 flex items-center justify-center relative">
          {outfit.photo_url ? (
            <img src={outfit.photo_url} alt={outfit.name} className="w-full h-full object-cover" />
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="opacity-25">
              <circle cx="12" cy="8" r="4" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
              <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          )}
          {editing && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <span className="text-white text-sm">Tap to replace photo</span>
            </div>
          )}
        </button>
        <div className="flex justify-between mt-2.5 px-1">
          {editing ? (
            <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
              className="font-heading text-lg text-mg-text bg-transparent border-b border-mg-border outline-none flex-1 mr-2" />
          ) : (
            <span className="font-heading text-lg text-mg-text">{outfit.name}</span>
          )}
          <span className="text-sm text-mg-faded flex-shrink-0">{formatDate(outfit.worn_at)}</span>
        </div>
      </div>

      {/* Based on */}
      {outfit.based_on_outfit_id && (
        <button onClick={() => navigate(`/app/outfits/${outfit.based_on_outfit_id}`)}
          className="w-full p-3 bg-mg-warm mb-4 flex items-center gap-2 text-left text-sm text-mg-muted">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M17 1l4 4-4 4" stroke="#8B8580" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 11V9a4 4 0 014-4h14" stroke="#8B8580" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M7 23l-4-4 4-4" stroke="#8B8580" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 13v2a4 4 0 01-4 4H3" stroke="#8B8580" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Based on: <span className="text-mg-text">{outfit.name}</span> →
        </button>
      )}

      {/* Notes */}
      {editing ? (
        <div className="mb-5">
          <p className="text-[10px] text-mg-faded tracking-widest uppercase mb-1.5">Notes</p>
          <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)}
            rows="3" placeholder="Add a note..."
            className="w-full p-3 bg-mg-warm text-base text-mg-text leading-relaxed resize-none outline-none" />
        </div>
      ) : outfit.notes ? (
        <p className="text-base text-mg-text leading-relaxed py-3.5 border-t border-b border-mg-line mb-5">
          "{outfit.notes}"
        </p>
      ) : null}

      {/* Pieces */}
      {editing ? (
        <div className="mb-5">
          <p className="text-[10px] text-mg-faded tracking-widest uppercase mb-1.5">Pieces</p>
          {editPieces.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {editPieces.map(p => (
                <span key={p.id} className="px-3 py-1 bg-mg-line text-sm text-mg-t2 rounded-full inline-flex items-center gap-1.5">
                  {p.name}
                  <button onClick={() => setEditPieces(editPieces.filter(ep => ep.id !== p.id))}
                    className="opacity-50 hover:opacity-100 text-base leading-none">×</button>
                </span>
              ))}
            </div>
          )}
          <div className="relative">
            <input type="text" value={pieceSearch} onChange={e => setPieceSearch(e.target.value)}
              placeholder="Add a piece..." className="w-full p-2.5 px-3 bg-mg-warm text-sm text-mg-t2 outline-none" />
            {pieceSearch && (
              <div className="absolute top-full left-0 right-0 bg-mg-card border border-mg-line shadow-md z-10 max-h-40 overflow-y-auto">
                {allPieces
                  .filter(p => p.name.toLowerCase().includes(pieceSearch.toLowerCase()) && !editPieces.find(ep => ep.id === p.id))
                  .map(p => (
                    <button key={p.id}
                      onClick={() => { setEditPieces([...editPieces, p]); setPieceSearch('') }}
                      className="w-full text-left px-3 py-2 text-sm text-mg-t2 hover:bg-mg-warm">{p.name}</button>
                  ))}
                <button
                  onClick={async () => {
                    const { data } = await supabase.from('pieces').insert({ user_id: user.id, name: pieceSearch.trim() }).select().single()
                    if (data) { setEditPieces([...editPieces, data]); setAllPieces([...allPieces, data]); setPieceSearch('') }
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-mg-muted hover:bg-mg-warm border-t border-mg-line">
                  + Create "{pieceSearch.trim()}"
                </button>
              </div>
            )}
          </div>
        </div>
      ) : pieces.length > 0 ? (
        <div className="mb-5">
          <p className="text-[10px] text-mg-faded tracking-widest uppercase mb-1.5">Pieces</p>
          {pieces.map(p => (
            <button key={p.id} onClick={() => navigate(`/app/pieces/${p.id}`)}
              className="px-3.5 py-1.5 bg-mg-line text-sm text-mg-t2 rounded-full mr-2 mb-2 inline-block hover:bg-mg-border/50">
              {p.name} <span className="opacity-35">→</span>
            </button>
          ))}
        </div>
      ) : null}

      {/* Weather + Location */}
      {editing ? (
        <div className="flex gap-3 mb-5">
          <div className="flex-1">
            <p className="text-[10px] text-mg-faded tracking-widest uppercase mb-1.5">Location</p>
            <input type="text" value={editLocation} onChange={e => setEditLocation(e.target.value)}
              className="w-full p-2.5 px-3 bg-mg-warm text-sm text-mg-t2 outline-none" placeholder="Location" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-mg-faded tracking-widest uppercase mb-1.5">Weather</p>
            <input type="text" value={editWeather} onChange={e => setEditWeather(e.target.value)}
              className="w-full p-2.5 px-3 bg-mg-warm text-sm text-mg-t2 outline-none" placeholder="Weather" />
          </div>
        </div>
      ) : (outfit.weather || outfit.location) ? (
        <div className="flex gap-6 mb-7">
          {outfit.weather && (
            <div>
              <p className="text-[10px] text-mg-faded tracking-widest uppercase mb-1">Weather</p>
              <span className="text-sm text-mg-t3">{outfit.weather}</span>
            </div>
          )}
          {outfit.location && (
            <div>
              <p className="text-[10px] text-mg-faded tracking-widest uppercase mb-1">Location</p>
              <span className="text-sm text-mg-t3">{outfit.location}</span>
            </div>
          )}
        </div>
      ) : null}

      {/* Edit / Save / Delete buttons */}
      {editing ? (
        <div className="flex flex-col gap-2.5 mb-6">
          <button onClick={saveEdit} disabled={saving}
            className="w-full py-3 bg-mg-text text-mg-bg text-sm hover:opacity-85 transition-opacity disabled:opacity-50">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          <button onClick={() => setEditing(false)}
            className="w-full py-3 bg-transparent text-mg-t3 border border-mg-border text-sm">
            Cancel
          </button>
          <button onClick={() => setShowDelete(true)}
            className="w-full py-3 bg-transparent text-red-600 border border-red-200 text-sm mt-2">
            Delete this outfit
          </button>
        </div>
      ) : (
        <button onClick={startEdit}
          className="w-full py-3 bg-transparent text-mg-t3 border border-mg-border text-sm mb-4">
          Edit this outfit
        </button>
      )}

      {/* Delete confirmation */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-mg-bg p-6 max-w-sm w-full">
            <p className="font-heading text-lg text-mg-text mb-2">Delete this outfit?</p>
            <p className="text-sm text-mg-t3 mb-6">This can't be undone.</p>
            <div className="flex flex-col gap-2.5">
              <button onClick={handleDelete}
                className="w-full py-3 bg-red-600 text-white text-sm">
                Delete
              </button>
              <button onClick={() => setShowDelete(false)}
                className="w-full py-3 bg-transparent text-mg-t3 border border-mg-border text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wore this again */}
      {!editing && (
        <button onClick={() => navigate(`/app/outfits/new?repeat=${outfit.id}`)}
          className="w-full py-3 bg-mg-warm text-mg-text border border-dashed border-mg-border text-sm flex items-center justify-center gap-2 mb-6 hover:bg-mg-line transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M17 1l4 4-4 4" stroke="#3A3632" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 11V9a4 4 0 014-4h14" stroke="#3A3632" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M7 23l-4-4 4-4" stroke="#3A3632" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 13v2a4 4 0 01-4 4H3" stroke="#3A3632" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Wore this again
        </button>
      )}

      {/* Worn again log */}
      {wornAgain.length > 0 && !editing && (
        <div>
          <p className="text-[10px] text-mg-faded tracking-widest uppercase mb-2">Worn again</p>
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {wornAgain.map(r => (
              <button key={r.id} onClick={() => navigate(`/app/outfits/${r.id}`)}
                className="px-3.5 py-2 bg-mg-warm rounded-lg flex-shrink-0">
                <span className="text-sm text-mg-text block">{new Date(r.worn_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span className="text-[11px] text-mg-faded">{new Date(r.worn_at).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
