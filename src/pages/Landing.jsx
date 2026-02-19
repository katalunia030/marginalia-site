import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 py-20 text-center bg-gradient-to-b from-mg-bg to-mg-warm">
      <h1 className="font-heading text-5xl md:text-7xl text-mg-text mb-4">Marginalia</h1>
      <p className="text-sm text-mg-muted tracking-wide mb-12">
        notes in the margins of what you wear
      </p>
      <div className="w-10 h-px bg-mg-border mb-12" />
      <p className="font-heading text-xl text-mg-t2 italic leading-relaxed max-w-md mb-6">
        Most clothes are worn fewer than seven times before they are forgotten.
      </p>
      <p className="text-base text-mg-t3 leading-relaxed max-w-md mb-14">
        Marginalia is a private outfit diary. Photograph what you wear, see your
        personal style take shape, stay close to what you own, and know when it's
        time to add something new.
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => navigate('/app/signup')}
          className="w-full py-4 bg-mg-text text-mg-bg text-base tracking-wide hover:opacity-85 transition-opacity"
        >
          Begin
        </button>
        <button
          onClick={() => navigate('/app/signin')}
          className="w-full py-4 bg-transparent text-mg-t3 border border-mg-border text-base hover:bg-mg-warm transition-colors"
        >
          Sign in
        </button>
      </div>
    </div>
  )
}
