import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [outfits, setOutfits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOutfits()
  }, [user])

  async function fetchOutfits() {
    const { data } = await supabase
      .from('outfits')
      .select('*')
      .eq('user_id', user.id)
      .order('worn_at', { ascending: false })
    setOutfits(data || [])
    setLoading(false)
  }

  function groupByMonth(outfits) {
    const groups = {}
    outfits.forEach(o => {
      const d = new Date(o.worn_at)
      const key = d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
      if (!groups[key]) groups[key] = []
      groups[key].push(o)
    })
    return groups
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr)
    const day = d.getDate()
    const month = d.toLocaleDateString('en-GB', { month: 'short' })
    const time = d.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true })
    return `${day} ${month}, ${time}`
  }

  const grouped = groupByMonth(outfits)

  if (loading) return <div className="px-5 py-8"><p className="text-sm text-mg-faded">Loading...</p></div>

  return (
    <div className="px-5">
      {/* Add outfit CTA */}
      <button
        onClick={() => navigate('/app/outfits/new')}
        className="w-full bg-mg-warm border border-dashed border-mg-border p-5 flex items-center gap-3.5 mb-4 hover:bg-mg-line transition-colors text-left"
      >
        <div className="w-12 h-12 bg-mg-bg flex items-center justify-center flex-shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <line x1="12" y1="5" x2="12" y2="19" stroke="#3A3632" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="5" y1="12" x2="19" y2="12" stroke="#3A3632" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <p className="font-heading text-base text-mg-text mb-0.5">Add today's outfit</p>
          <p className="text-xs text-mg-faded">What are you wearing?</p>
        </div>
      </button>

      {/* Empty state */}
      {outfits.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-heading text-lg text-mg-text mb-3">Your diary is empty</p>
          <p className="text-sm text-mg-faded leading-relaxed">
            Start by adding what you're wearing today.
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-mg-faded tracking-wide mb-1">
            {outfits.length} outfit{outfits.length !== 1 ? 's' : ''} saved
          </p>

          {Object.entries(grouped).map(([month, items]) => (
            <div key={month}>
              <h3 className="font-heading text-lg text-mg-text mt-5 mb-3">{month}</h3>
              <div className="grid grid-cols-3 gap-2.5">
                {items.map(outfit => (
                  <button
                    key={outfit.id}
                    onClick={() => navigate(`/app/outfits/${outfit.id}`)}
                    className="bg-mg-card p-1.5 text-left hover:scale-[1.02] transition-transform"
                  >
                    <div className="w-full aspect-[3/4] bg-gradient-to-br from-mg-border/30 to-mg-muted/40 flex items-center justify-center mb-1.5">
                      {outfit.photo_url ? (
                        <img src={outfit.photo_url} alt={outfit.name} className="w-full h-full object-cover" />
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-20">
                          <circle cx="12" cy="8" r="4" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
                          <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      )}
                    </div>
                    <p className="font-heading text-xs text-mg-text leading-tight truncate mb-0.5">
                      {outfit.name}
                    </p>
                    <p className="text-[10px] text-mg-faded">{formatDate(outfit.worn_at)}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
