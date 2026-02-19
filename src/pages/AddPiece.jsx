import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

export default function AddPiece() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileRef = useRef()
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState([])
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [saving, setSaving] = useState(false)

  function handlePhoto(e) {
    const file = e.target.files[0]
    if (!file) return
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  function addTag(e) {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim().toLowerCase())) {
        setTags([...tags, tagInput.trim().toLowerCase()])
      }
      setTagInput('')
    }
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

    const { data: piece, error } = await supabase
      .from('pieces')
      .insert({
        user_id: user.id,
        name: name.trim(),
        notes: notes.trim() || null,
        photo_url: photoUrl
      })
      .select()
      .single()

    if (error) { setSaving(false); return }

    // Add tags
    if (tags.length > 0) {
      await supabase.from('piece_tags').insert(
        tags.map(tag => ({ piece_id: piece.id, tag }))
      )
    }

    navigate(`/app/pieces/${piece.id}`)
  }

  return (
    <div className="min-h-screen bg-mg-bg px-6 py-5">
      <div className="flex justify-between items-center mb-7">
        <button onClick={() => navigate('/app/pieces')} className="text-sm text-mg-muted">
          ← Back
        </button>
        <span className="text-xs text-mg-faded tracking-wide">Autosaved</span>
      </div>

      {/* Photo */}
      <input type="file" accept="image/*" ref={fileRef} onChange={handlePhoto} className="hidden" />
      <button
        onClick={() => fileRef.current.click()}
        className="w-full aspect-square bg-mg-warm border border-dashed border-mg-border flex flex-col items-center justify-center mb-7 overflow-hidden"
      >
        {photoPreview ? (
          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="mb-2.5 opacity-40">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="#6B6560" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="3" stroke="#6B6560" strokeWidth="1.5"/>
            </svg>
            <span className="text-sm text-mg-muted">Add a photo</span>
          </>
        )}
      </button>

      {/* Name */}
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Name this piece"
        className="w-full border-b border-mg-border bg-transparent font-heading text-xl text-mg-text py-2 mb-5 outline-none"
      />

      {/* Tags */}
      <p className="text-[10px] text-mg-faded tracking-widest uppercase mb-1.5">Tags</p>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map(t => (
            <span key={t} className="px-2.5 py-1 bg-mg-warm text-xs text-mg-t3 rounded-lg inline-flex items-center gap-1.5">
              {t}
              <button onClick={() => setTags(tags.filter(x => x !== t))} className="opacity-50 hover:opacity-100">×</button>
            </span>
          ))}
        </div>
      )}
      <input
        type="text"
        value={tagInput}
        onChange={e => setTagInput(e.target.value)}
        onKeyDown={addTag}
        placeholder="Add tags..."
        className="w-full p-2.5 px-3 bg-mg-warm text-sm text-mg-t2 outline-none mb-6"
      />

      {/* Notes */}
      <p className="text-[10px] text-mg-faded tracking-widest uppercase mb-1.5">Notes</p>
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Where did you find it? What does it mean to you?"
        rows="4"
        className="w-full p-3 bg-mg-warm text-base text-mg-text leading-relaxed resize-none outline-none mb-6"
      />

      <button
        onClick={handleSave}
        disabled={!name.trim() || saving}
        className="w-full py-4 bg-mg-text text-mg-bg text-base tracking-wide hover:opacity-85 transition-opacity disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save piece'}
      </button>
    </div>
  )
}
