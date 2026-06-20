import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/', label: '创作', icon: '✏️' },
  { path: '/portfolio', label: '作品集', icon: '🎨' },
  { path: '/inspiration', label: '灵感', icon: '💡' },
]

export default function NavBar() {
  const location = useLocation()

  return (
    <nav className="h-16 flex items-center justify-between px-6 bg-[var(--bg-card)] border-b-[3px] border-[#1A1A1A] shadow-[0_4px_0px_#1A1A1A] relative z-10">
      <div className="flex items-center gap-8">
        <Link
          to="/"
          className="text-2xl tracking-wider text-[var(--accent-primary)] drop-shadow-[2px_2px_0px_#1A1A1A]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          ImagineForge
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-5 py-2 text-base transition-all duration-100 ${
                  isActive
                    ? 'text-white'
                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                }`}
                style={{
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.03em',
                  border: isActive ? '3px solid #1A1A1A' : '3px solid transparent',
                  background: isActive ? 'var(--accent-primary)' : 'transparent',
                  boxShadow: isActive ? '4px 4px 0px #1A1A1A' : 'none',
                  transform: isActive ? 'translate(-1px, -1px)' : 'none',
                }}
              >
                {item.icon} {item.label}
              </Link>
            )
          })}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div
          className="flex items-center gap-2 px-4 py-1.5 text-sm"
          style={{
            fontFamily: 'var(--font-display)',
            border: '3px solid #1A1A1A',
            background: 'linear-gradient(135deg, #FFEAA7, #FFD93D)',
            boxShadow: '3px 3px 0px #1A1A1A',
          }}
        >
          <span className="text-lg">⭐</span>
          50 积分
        </div>
        <div
          className="w-10 h-10 flex items-center justify-center text-lg font-bold text-white transition-all duration-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          style={{
            fontFamily: 'var(--font-display)',
            border: '3px solid #1A1A1A',
            background: 'var(--accent-secondary)',
            boxShadow: '3px 3px 0px #1A1A1A',
          }}
        >
          U
        </div>
      </div>
    </nav>
  )
}
