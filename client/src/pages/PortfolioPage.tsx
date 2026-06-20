import { useState, useEffect } from 'react'
import { getApiBase } from '../utils/apiBase'

interface ImageRecord {
  url: string
  prompt: string
  time: number
}

interface TextRecord {
  text: string
  product: string
  time: number
}

type PortfolioTab = 'all' | 'images' | 'copywriting'

export default function PortfolioPage() {
  const [tab, setTab] = useState<PortfolioTab>('all')
  const [images, setImages] = useState<ImageRecord[]>(() => {
    try { return JSON.parse(localStorage.getItem('img-history') || '[]') } catch { return [] }
  })
  const [copywritings, setCopywritings] = useState<TextRecord[]>(() => {
    try { return JSON.parse(localStorage.getItem('copy-history') || '[]') } catch { return [] }
  })
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')

  useEffect(() => {
    const handleStorage = () => {
      try { setImages(JSON.parse(localStorage.getItem('img-history') || '[]')) } catch { setImages([]) }
      try { setCopywritings(JSON.parse(localStorage.getItem('copy-history') || '[]')) } catch { setCopywritings([]) }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const deleteSelected = () => {
    const newImages = images.filter(i => !selectedIds.has(`img-${i.time}`))
    const newCopy = copywritings.filter(c => !selectedIds.has(`copy-${c.time}`))
    localStorage.setItem('img-history', JSON.stringify(newImages))
    localStorage.setItem('copy-history', JSON.stringify(newCopy))
    setImages(newImages)
    setCopywritings(newCopy)
    setSelectedIds(new Set())
  }

  const clearAll = () => {
    localStorage.setItem('img-history', '[]')
    localStorage.setItem('copy-history', '[]')
    setImages([])
    setCopywritings([])
    setSelectedIds(new Set())
  }

  const sortedImages = [...images].sort((a, b) => sortBy === 'newest' ? b.time - a.time : a.time - b.time)
  const sortedCopy = [...copywritings].sort((a, b) => sortBy === 'newest' ? b.time - a.time : a.time - b.time)

  const visibleItems = tab === 'all'
    ? [...sortedImages.map(i => ({ ...i, kind: 'image' as const, id: `img-${i.time}` })),
       ...sortedCopy.map(c => ({ ...c, kind: 'copywriting' as const, id: `copy-${c.time}` }))]
        .sort((a, b) => sortBy === 'newest' ? b.time - a.time : a.time - b.time)
    : tab === 'images'
      ? sortedImages.map(i => ({ ...i, kind: 'image' as const, id: `img-${i.time}` }))
      : sortedCopy.map(c => ({ ...c, kind: 'copywriting' as const, id: `copy-${c.time}` }))

  const tabs = [
    { key: 'all' as const, label: '📋 全部', count: images.length + copywritings.length },
    { key: 'images' as const, label: '🖼️ 图片', count: images.length },
    { key: 'copywriting' as const, label: '✏️ 文案', count: copywritings.length },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto bg-[var(--bg-primary)] min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-3xl flex items-center gap-2"
          style={{ fontFamily: 'var(--font-display)', textShadow: '2px 2px 0px rgba(26,26,26,0.15)' }}
        >
          <span>🎨</span> 作品集
        </h1>
        <div className="flex items-center gap-2">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
            className="comic-select px-3 py-1.5 bg-[var(--bg-card)] text-sm"
          >
            <option value="newest">最新优先</option>
            <option value="oldest">最早优先</option>
          </select>
          {/* Bulk delete */}
          {selectedIds.size > 0 && (
            <button
              onClick={deleteSelected}
              className="px-4 py-1.5 text-sm font-bold text-white transition-all duration-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              style={{
                fontFamily: 'var(--font-display)',
                border: '3px solid #1A1A1A',
                background: 'var(--accent-error)',
                boxShadow: '3px 3px 0px #1A1A1A',
              }}
            >
              删除 {selectedIds.size} 项
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1" style={{ border: '3px solid #1A1A1A', background: '#FFEAA7', boxShadow: '3px 3px 0px #1A1A1A', display: 'inline-flex' }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-5 py-2 text-sm transition-all duration-100 whitespace-nowrap"
            style={{
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.02em',
              border: tab === t.key ? '3px solid #1A1A1A' : '3px solid transparent',
              background: tab === t.key ? 'var(--accent-primary)' : 'transparent',
              color: tab === t.key ? '#FFFFFF' : '#1A1A1A',
              boxShadow: tab === t.key ? '3px 3px 0px #1A1A1A' : 'none',
              transform: tab === t.key ? 'translate(-1px, -1px)' : 'none',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {visibleItems.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4 animate-comic-bounce">🖼️</div>
          <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            {tab === 'all' ? '还没有任何作品' : tab === 'images' ? '还没有图片作品' : '还没有文案作品'}
          </p>
          <p className="text-base mt-2 text-[var(--text-secondary)]">
            去创作页面生成你的第一个作品吧！
          </p>
          <a
            href="/"
            className="inline-block mt-4 px-6 py-2 text-base font-bold text-white transition-all duration-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            style={{
              fontFamily: 'var(--font-display)',
              border: '3px solid #1A1A1A',
              background: 'var(--gradient-cta)',
              boxShadow: '4px 4px 0px #1A1A1A',
            }}
          >
            ⚡ 去创作
          </a>
        </div>
      )}

      {/* Grid */}
      {visibleItems.length > 0 && (
        <>
          {/* Select all / Clear all */}
          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 accent-[var(--accent-primary)]"
                checked={selectedIds.size === visibleItems.length}
                onChange={() => {
                  if (selectedIds.size === visibleItems.length) setSelectedIds(new Set())
                  else setSelectedIds(new Set(visibleItems.map(v => v.id)))
                }}
              />
              <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-body)' }}>
                全选 ({visibleItems.length})
              </span>
            </label>
            <button
              onClick={clearAll}
              className="px-3 py-1 text-xs font-bold transition-all duration-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              style={{
                fontFamily: 'var(--font-display)',
                border: '2px solid #1A1A1A',
                background: '#FFFFFF',
                boxShadow: '2px 2px 0px #1A1A1A',
              }}
            >
              🗑️ 清空全部
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {visibleItems.map((item) => (
              <div
                key={item.id}
                className="comic-card bg-[var(--bg-card)] overflow-hidden transition-all duration-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none group"
                style={{
                  borderColor: selectedIds.has(item.id) ? 'var(--accent-primary)' : '#1A1A1A',
                  boxShadow: selectedIds.has(item.id) ? '3px 3px 0px var(--accent-primary)' : 'var(--shadow-card)',
                }}
              >
                {/* Select checkbox */}
                <div
                  className="absolute top-2 left-2 z-10"
                  onClick={(e) => { e.stopPropagation(); toggleSelect(item.id) }}
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-[var(--accent-primary)]"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                  />
                </div>

                {/* Content */}
                {item.kind === 'image' ? (
                  <>
                    <div className="relative aspect-square overflow-hidden border-b-[3px] border-[#1A1A1A] bg-[var(--bg-secondary)]">
                      <img src={item.url} alt={item.prompt} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold text-white" style={{
                        fontFamily: 'var(--font-display)',
                        border: '2px solid #1A1A1A',
                        background: 'var(--accent-secondary)',
                        boxShadow: '2px 2px 0px #1A1A1A',
                      }}>
                        🖼️ 图片
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-2">{item.prompt}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {new Date(item.time).toLocaleDateString('zh-CN')}
                        </span>
                        <button
                          onClick={() => {
                            const link = document.createElement('a')
                            link.href = `${getApiBase()}/api/proxy-download?url=${encodeURIComponent(item.url)}`
                            link.download = `ai-${item.time}.png`
                            link.click()
                          }}
                          className="text-xs font-bold px-2 py-0.5 transition-all duration-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                          style={{
                            fontFamily: 'var(--font-display)',
                            border: '2px solid #1A1A1A',
                            background: '#FFFFFF',
                            boxShadow: '2px 2px 0px #1A1A1A',
                          }}
                        >
                          ⬇️ 下载
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 min-h-[120px] flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold text-white" style={{
                          fontFamily: 'var(--font-display)',
                          border: '2px solid #1A1A1A',
                          background: 'var(--accent-primary)',
                          boxShadow: '2px 2px 0px #1A1A1A',
                        }}>
                          ✏️ 文案
                        </span>
                        <span className="text-[10px] font-bold truncate" style={{ fontFamily: 'var(--font-body)' }}>
                          🏷️ {item.product}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-5 flex-1">
                        {('text' in item) ? item.text : ''}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t-2 border-[#1A1A1A]">
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {new Date(item.time).toLocaleDateString('zh-CN')}
                        </span>
                        <button
                          onClick={() => {
                            const text = ('text' in item) ? item.text : ''
                            navigator.clipboard.writeText(text)
                          }}
                          className="text-xs font-bold px-2 py-0.5 transition-all duration-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                          style={{
                            fontFamily: 'var(--font-display)',
                            border: '2px solid #1A1A1A',
                            background: '#FFFFFF',
                            boxShadow: '2px 2px 0px #1A1A1A',
                          }}
                        >
                          📋 复制
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
