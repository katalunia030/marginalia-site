import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

export default function PieceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileRef = useRef()
  const [piece, setPiece] = useState(null)
  const [tags, setTags] = useState([])
  const [outfits, setOutfits] = useState([])
  const [oftenWith, setOftenWith] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editState, setEditState] = useState('')
  const [saving, setSaving] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => { fetchPiece() }, [id])

  async function fetchPiece() {
    const [{ data: piece }, { data: pieceTags }, { data: ops }] = await Promise.all([
      supabase.from('pieces').select('*').eq('id', id).single(),
      supabase.from('piece_tags').select('tag').eq('piece_id', id),
      supabase.from('outfit_pieces').select('outfit_id, outfits(*)').eq('piece_id', id)
    ])
    setPiece(piece)
    setTags(pieceTags?.map(t => t.tag) || [])
    const outfitList = ops?.map(op => op.outfits).filter(Boolean) || []
    setOutfits(outfitList)

    if (outfitList.length > 0) {
      const outfitIds = outfitList.map(o => o.id)
      const { data: allOps } = await supabase
        .from('outfit_pieces').select('piece_id, pieces(id, name)').in('outfit_id', outfitIds)
      if (allOps) {
        const counts = {}
        allOps.forEach(op => {
          if (op.piece_id !== id && op.pieces) {
            if (!counts[op.piece_id]) counts[op.piece_id] = { ...op.pieces, count: 0 }
            counts[op.piece_id].count++
          }
        })
        setOftenWith(Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5))
      }
    }
    setLoading(false)
  }

  function startEdit() {
    setEditName(piece.name)
    setEditNotes(piece.notes || '')
    setEditState(piece.state || 'still_becoming')
    setEditing(true)
  }

  async function saveEdit() {
    setSaving(true)
    const { data } = await supabase.from('pieces').update({
      name: editName.trim(),
      notes: editNotes.trim() || null,
      state: editState,
      updated_at: new Date().toISOString()
    }).eq('id', piece.id).select().single()
    if (data) setPiece(data)
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
      const { data } = await supabase.from('pieces').update({ photo_url: publicUrl }).eq('id', piece.id).select().single()
      if (data) setPiece(data)
    }
  }

  async function handleDelete() {
    await supabase.from('outfit_pieces').delete().eq('piece_id', piece.id)
    await supabase.from('piece_tags').delete().eq('piece_id', piece.id)
    await supabase.from('pieces').delete().eq('id', piece.id)
    navigate('/app/pieces')
  }

  const states = [
    { value: 'still_becoming', label: 'Still becoming' },
    { value: 'in_circulation', label: 'In circulation' },
    { value: 'resting', label: 'Resting' },
    { value: 'dormant', label: 'Dormant' },
    { value: 'beyond_seven', label: 'Beyond seven' }
  ]

  if (loading || !piece) return <div className="px-5 py-8"><p className="text-sm text-mg-faded">Loading...</p></div>

  return (
    <div className="min-h-screen bg-mg-bg px-6 py-5">
      <button onClick={() => navigate('/app/pieces')} className="text-sm text-mg-muted mb-6">← Back</button>

      {/* Photo card */}
      <input type="file" accept="image/*" ref={fileRef} onChange={handlePhotoReplace} className="hidden" />
      <div className="bg-mg-card p-2.5 pb-11 mb-6 shadow-sm">
        <button onClick={() => (editing || !piece.photo_url) ? fileRef.current.click() : null}
          className="w-full aspect-square bg-gradient-to-br from-mg-border/30 to-mg-muted/40 flex flex-col items-center justify-center relative">
          {piece.photo_url ? (
            <img src={piece.photo_url} alt={piece.name} className="w-full h-full object-cover" />
          ) : (
            <>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="mb-2 opacity-35">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="#fff" strokeWidth="1.5"/>
                <circle cx="12" cy="12" r="3" stroke="#fff" strokeWidth="1.5"/>
              </svg>
              <span className="text-sm text-white/60">+ Add a photo</span>
            </>
          )}
          {editing && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <span className="text-white text-sm">Tap to replace photo</span>
            </div>
          )}
        </button>
        <div className="mt-2.5 px-1">
          {editing ? (
            <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
              className="font-heading text-xl text-mg-text bg-transparent border-b border-mg-border outline-none w-full" />
          ) : (
            <span className="font-heading text-xl text-mg-text">{piece.name}</span>
          )}
        </div>
      </div>

      {/* State */}
      <div className="mb-4">
        {editing ? (
          <div>
            <p className="text-[10px] text-mg-faded tracking-widest uppercase mb-1.5">Status</p>
            <div className="flex flex-wrap gap-1.5">
              {states.map(s => (
                <button key={s.value} onClick={() => setEditState(s.value)}
                  className={`px-2.5 py-1 text-sm rounded-full ${
                    editState === s.value ? 'bg-mg-text text-mg-bg' : 'bg-mg-line text-mg-t3'
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <span className="inline-block px-2.5 py-1 bg-mg-line text-sm text-mg-t3 rounded-full">
            {piece.state?.replace('_', ' ') || 'still becoming'}
          </span>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mb-5">
          <p className="text-[10px] text-mg-faded tracking-widest uppercase mb-1.5">Tags</p>
          {tags.map(t => (
            <span key={t} className="inline-block px-2.5 py-1 bg-mg-warm text-xs text-mg-t3 rounded-lg mr-1.5">{t}</span>
          ))}
        </div>
      )}

      {/* Notes */}
      {editing ? (
        <div className="mb-5">
          <p className="text-[10px] text-mg-faded tracking-widest uppercase mb-1.5">Notes</p>
          <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)}
            rows="4" placeholder="Add a note..."
            className="w-full p-3 bg-mg-warm text-base text-mg-text leading-relaxed resize-none outline-none" />
        </div>
      ) : piece.notes ? (
        <div className="mb-6">
          <p className="text-[10px] text-mg-faded tracking-widest uppercase mb-1.5">Notes</p>
          <p className="text-base text-mg-text leading-relaxed py-3.5 border-t border-b border-mg-line">"{piece.notes}"</p>
        </div>
      ) : null}

      {/* Edit / Save / Delete */}
      {editing ? (
        <div className="flex flex-col gap-2.5 mb-6">
          <button onClick={saveEdit} disabled={saving}
            className="w-full py-3 bg-mg-text text-mg-bg text-sm hover:opacity-85 transition-opacity disabled:opacity-50">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          <button onClick={() => setEditing(false)}
            className="w-full py-3 bg-transparent text-mg-t3 border border-mg-border text-sm">Cancel</button>
          <button onClick={() => setShowDelete(true)}
            className="w-full py-3 bg-transparent text-red-600 border border-red-200 text-sm mt-2">Delete this piece</button>
        </div>
      ) : (
        <button onClick={startEdit}
          className="w-full py-3 bg-transparent text-mg-t3 border border-mg-border text-sm mb-6">Edit this piece</button>
      )}

      {/* Delete confirmation */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-mg-bg p-6 max-w-sm w-full">
            <p className="font-heading text-lg text-mg-text mb-2">Delete this piece?</p>
            <p className="text-sm text-mg-t3 mb-6">This will remove it from all outfits. This can't be undone.</p>
            <div className="flex flex-col gap-2.5">
              <button onClick={handleDelete} className="w-full py-3 bg-red-600 text-white text-sm">Delete</button>
              <button onClick={() => setShowDelete(false)}
                className="w-full py-3 bg-transparent text-mg-t3 border border-mg-border text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Often worn with */}
      {oftenWith.length > 0 && !editing && (
        <div className="mb-6">
          <p className="text-[10px] text-mg-faded tracking-widest uppercase mb-1.5">Often worn with</p>
          <div className="flex flex-wrap gap-1.5">
            {oftenWith.map(p => (
              <button key={p.id} onClick={() => navigate(`/app/pieces/${p.id}`)}
                className="px-3.5 py-1.5 bg-mg-line text-sm text-mg-t2 rounded-full hover:bg-mg-border/50">
                {p.name} <span className="opacity-35">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Appears in */}
      {outfits.length > 0 && !editing && (
        <div className="mb-6">
          <p className="text-[10px] text-mg-faded tracking-widest uppercase mb-2">
            Appears in {outfits.length} outfit{outfits.length !== 1 ? 's' : ''}
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {outfits.map(o => (
              <button key={o.id} onClick={() => navigate(`/app/outfits/${o.id}`)}
                className="bg-mg-card p-1 pb-5 shadow-sm flex-shrink-0">
                <div className="h-24 w-[90px] bg-gradient-to-br from-mg-border/30 to-mg-muted/40 flex items-center justify-center">
                  {o.photo_url ? (
                    <img src={o.photo_url} alt={o.name} className="w-full h-full object-cover" />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-20">
                      <circle cx="12" cy="8" r="4" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
                      <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  )}
                </div>
                <span className="font-heading text-[11px] text-mg-text block px-1 pt-1 truncate w-[90px]">{o.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
