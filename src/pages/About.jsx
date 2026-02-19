import { useNavigate } from 'react-router-dom'

export default function About() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-mg-bg px-6 py-5">
      <button onClick={() => navigate('/app/outfits')} className="text-sm text-mg-muted mb-6">
        ← Back
      </button>

      <h2 className="font-heading text-3xl text-mg-text leading-tight mb-2">Marginalia</h2>
      <p className="text-sm text-mg-faded tracking-wide mb-8">
        notes in the margins of what you wear
      </p>

      <div className="w-10 h-px bg-mg-border mb-7" />

      <p className="text-base text-mg-t2 leading-relaxed mb-4">
        Marginalia is a private outfit diary. Photograph what you wear, see your
        personal style take shape, stay close to what you own, and know when it's
        time to add something new.
      </p>
      <p className="text-sm text-mg-t3 leading-relaxed mb-8">
        Your data is yours. Always private. Always exportable.
      </p>

      <div className="w-10 h-px bg-mg-border mb-7" />

      {/* Founder */}
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-mg-border to-mg-muted mb-4 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
          <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <p className="font-heading text-lg text-mg-text mb-1">Kat</p>
      <p className="text-sm text-mg-faded mb-5">Founder</p>

      <p className="text-sm text-mg-t3 leading-relaxed mb-4">
        Getting dressed is a craft. Marginalia is the app I wished existed:
        somewhere to collect my outfits, see what layers work together, and learn
        my style by looking back at what I actually wore.
      </p>
      <p className="text-sm text-mg-t3 leading-relaxed mb-4">
        By day I'm a founder and technologist. I've spent my career building
        tools for creators and curators on the internet. This is my first fashion project.
      </p>
      <p className="text-sm text-mg-t3 leading-relaxed mb-6">
        Building slowly, for people who feel the same way.
      </p>

      <a
        href="mailto:kat@marginalia.fit"
        className="inline-block px-8 py-3 bg-transparent text-mg-t3 border border-mg-border text-sm hover:bg-mg-warm transition-colors"
      >
        Write to Kat
      </a>

      <div className="text-center mt-8">
        <p className="text-xs text-mg-faded">Version 1.0</p>
      </div>
    </div>
  )
}
