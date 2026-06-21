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
  const [initialLoad, setInitialLoad] = useState(true)

  const fetchPrompts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ cat: category, search, page: String(page) })
      const res = await fetch(`${getApiBase()}/api/prompt-library?${params}`)
      const json = await res.json()
      setData(json)
      setInitialLoad(false)
    } catch {
      setInitialLoad(false)
    } finally {
      setLoading(false)
    }
  }, [category, search, page])

  useEffect(() => { fetchPrompts() }, [fetchPrompts])
  useEffect(() => { setPage(1) }, [search, category])

  const handleUsePrompt = (prompt: string) => {
    navigate(`/?prompt=${encodeURIComponent(prompt)}`)
  }

  const handleCopyPrompt = async (id: string, prompt: string) => {
    await navigator.clipboard.writeText(prompt)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const cats = data?.categories || ['全部', '写实', '动漫', '3D', '像素', '水彩', '设计', '科幻', '线稿']

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
          <span>💡</span> 灵感库
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>浏览精选 Prompt，点击即可使用</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm" style={{ opacity: 0.4 }}>🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索提示词..."
            className="w-full pl-9 pr-4 py-2.5 glass-input rounded-xl text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {cats.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all duration-200"
              style={{
                fontFamily: 'var(--font-display)',
                background: category === cat ? 'rgba(244, 114, 182, 0.15)' : 'rgba(255,255,255,0.04)',
                border: category === cat ? '1px solid rgba(244, 114, 182, 0.25)' : '1px solid rgba(255,255,255,0.06)',
                color: category === cat ? 'rgba(255,255,255,0.95)' : 'var(--text-secondary)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {data && !loading && (
        <div className="mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          共 {data.total} 个结果{search ? ` · 搜索「${search}」` : ''}
        </div>
      )}

      {/* Loading */}
      {(loading && initialLoad) ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="glass-spinner w-12 h-12 mb-4" />
          <p className="text-sm glass-pulse" style={{ color: 'var(--text-secondary)' }}>加载灵感中...</p>
        </div>
      ) : null}

      {/* Grid */}
      {!loading && data && data.items.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-4" style={{ opacity: 0.3 }}>🔍</div>
          <p className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)' }}>没有找到匹配的结果</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>试试其他关键词或分类</p>
        </div>
      ) : null}

      {data && data.items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.items.map((item) => (
            <div key={item.id} className="glass-card rounded-xl overflow-hidden glass-fade-in">
              <div className="relative aspect-[4/3] overflow-hidden" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" loading="lazy" />
                <div
                  className="absolute top-2.5 left-2.5 px-2.5 py-0.5 text-[10px] font-semibold rounded-lg"
                  style={{
                    fontFamily: 'var(--font-display)',
                    background: 'rgba(244, 114, 182, 0.2)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(244, 114, 182, 0.2)',
                    color: 'rgba(255,255,255,0.9)',
                  }}
                >
                  {item.category}
                </div>
              </div>
              <div className="p-3.5">
                <h3 className="text-sm font-semibold truncate mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                  {item.title}
                </h3>
                <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: 'var(--text-muted)' }}>
                  {item.prompt}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUsePrompt(item.prompt)}
                    className="flex-1 py-1.5 text-xs font-semibold glass-btn rounded-lg"
                  >
                    使用此 Prompt
                  </button>
                  <button
                    onClick={() => handleCopyPrompt(item.id, item.prompt)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg glass-btn-secondary"
                    style={{
                      background: copiedId === item.id ? 'rgba(52, 211, 153, 0.15)' : undefined,
                      borderColor: copiedId === item.id ? 'rgba(52, 211, 153, 0.2)' : undefined,
                      color: copiedId === item.id ? 'var(--accent-success)' : undefined,
                    }}
                  >
                    {copiedId === item.id ? '已复制' : '复制'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 text-xs font-medium rounded-xl glass-btn-secondary disabled:opacity-30"
          >
            ← 上一页
          </button>
          <span className="text-sm font-medium" style={{ fontFamily: 'var(--font-display)' }}>
            {data.page} / {data.totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
            disabled={page >= data.totalPages}
            className="px-4 py-2 text-xs font-medium rounded-xl glass-btn-secondary disabled:opacity-30"
          >
            下一页 →
          </button>
        </div>
      )}

      {/* Skeleton while loading more pages */}
      {loading && !initialLoad && (
        <div className="flex items-center justify-center py-8">
          <div className="glass-spinner w-8 h-8" />
        </div>
      )}
    </div>
  )
}
