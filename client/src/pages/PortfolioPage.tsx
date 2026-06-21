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
type Tab = 'all' | 'images' | 'copywriting'

export default function PortfolioPage() {
  const [tab, setTab] = useState<Tab>('all')
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
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const deleteSelected = () => {
    const ni = images.filter(i => !selectedIds.has(`img-${i.time}`))
    const nc = copywritings.filter(c => !selectedIds.has(`copy-${c.time}`))
    localStorage.setItem('img-history', JSON.stringify(ni))
    localStorage.setItem('copy-history', JSON.stringify(nc))
    setImages(ni); setCopywritings(nc); setSelectedIds(new Set())
  }

  const clearAll = () => {
    localStorage.setItem('img-history', '[]')
    localStorage.setItem('copy-history', '[]')
    setImages([]); setCopywritings([]); setSelectedIds(new Set())
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
    { key: 'all' as const, label: '全部', count: images.length + copywritings.length },
    { key: 'images' as const, label: '图片', count: images.length },
    { key: 'copywriting' as const, label: '文案', count: copywritings.length },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-[calc(100vh-64px)]" style={{ background: 'transparent' }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
          <span>🖼️</span> 作品集
        </h1>
        <div className="flex items-center gap-2">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="glass-select px-3 py-1.5 rounded-xl text-sm">
            <option value="newest">最新</option>
            <option value="oldest">最早</option>
          </select>
          {selectedIds.size > 0 && (
            <button onClick={deleteSelected} className="px-4 py-1.5 text-sm font-medium rounded-xl text-white transition-all duration-200"
              style={{ background: 'rgba(251, 113, 133, 0.3)', border: '1px solid rgba(251, 113, 133, 0.3)', backdropFilter: 'blur(12px)' }}>
              删除 {selectedIds.size} 项
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', display: 'inline-flex' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200"
            style={{
              fontFamily: 'var(--font-display)',
              background: tab === t.key ? 'rgba(244,114,182,0.15)' : 'transparent',
              border: tab === t.key ? '1px solid rgba(244,114,182,0.2)' : '1px solid transparent',
              color: tab === t.key ? 'white' : 'var(--text-secondary)',
            }}>
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {visibleItems.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4 opacity-40">🖼️</div>
          <p className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>还没有作品</p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>去创作页面生成你的第一个作品吧</p>
          <a href="/" className="inline-block mt-4 px-6 py-2.5 text-sm font-semibold glass-btn rounded-xl">✨ 去创作</a>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: 'var(--text-secondary)' }}>
              <input type="checkbox" className="w-4 h-4 rounded"
                style={{ accentColor: 'var(--accent-primary)' }}
                checked={selectedIds.size === visibleItems.length && visibleItems.length > 0}
                onChange={() => {
                  if (selectedIds.size === visibleItems.length) setSelectedIds(new Set())
                  else setSelectedIds(new Set(visibleItems.map(v => v.id)))
                }} />
              全选 ({visibleItems.length})
            </label>
            <button onClick={clearAll} className="px-3 py-1 text-xs rounded-lg transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}>
              清空全部
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {visibleItems.map((item: any) => (
              <div key={item.id} className="glass-card rounded-xl overflow-hidden"
                style={{
                  borderColor: selectedIds.has(item.id) ? 'rgba(244,114,182,0.4)' : undefined,
                  boxShadow: selectedIds.has(item.id) ? '0 0 30px rgba(244,114,182,0.15)' : undefined,
                }}>
                <div className="absolute top-3 left-3 z-10" onClick={(e) => { e.stopPropagation(); toggleSelect(item.id) }}>
                  <input type="checkbox" className="w-4 h-4 rounded" style={{ accentColor: 'var(--accent-primary)' }}
                    checked={selectedIds.has(item.id)} onChange={() => toggleSelect(item.id)} />
                </div>
                {item.kind === 'image' ? (
                  <>
                    <div className="relative aspect-square overflow-hidden" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <img src={item.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="p-3">
                      <p className="text-xs leading-relaxed line-clamp-2 mb-2" style={{ color: 'var(--text-secondary)' }}>{item.prompt}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{new Date(item.time).toLocaleDateString('zh-CN')}</span>
                        <button onClick={() => {
                          const a = document.createElement('a')
                          a.href = `${getApiBase()}/api/proxy-download?url=${encodeURIComponent(item.url)}`
                          a.download = `ai-${item.time}.png`; a.click()
                        }} className="text-xs font-medium px-2.5 py-1 rounded-lg transition-all duration-200"
                          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}>
                          下载
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-3 flex flex-col min-h-[120px]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md"
                        style={{ background: 'rgba(244,114,182,0.15)', border: '1px solid rgba(244,114,182,0.2)', color: 'var(--accent-pink)' }}>
                        文案
                      </span>
                      <span className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{item.product}</span>
                    </div>
                    <p className="text-xs leading-relaxed line-clamp-5 flex-1" style={{ color: 'var(--text-secondary)' }}>{item.text}</p>
                    <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{new Date(item.time).toLocaleDateString('zh-CN')}</span>
                      <button onClick={() => navigator.clipboard.writeText(item.text)}
                        className="text-xs font-medium px-2.5 py-1 rounded-lg transition-all duration-200"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}>
                        复制
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
