import { Outlet, useNavigate, useLocation } from 'react-router-dom'

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const isOutfits = location.pathname.startsWith('/app/outfits')
  const isPieces = location.pathname.startsWith('/app/pieces')
  const showTabs = location.pathname === '/app/outfits' || location.pathname === '/app/pieces'
  const showTopNav = showTabs

  return (
    <div className="min-h-screen bg-mg-bg flex flex-col">
      {showTopNav && (
        <div className="flex justify-between items-center px-5 pt-3 pb-2">
          <button
            onClick={() => navigate('/app/about')}
            className="font-heading text-sm text-mg-muted"
          >
            About
          </button>
          <span className="font-heading text-lg text-mg-text">
            {isOutfits ? 'Marginalia' : 'Pieces'}
          </span>
          <button onClick={() => navigate('/app/settings')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="#6B6560" strokeWidth="1.5"/>
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" stroke="#6B6560" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </div>

      {showTabs && (
        <div className="fixed bottom-0 left-0 right-0 flex justify-center gap-10 py-3 pb-6 bg-mg-bg border-t border-mg-line">
          <button
            onClick={() => navigate('/app/outfits')}
            className={`font-heading text-sm border-b-[1.5px] pb-0.5 ${
              isOutfits ? 'text-mg-text border-mg-text' : 'text-mg-faded border-transparent'
            }`}
          >
            Outfits
          </button>
          <button
            onClick={() => navigate('/app/pieces')}
            className={`font-heading text-sm border-b-[1.5px] pb-0.5 ${
              isPieces ? 'text-mg-text border-mg-text' : 'text-mg-faded border-transparent'
            }`}
          >
            Pieces
          </button>
        </div>
      )}
    </div>
  )
}
