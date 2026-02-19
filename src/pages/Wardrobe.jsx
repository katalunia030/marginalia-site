import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

export default function Wardrobe() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [pieces, setPieces] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPieces()
  }, [user])

  async function fetchPieces() {
    const { data } = await supabase
      .from('pieces')
      .select('*')
      .eq('user_id', user.id)
      .order('name')
    setPieces(data || [])
    setLoading(false)
  }

  const filtered = search
    ? pieces.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : pieces

  if (loading) return <div className="px-5 py-8"><p className="text-sm text-mg-faded">Loading...</p></div>

  return (
    <div className="px-5">
      {/* Add piece CTA */}
      <button
        onClick={() => navigate('/app/pieces/new')}
        className="w-full bg-mg-warm border border-dashed border-mg-border p-5 flex items-center gap-3.5 mb-4 hover:bg-mg-line transition-colors text-left"
      >
        <div className="w-12 h-12 bg-mg-bg flex items-center justify-center flex-shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <line x1="12" y1="5" x2="12" y2="19" stroke="#3A3632" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="5" y1="12" x2="19" y2="12" stroke="#3A3632" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <p className="font-heading text-base text-mg-text mb-0.5">Add a new piece</p>
          <p className="text-xs text-mg-faded">Something new, or something you forgot</p>
        </div>
      </button>

      {/* Empty state */}
      {pieces.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-heading text-lg text-mg-text mb-3">Your wardrobe is empty</p>
          <p className="text-sm text-mg-faded leading-relaxed">
            Pieces will appear here as you add them to outfits.
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-mg-faded tracking-wide mb-4">
            {pieces.length} piece{pieces.length !== 1 ? 's' : ''}
          </p>

          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search pieces..."
            className="w-full p-2.5 px-3.5 bg-mg-warm text-sm text-mg-t2 outline-none mb-5"
          />

          <div className="grid grid-cols-3 gap-2.5">
            {filtered.map(piece => (
              <button
                key={piece.id}
                onClick={() => navigate(`/app/pieces/${piece.id}`)}
                className="bg-mg-card p-1.5 text-left hover:scale-[1.02] transition-transform"
              >
                <div className="w-full aspect-square bg-gradient-to-br from-mg-border/30 to-mg-muted/40 flex items-center justify-center mb-1.5">
                  {piece.photo_url ? (
                    <img src={piece.photo_url} alt={piece.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-mg-border/30 to-mg-muted/40" />
                  )}
                </div>
                <p className="font-heading text-[11px] text-mg-text leading-tight mb-0.5">
                  {piece.name}
                </p>
                <span className="inline-block px-2 py-0.5 bg-mg-line text-[10px] text-mg-t3 rounded-full">
                  {piece.state?.replace('_', ' ') || 'still becoming'}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
