import { useEffect } from 'react'

export default function MarketingHome() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible')
      })
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' })
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-mg-bg" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes lineGrow { from { width:0 } to { width:40px } }
        .fade-up { opacity:0; animation: fadeUp 0.8s ease-out forwards }
        .fade-in { opacity:0; animation: fadeIn 1s ease-out forwards }
        .reveal { opacity:0; transform:translateY(20px); transition: opacity 0.6s ease-out, transform 0.6s ease-out }
        .reveal.visible { opacity:1; transform:translateY(0) }
      `}</style>

      {/* HERO */}
      <div className="min-h-screen flex flex-col justify-center items-center px-6 py-20 text-center bg-gradient-to-b from-mg-bg to-mg-warm">
        <h1 className="font-heading text-5xl md:text-7xl text-mg-text mb-4 fade-up" style={{ animationDelay: '0.1s' }}>
          Marginalia
        </h1>
        <p className="text-sm md:text-base text-mg-muted tracking-wide mb-12 fade-up" style={{ animationDelay: '0.3s' }}>
          notes in the margins of what you wear
        </p>
        <div className="h-px bg-mg-border mb-12" style={{ animation: 'lineGrow 0.6s ease-out 0.5s forwards', width: 0 }} />
        <p className="font-heading text-lg md:text-2xl text-mg-t2 italic leading-relaxed max-w-lg mb-7 fade-up" style={{ animationDelay: '0.6s' }}>
          Most clothes are worn fewer than seven times before they are forgotten.
        </p>
        <p className="text-base md:text-lg text-mg-t3 leading-relaxed max-w-md mb-14 fade-up" style={{ animationDelay: '0.8s' }}>
          Marginalia is a private outfit diary. Photograph what you wear, see your
          personal style take shape, stay close to what you own, and know when it's
          time to add something new.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs fade-up" style={{ animationDelay: '1s' }}>
          <a
            href="/app"
            className="block w-full py-4 bg-mg-text text-mg-bg text-base tracking-wide text-center hover:opacity-85 transition-opacity"
          >
            Get started
          </a>
        </div>
      </div>

      {/* FEATURES */}
      <section className="py-24 px-6 bg-mg-card">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-4xl text-mg-text mb-12 reveal">
            What Marginalia does
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mb-12">
            <div className="reveal">
              <h3 className="font-heading text-lg text-mg-text mb-2">Photograph your outfits</h3>
              <p className="text-sm text-mg-t3 leading-relaxed">
                Mirror selfies, flat lays, whatever works. Build a visual diary of what you actually wear, one day at a time.
              </p>
            </div>
            <div className="reveal">
              <h3 className="font-heading text-lg text-mg-text mb-2">Know your pieces</h3>
              <p className="text-sm text-mg-t3 leading-relaxed">
                See every item in your wardrobe. Track what's in circulation, what's resting, and what's become a building block of your style.
              </p>
            </div>
            <div className="reveal">
              <h3 className="font-heading text-lg text-mg-text mb-2">Repeat and return</h3>
              <p className="text-sm text-mg-t3 leading-relaxed">
                Log when you wear an outfit again. Notice which combinations you reach for, which layers work together, and what you keep coming back to.
              </p>
            </div>
            <div className="reveal">
              <h3 className="font-heading text-lg text-mg-text mb-2">Shop with clarity</h3>
              <p className="text-sm text-mg-t3 leading-relaxed">
                When you know what you own and what you wear, you know what's actually missing. Add something new with confidence, not impulse.
              </p>
            </div>
          </div>
          <div className="pt-10 border-t border-mg-line reveal">
            <p className="text-sm text-mg-muted leading-relaxed">
              Your data is yours. Always private. Always exportable.
            </p>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-24 px-6 bg-mg-bg">
        <div className="max-w-xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl text-mg-text mb-3 reveal">Marginalia</h2>
          <p className="text-sm text-mg-faded tracking-wide mb-10 reveal">
            notes in the margins of what you wear
          </p>
          <div className="w-10 h-px bg-mg-border mb-10 reveal" />
          <p className="text-base text-mg-t2 leading-relaxed mb-4 reveal">
            Marginalia is a private outfit diary. Photograph what you wear, see your
            personal style take shape, stay close to what you own, and know when it's
            time to add something new.
          </p>
          <p className="text-sm text-mg-t3 leading-relaxed mb-12 reveal">
            Your data is yours. Always private. Always exportable.
          </p>
          <div className="w-10 h-px bg-mg-border mb-10 reveal" />

          {/* Founder */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-mg-border to-mg-muted mb-4 flex items-center justify-center reveal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
              <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="font-heading text-xl text-mg-text mb-1 reveal">Kat</p>
          <p className="text-sm text-mg-faded mb-6 reveal">Founder</p>
          <p className="text-sm text-mg-t3 leading-relaxed mb-4 reveal">
            Getting dressed is a craft. Marginalia is the app I wished existed:
            somewhere to collect my outfits, see what layers work together, and learn
            my style by looking back at what I actually wore.
          </p>
          <p className="text-sm text-mg-t3 leading-relaxed mb-4 reveal">
            By day I'm a founder and technologist. I've spent my career building
            tools for creators and curators on the internet. This is my first fashion project.
          </p>
          <p className="text-sm text-mg-t3 leading-relaxed mb-8 reveal">
            Building slowly, for people who feel the same way.
          </p>
          <a
            href="mailto:kat@marginalia.fit"
            className="inline-block px-8 py-3 bg-transparent text-mg-t3 border border-mg-border text-sm hover:bg-mg-warm transition-colors reveal"
          >
            Write to Kat
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 text-center border-t border-mg-line">
        <p className="font-heading text-base text-mg-text mb-2">Marginalia</p>
        <p className="text-xs text-mg-faded">A private outfit diary</p>
      </footer>
    </div>
  )
}
