import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/', label: '创作', icon: '✨' },
  { path: '/portfolio', label: '作品集', icon: '🖼️' },
  { path: '/inspiration', label: '灵感库', icon: '💡' },
]

export default function NavBar() {
  const location = useLocation()

  return (
    <nav
      className="h-16 flex items-center justify-between px-6 sticky top-0 z-50"
      style={{
        background: 'rgba(10, 10, 15, 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div className="flex items-center gap-8">
        <Link
          to="/"
          className="text-xl font-bold tracking-tight"
          style={{
            fontFamily: 'var(--font-display)',
            background: 'linear-gradient(135deg, #F472B6, #FB923C)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
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
                className="px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200"
                style={{
                  fontFamily: 'var(--font-display)',
                  background: isActive ? 'rgba(244, 114, 182, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(244, 114, 182, 0.2)' : '1px solid transparent',
                  color: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)',
                  backdropFilter: isActive ? 'blur(12px)' : 'none',
                }}
              >
                {item.icon} {item.label}
              </Link>
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 px-4 py-1.5 text-sm rounded-xl"
          style={{
            fontFamily: 'var(--font-display)',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          <span style={{ color: 'var(--accent-warning)' }}>✦</span>
          50
        </div>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold text-white"
          style={{
            fontFamily: 'var(--font-display)',
            background: 'linear-gradient(135deg, #F472B6, #FB923C)',
            boxShadow: '0 4px 15px rgba(244, 114, 182, 0.3)',
          }}
        >
          U
        </div>
      </div>
    </nav>
  )
}
