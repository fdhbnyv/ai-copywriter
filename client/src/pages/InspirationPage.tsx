import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiBase } from '../utils/apiBase'

interface PromptItem {
  id: string
  title: string
  prompt: string
  category: string
  image: string
}

interface ApiResponse {
  items: PromptItem[]
  categories: string[]
  total: number
  page: number
  totalPages: number
  hasMore: boolean
}

export default function InspirationPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('全部')
  const [page, setPage] = useState(1)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fetchPrompts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ cat: category, search, page: String(page) })
      const res = await fetch(`${getApiBase()}/api/prompt-library?${params}`)
      const json = await res.json()
      setData(json)
    } catch {
      // fallback
    } finally {
      setLoading(false)
    }
  }, [category, search, page])

  useEffect(() => {
    fetchPrompts()
  }, [fetchPrompts])

  // Reset page when search/category changes
  useEffect(() => {
    setPage(1)
  }, [search, category])

  const handleUsePrompt = (prompt: string) => {
    // Navigate to creation page with prompt pre-filled via query param
    navigate(`/?prompt=${encodeURIComponent(prompt)}`)
  }

  const handleCopyPrompt = async (id: string, prompt: string) => {
    await navigator.clipboard.writeText(prompt)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-[var(--bg-primary)] min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-3xl flex items-center gap-2 mb-2"
          style={{ fontFamily: 'var(--font-display)', textShadow: '2px 2px 0px rgba(26,26,26,0.15)' }}
        >
          <span>💡</span> 灵感库
        </h1>
        <p className="text-base text-[var(--text-secondary)]" style={{ fontFamily: 'var(--font-body)' }}>
          浏览精选提示词案例，点击即可使用
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 搜索提示词..."
            className="w-full px-4 py-2.5 comic-input bg-[var(--bg-card)] pl-10"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">🔍</span>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {(data?.categories || ['全部', '写实', '动漫', '3D', '像素', '水彩', '设计', '科幻', '线稿']).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="px-4 py-1.5 text-sm transition-all duration-100"
              style={{
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.02em',
                border: '3px solid #1A1A1A',
                background: category === cat ? 'var(--accent-secondary)' : '#FFFFFF',
                color: category === cat ? '#FFFFFF' : '#1A1A1A',
                boxShadow: category === cat ? '3px 3px 0px #1A1A1A' : '2px 2px 0px #1A1A1A',
                transform: category === cat ? 'translate(-1px, -1px)' : 'none',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results info */}
      {data && !loading && (
        <div className="mb-4 text-sm text-[var(--text-muted)]" style={{ fontFamily: 'var(--font-body)' }}>
          共 {data.total} 个结果
          {search && <span> · 搜索 "{search}"</span>}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative mb-4">
            <div className="w-16 h-16 border-[4px] border-[#1A1A1A] border-t-[var(--accent-primary)] animate-comic-spin rounded-full" />
            <span className="absolute inset-0 flex items-center justify-center text-xl">💡</span>
          </div>
          <p className="text-lg animate-comic-pulse" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-primary)' }}>
            加载灵感中...
          </p>
        </div>
      )}

      {/* Prompt Grid */}
      {!loading && data && (
        <>
          {data.items.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4 animate-comic-bounce">🔍</div>
              <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                没有找到匹配的结果
              </p>
              <p className="text-base mt-2 text-[var(--text-secondary)]">
                试试其他关键词或分类
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {data.items.map((item) => (
                <div
                  key={item.id}
                  className="comic-card bg-[var(--bg-card)] overflow-hidden transition-all duration-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none group"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden border-b-[3px] border-[#1A1A1A] bg-[var(--bg-secondary)]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {/* Category badge */}
                    <div
                      className="absolute top-2 left-2 px-2.5 py-0.5 text-xs font-bold text-white"
                      style={{
                        fontFamily: 'var(--font-display)',
                        border: '2px solid #1A1A1A',
                        background: 'var(--accent-primary)',
                        boxShadow: '2px 2px 0px #1A1A1A',
                      }}
                    >
                      {item.category}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    <h3
                      className="text-base truncate mb-1"
                      style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-2 mb-3" style={{ fontFamily: 'var(--font-body)' }}>
                      {item.prompt}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUsePrompt(item.prompt)}
                        className="flex-1 py-1.5 text-xs font-bold text-white transition-all duration-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                        style={{
                          fontFamily: 'var(--font-display)',
                          border: '2px solid #1A1A1A',
                          background: 'var(--gradient-cta)',
                          boxShadow: '2px 2px 0px #1A1A1A',
                        }}
                      >
                        ⚡ 使用此提示词
                      </button>
                      <button
                        onClick={() => handleCopyPrompt(item.id, item.prompt)}
                        className="px-3 py-1.5 text-xs font-bold transition-all duration-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                        style={{
                          fontFamily: 'var(--font-display)',
                          border: '2px solid #1A1A1A',
                          background: copiedId === item.id ? 'var(--accent-success)' : '#FFFFFF',
                          color: copiedId === item.id ? '#FFFFFF' : '#1A1A1A',
                          boxShadow: '2px 2px 0px #1A1A1A',
                        }}
                      >
                        {copiedId === item.id ? '✓' : '📋'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-5 py-2 text-sm font-bold transition-all duration-100 disabled:opacity-40 disabled:cursor-not-allowed active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                style={{
                  fontFamily: 'var(--font-display)',
                  border: '3px solid #1A1A1A',
                  background: '#FFFFFF',
                  boxShadow: page > 1 ? '3px 3px 0px #1A1A1A' : 'none',
                }}
              >
                ◀ 上一页
              </button>
              <span
                className="px-4 py-1 text-sm font-bold"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {data.page} / {data.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page >= data.totalPages}
                className="px-5 py-2 text-sm font-bold transition-all duration-100 disabled:opacity-40 disabled:cursor-not-allowed active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                style={{
                  fontFamily: 'var(--font-display)',
                  border: '3px solid #1A1A1A',
                  background: '#FFFFFF',
                  boxShadow: page < data.totalPages ? '3px 3px 0px #1A1A1A' : 'none',
                }}
              >
                下一页 ▶
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
