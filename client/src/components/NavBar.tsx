import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/', label: '创作' },
  { path: '/portfolio', label: '作品集' },
  { path: '/inspiration', label: '灵感' },
]

export default function NavBar() {
  const location = useLocation()

  return (
    <nav className="h-14 flex items-center justify-between px-6 bg-[var(--bg-secondary)] border-b border-[var(--border-default)]">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
          ImagineForge
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
                location.pathname === item.path
                  ? 'text-[var(--text-primary)] bg-[var(--bg-hover)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-success)]" />
          50 积分
        </div>
        <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-sm font-medium">
          U
        </div>
      </div>
    </nav>
  )
}
