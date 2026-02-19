import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function SharedOutfit() {
  const { slug } = useParams()
  const [outfit, setOutfit] = useState(null)
  const [pieces, setPieces] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchShared()
  }, [slug])

  async function fetchShared() {
    const { data: outfit } = await supabase
      .from('outfits')
      .select('*')
      .eq('share_slug', slug)
      .eq('is_public', true)
      .single()

    if (!outfit) { setLoading(false); return }

    const [{ data: ops }, { data: prof }] = await Promise.all([
      supabase.from('outfit_pieces').select('piece_id, pieces(name)').eq('outfit_id', outfit.id),
      supabase.from('profiles').select('username').eq('id', outfit.user_id).single()
    ])

    setOutfit(outfit)
    setPieces(ops?.map(op => op.pieces) || [])
    setProfile(prof)
    setLoading(false)
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ', ' + d.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-mg-bg flex items-center justify-center">
        <p className="font-heading text-lg text-mg-text">Marginalia</p>
      </div>
    )
  }

  if (!outfit) {
    return (
      <div className="min-h-screen bg-mg-bg flex flex-col items-center justify-center px-6">
        <p className="font-heading text-2xl text-mg-text mb-4">Outfit not found</p>
        <p className="text-sm text-mg-t3">This link may have expired or been removed.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-mg-bg">
      <div className="px-5 py-4 border-b border-mg-line flex justify-between items-center">
        <span className="font-heading text-base text-mg-text">Marginalia</span>
        <span className="text-[11px] text-mg-faded tracking-widest">PUBLIC LINK</span>
      </div>

      <div className="px-6 py-5">
        {/* User */}
        {profile && (
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-mg-border to-mg-muted flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
                <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="font-heading text-base text-mg-text">@{profile.username}</p>
              <p className="text-[11px] text-mg-faded">{formatDate(outfit.worn_at)}</p>
            </div>
          </div>
        )}

        {/* Photo */}
        <div className="bg-mg-card p-2.5 pb-11 mb-5 shadow-sm">
          <div className="w-full aspect-[3/4] bg-gradient-to-br from-mg-border/30 to-mg-muted/40 flex items-center justify-center">
            {outfit.photo_url ? (
              <img src={outfit.photo_url} alt={outfit.name} className="w-full h-full object-cover" />
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="opacity-25">
                <circle cx="12" cy="8" r="4" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
                <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}
          </div>
          <div className="mt-2.5 px-1">
            <span className="font-heading text-lg text-mg-text">{outfit.name}</span>
          </div>
        </div>

        {/* Notes */}
        {outfit.notes && (
          <p className="text-base text-mg-text leading-relaxed mb-5">"{outfit.notes}"</p>
        )}

        {/* Pieces */}
        {pieces.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] text-mg-faded tracking-widest uppercase mb-1.5">Pieces</p>
            {pieces.map((p, i) => (
              <span key={i} className="inline-block px-2.5 py-1 bg-mg-line text-sm text-mg-t3 rounded-full mr-1.5 mb-1.5">
                {p.name}
              </span>
            ))}
          </div>
        )}

        {/* Metadata */}
        {(outfit.weather || outfit.location) && (
          <div className="flex gap-5 mb-7">
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
        )}

        {/* CTA */}
        <div className="h-px bg-mg-line mb-7" />
        <div className="text-center">
          <p className="font-heading text-xl text-mg-text mb-2">Marginalia</p>
          <p className="text-sm text-mg-t3 leading-relaxed mb-5">
            A private outfit diary. Photograph what you wear, see your personal style take shape.
          </p>
          <a
            href="/"
            className="block w-full py-4 bg-mg-text text-mg-bg text-base tracking-wide text-center hover:opacity-85 transition-opacity"
          >
            Join Marginalia
          </a>
        </div>
      </div>
    </div>
  )
}
