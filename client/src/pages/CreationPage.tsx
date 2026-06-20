import { getApiBase } from '../utils/apiBase'
import { useState, useRef, useEffect } from 'react'

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

export default function CreationPage() {
  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState<'text' | 'image'>('text')
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageHistory, setImageHistory] = useState<ImageRecord[]>(() => {
    try { return JSON.parse(localStorage.getItem('img-history') || '[]') } catch { return [] }
  })
  const [copywriting, setCopywriting] = useState('')
  const [copyHistory, setCopyHistory] = useState<TextRecord[]>(() => {
    try { return JSON.parse(localStorage.getItem('copy-history') || '[]') } catch { return [] }
  })
  const [copied, setCopied] = useState(false)

  useEffect(() => { localStorage.setItem('img-history', JSON.stringify(imageHistory)) }, [imageHistory])
  useEffect(() => { localStorage.setItem('copy-history', JSON.stringify(copyHistory)) }, [copyHistory])

  const addToHistory = (url: string, p: string) => {
    setImageHistory(prev => [{ url, prompt: p, time: Date.now() }, ...prev].slice(0, 50))
  }

  const addTextToHistory = (text: string, product: string) => {
    setCopyHistory(prev => [{ text, product, time: Date.now() }, ...prev].slice(0, 50))
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] bg-[var(--bg-primary)]">
      {/* 左侧面板 — 漫画风 */}
      <aside className="w-full lg:w-[420px] xl:w-[460px] shrink-0 border-r-[3px] border-[#1A1A1A] p-5 overflow-y-auto bg-[var(--bg-card)]">
        <h2
          className="text-2xl mb-5 text-[var(--accent-primary)] flex items-center gap-2"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.03em', textShadow: '2px 2px 0px rgba(26,26,26,0.2)' }}
        >
          <span>⚡</span> 生成控制台
        </h2>

        {/* 模式切换 — 漫画式 tab */}
        <div className="flex gap-1 mb-5 p-1" style={{ border: '3px solid #1A1A1A', background: '#FFEAA7', boxShadow: '3px 3px 0px #1A1A1A' }}>
          <button
            onClick={() => setMode('text')}
            className="flex-1 py-2.5 text-base transition-all duration-100"
            style={{
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.02em',
              border: mode === 'text' ? '3px solid #1A1A1A' : '3px solid transparent',
              background: mode === 'text' ? 'var(--accent-primary)' : 'transparent',
              color: mode === 'text' ? '#FFFFFF' : '#1A1A1A',
              boxShadow: mode === 'text' ? '3px 3px 0px #1A1A1A' : 'none',
              transform: mode === 'text' ? 'translate(-1px, -1px)' : 'none',
            }}
          >
            ✏️ 文案生成
          </button>
          <button
            onClick={() => setMode('image')}
            className="flex-1 py-2.5 text-base transition-all duration-100"
            style={{
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.02em',
              border: mode === 'image' ? '3px solid #1A1A1A' : '3px solid transparent',
              background: mode === 'image' ? 'var(--accent-primary)' : 'transparent',
              color: mode === 'image' ? '#FFFFFF' : '#1A1A1A',
              boxShadow: mode === 'image' ? '3px 3px 0px #1A1A1A' : 'none',
              transform: mode === 'image' ? 'translate(-1px, -1px)' : 'none',
            }}
          >
            🎨 图片生成
          </button>
        </div>

        <div className="space-y-4">
          {mode === 'text'
            ? <CopywritingForm setCopywriting={setCopywriting} setLoading={setLoading} onGenerated={addTextToHistory} />
            : <ImageForm setImageUrl={setImageUrl} setLoading={setLoading} prompt={prompt} setPrompt={setPrompt} onGenerated={addToHistory} />
          }
        </div>
      </aside>

      {/* 右侧主内容区 — 漫画风 */}
      <main className="flex-1 p-6 overflow-y-auto bg-[var(--bg-primary)] bg-comic-dots-light">
        {mode === 'text' ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            {loading ? (
              <div className="flex flex-col items-center gap-5">
                <div className="relative">
                  <div className="w-20 h-20 border-[4px] border-[#1A1A1A] border-t-[var(--accent-primary)] animate-comic-spin rounded-full" />
                  <span className="absolute inset-0 flex items-center justify-center text-2xl">✏️</span>
                </div>
                <p
                  className="text-lg animate-comic-pulse"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-primary)' }}
                >
                  AI 正在构思中...
                </p>
              </div>
            ) : copywriting ? (
              <div className="w-full max-w-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-xl flex items-center gap-2"
                    style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}
                  >
                    <span>📝</span> 生成结果
                  </h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(copywriting)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    className="comic-btn px-5 py-2 text-sm bg-[var(--accent-success)] text-white"
                  >
                    {copied ? '✓ 复制成功!' : '📋 复制文案'}
                  </button>
                </div>
                <div
                  className="comic-card p-5 text-left whitespace-pre-wrap leading-relaxed text-base bg-[var(--bg-card)]"
                  style={{ minHeight: '120px' }}
                >
                  {copywriting}
                </div>
                {copyHistory.length > 0 && (
                  <div className="mt-6">
                    <h4
                      className="text-base mb-3 flex items-center gap-2"
                      style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}
                    >
                      <span>📚</span> 历史记录 ({copyHistory.length})
                    </h4>
                    <div className="space-y-2">
                      {copyHistory.map((item, idx) => (
                        <button
                          key={item.time}
                          onClick={() => setCopywriting(item.text)}
                          className="w-full text-left p-3 comic-border-sm transition-all duration-100 hover:translate-x-[1px] hover:translate-y-[1px]"
                          style={{
                            background: idx === 0 ? '#FFEAA7' : '#FFFFFF',
                          }}
                        >
                          <div className="text-xs text-[var(--text-muted)] mb-1" style={{ fontFamily: 'var(--font-body)' }}>
                            🏷️ {item.product} · {new Date(item.time).toLocaleString('zh-CN')}
                          </div>
                          <div className="text-sm text-[var(--text-secondary)] truncate">{item.text.slice(0, 80)}...</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-[var(--text-muted)]">
                <div className="text-7xl mb-4 animate-comic-bounce">✏️</div>
                <p className="text-xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
                  输入产品信息，开始创作文案
                </p>
                <p className="text-base mt-2 text-[var(--text-secondary)]">AI 将根据你的需求生成营销文案</p>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            {loading ? (
              <div className="flex flex-col items-center gap-5">
                <div className="relative">
                  <div className="w-20 h-20 border-[4px] border-[#1A1A1A] border-t-[var(--accent-primary)] animate-comic-spin rounded-full" />
                  <span className="absolute inset-0 flex items-center justify-center text-2xl">🎨</span>
                </div>
                <p
                  className="text-lg animate-comic-pulse"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-primary)' }}
                >
                  AI 正在绘制中...
                </p>
              </div>
            ) : imageUrl ? (
              <div className="w-full max-w-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-xl flex items-center gap-2"
                    style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}
                  >
                    <span>🖼️</span> 生成结果
                  </h3>
                  <button
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = `${getApiBase()}/api/proxy-download?url=${encodeURIComponent(imageUrl)}`
                      link.download = `ai-${Date.now()}.png`
                      link.click()
                    }}
                    className="comic-btn px-5 py-2 text-sm bg-[var(--accent-secondary)] text-white"
                  >
                    ⬇️ 下载
                  </button>
                </div>
                <div className="comic-card p-2 bg-[var(--bg-card)]">
                  <img src={imageUrl} alt="生成的图片" className="w-full border-2 border-[#1A1A1A]" />
                </div>
                {imageHistory.length > 0 && (
                  <div className="mt-6">
                    <h4
                      className="text-base mb-3 flex items-center gap-2"
                      style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}
                    >
                      <span>🖼️</span> 历史记录 ({imageHistory.length})
                    </h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {imageHistory.map((item) => (
                        <button
                          key={item.time}
                          onClick={() => setImageUrl(item.url)}
                          className="relative group comic-border-sm overflow-hidden transition-all duration-100 hover:translate-x-[1px] hover:translate-y-[1px]"
                          style={{
                            background: '#FFFFFF',
                            borderColor: item.url === imageUrl ? 'var(--accent-primary)' : '#1A1A1A',
                            boxShadow: item.url === imageUrl ? '3px 3px 0px var(--accent-primary)' : '3px 3px 0px #1A1A1A',
                          }}
                        >
                          <img src={item.url} alt="" className="w-full aspect-square object-cover border-b-2 border-[#1A1A1A]" />
                          <div className="p-1.5">
                            <span className="text-[10px] text-[var(--text-muted)] truncate block" style={{ fontFamily: 'var(--font-body)' }}>
                              {item.prompt}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-[var(--text-muted)]">
                <div className="text-7xl mb-4 animate-comic-bounce">🎨</div>
                <p className="text-xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
                  输入提示词，开始生成图片
                </p>
                <p className="text-base mt-2 text-[var(--text-secondary)]">AI 将把你的创意变成视觉作品</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function CopywritingForm({ setCopywriting, setLoading, onGenerated }: { setCopywriting: (v: string) => void; setLoading: (v: boolean) => void; onGenerated: (text: string, product: string) => void }) {
  const [product, setProduct] = useState('')
  const [features, setFeatures] = useState('')
  const [tone, setTone] = useState('professional')
  const [audience, setAudience] = useState('')
  const [platform, setPlatform] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product.trim()) return

    setLoading(true)
    try {
      const res = await fetch(`${getApiBase()}/api/generate-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, features, tone, audience, platform }),
      })
      const data = await res.json()
      if (data.copywriting) {
        setCopywriting(data.copywriting)
        onGenerated(data.copywriting, product)
      } else if (data.error) {
        setCopywriting(`错误: ${data.error}`)
      }
    } catch (err: any) {
      setCopywriting(`请求失败: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm mb-1.5 font-bold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>
          🏷️ 产品名称
        </label>
        <input
          value={product} onChange={(e) => setProduct(e.target.value)}
          placeholder="例如：无线蓝牙耳机"
          className="w-full px-4 py-2.5 comic-input bg-[var(--bg-input)]"
        />
      </div>
      <div>
        <label className="block text-sm mb-1.5 font-bold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>
          ⭐ 产品特点
        </label>
        <textarea
          value={features} onChange={(e) => setFeatures(e.target.value)}
          placeholder="描述核心卖点..."
          rows={3}
          className="w-full px-4 py-2.5 comic-input bg-[var(--bg-input)] resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1.5 font-bold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>
            👥 目标群体
          </label>
          <input
            value={audience} onChange={(e) => setAudience(e.target.value)}
            placeholder="如：年轻人"
            className="w-full px-4 py-2.5 comic-input bg-[var(--bg-input)]"
          />
        </div>
        <div>
          <label className="block text-sm mb-1.5 font-bold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>
            📱 发布平台
          </label>
          <input
            value={platform} onChange={(e) => setPlatform(e.target.value)}
            placeholder="如：小红书"
            className="w-full px-4 py-2.5 comic-input bg-[var(--bg-input)]"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm mb-1.5 font-bold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>
          🎭 文案风格
        </label>
        <div className="flex flex-wrap gap-2">
          {[{v:'professional',l:'专业'},{v:'friendly',l:'友好'},{v:'creative',l:'创意'},{v:'persuasive',l:'说服'},{v:'humorous',l:'幽默'}].map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => setTone(opt.v)}
              className="px-4 py-1.5 text-sm transition-all duration-100"
              style={{
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.02em',
                border: '3px solid #1A1A1A',
                background: tone === opt.v ? 'var(--accent-primary)' : '#FFFFFF',
                color: tone === opt.v ? '#FFFFFF' : '#1A1A1A',
                boxShadow: tone === opt.v ? '3px 3px 0px #1A1A1A' : '2px 2px 0px #1A1A1A',
                transform: tone === opt.v ? 'translate(-1px, -1px)' : 'none',
              }}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </div>
      <button
        type="submit"
        className="w-full h-12 text-lg font-bold text-white comic-btn active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        style={{
          background: 'var(--gradient-cta)',
          border: '3px solid #1A1A1A',
          boxShadow: '4px 4px 0px #1A1A1A',
        }}
      >
        ⚡ 生成文案！
      </button>
    </form>
  )
}

function ImageForm({ setImageUrl, setLoading, prompt, setPrompt, onGenerated }: { setImageUrl: (v: string | null) => void; setLoading: (v: boolean) => void; prompt: string; setPrompt: (v: string) => void; onGenerated: (url: string, prompt: string) => void }) {
  const [size, setSize] = useState('1024x1024')
  const [count, setCount] = useState(1)
  const [style, setStyle] = useState('realistic')
  const [refImages, setRefImages] = useState<string[]>([])
  const [strength, setStrength] = useState(70)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setRefImages(prev => [...prev, reader.result as string].slice(0, 16))
      }
      reader.readAsDataURL(file)
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRemoveRef = (index: number) => {
    setRefImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setLoading(true)
    setImageUrl(null)

    try {
      const hasRefImages = refImages.length > 0
      const base = getApiBase()
      const endpoint = hasRefImages ? `${base}/api/edit-image` : `${base}/api/generate-image`
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hasRefImages ? { prompt, size, count, style, refImages } : { prompt, size, count, style }),
      })
      const data = await res.json()
      if (data.images && data.images.length > 0) {
        setImageUrl(data.images[0].url)
        onGenerated(data.images[0].url, prompt)
      } else if (data.error) {
        setImageUrl(null)
        alert(`生成失败: ${data.error}`)
      }
    } catch (err: any) {
      alert(`请求失败: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const sizeOptions = [
    { v: '1024x1024', l: '1024×1024 (1:1)' },
    { v: '1024x1792', l: '1024×1792 (9:16)' },
    { v: '1792x1024', l: '1792×1024 (16:9)' },
    { v: '768x1024', l: '768×1024 (3:4)' },
    { v: '1024x768', l: '1024×768 (4:3)' },
    { v: '576x1024', l: '576×1024 (9:16)' },
    { v: '1024x576', l: '1024×576 (16:9)' },
  ]
  const styleOptions = [
    { v: 'realistic', l: '写实' },
    { v: 'anime', l: '动漫' },
    { v: 'pixel', l: '像素' },
    { v: '3d', l: '3D' },
    { v: 'watercolor', l: '水彩' },
    { v: 'sketch', l: '线稿' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm mb-1.5 font-bold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>
          ✨ 提示词
        </label>
        <textarea
          value={prompt} onChange={(e) => setPrompt(e.target.value)}
          placeholder="描述你想要生成的图片..."
          rows={4}
          className="w-full px-4 py-2.5 comic-input bg-[var(--bg-input)] resize-none"
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-[var(--text-muted)]" style={{ fontFamily: 'var(--font-body)' }}>
            {prompt.length}/500
          </span>
          {prompt && (
            <button type="button" onClick={() => setPrompt('')} className="text-xs comic-border-sm px-2 py-0.5 bg-[var(--bg-card)]">
              ✖ 清空
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1.5 font-bold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>
          🖼️ 参考图片（可选 / 最多16张）
        </label>
        {refImages.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 mb-2">
            {refImages.map((img, i) => (
              <div key={i} className="relative comic-border-sm overflow-hidden">
                <img src={img} alt={`参考图${i + 1}`} className="w-full h-24 object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveRef(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-[var(--accent-primary)] text-white flex items-center justify-center text-sm font-bold"
                  style={{ border: '2px solid #1A1A1A', fontFamily: 'var(--font-display)' }}
                >
                  ×
                </button>
              </div>
            ))}
            {refImages.length < 16 && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-24 comic-border-sm flex flex-col items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer bg-[var(--bg-input)]"
              >
                <span className="text-2xl font-bold">+</span>
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-24 comic-border-sm flex flex-col items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer bg-[var(--bg-input)]"
          >
            <span className="text-3xl font-bold mb-1">+</span>
            <span className="text-xs" style={{ fontFamily: 'var(--font-body)' }}>点击上传参考图片</span>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        {refImages && refImages.length > 0 && (
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs font-bold" style={{ fontFamily: 'var(--font-display)' }}>参考强度</span>
            <input
              type="range"
              min={10}
              max={100}
              value={strength}
              onChange={(e) => setStrength(Number(e.target.value))}
              className="flex-1 comic-range"
            />
            <span className="text-xs font-bold w-6 text-right" style={{ fontFamily: 'var(--font-display)' }}>{strength}%</span>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm mb-1.5 font-bold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>
          🎨 风格预设
        </label>
        <div className="flex flex-wrap gap-2">
          {styleOptions.map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => setStyle(opt.v)}
              className="px-4 py-1.5 text-sm transition-all duration-100"
              style={{
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.02em',
                border: '3px solid #1A1A1A',
                background: style === opt.v ? 'var(--accent-secondary)' : '#FFFFFF',
                color: style === opt.v ? '#FFFFFF' : '#1A1A1A',
                boxShadow: style === opt.v ? '3px 3px 0px #1A1A1A' : '2px 2px 0px #1A1A1A',
                transform: style === opt.v ? 'translate(-1px, -1px)' : 'none',
              }}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1.5 font-bold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>
            📐 尺寸
          </label>
          <select
            value={size} onChange={(e) => setSize(e.target.value)}
            className="w-full px-4 py-2.5 comic-select bg-[var(--bg-input)] text-sm"
          >
            {sizeOptions.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1.5 font-bold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>
            🔢 数量
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCount(Math.max(1, count - 1))}
              className="w-10 h-10 flex items-center justify-center text-lg font-bold bg-[var(--bg-card)] transition-all duration-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              style={{ border: '3px solid #1A1A1A', boxShadow: '3px 3px 0px #1A1A1A' }}
            >−</button>
            <span className="w-8 text-center text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>{count}</span>
            <button
              type="button"
              onClick={() => setCount(Math.min(4, count + 1))}
              className="w-10 h-10 flex items-center justify-center text-lg font-bold bg-[var(--bg-card)] transition-all duration-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              style={{ border: '3px solid #1A1A1A', boxShadow: '3px 3px 0px #1A1A1A' }}
            >+</button>
          </div>
        </div>
      </div>

      <details className="comic-details bg-[var(--bg-card)]">
        <summary className="px-4 py-3 text-sm font-bold flex items-center gap-2 cursor-pointer select-none" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>
          <span className="text-xs transition-transform duration-200">▶</span>
          高级参数
        </summary>
        <div className="px-4 pb-4 space-y-3 border-t-[3px] border-[#1A1A1A] pt-3">
          <div>
            <label className="block text-sm mb-1.5 font-bold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>
              ⛔ 负面提示词
            </label>
            <input
              placeholder="不想出现在图片中的内容..."
              className="w-full px-4 py-2.5 comic-input bg-[var(--bg-input)]"
            />
          </div>
        </div>
      </details>

      <button
        type="submit"
        className="w-full h-12 text-lg font-bold text-white comic-btn active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        style={{
          background: 'var(--gradient-cta)',
          border: '3px solid #1A1A1A',
          boxShadow: '4px 4px 0px #1A1A1A',
        }}
      >
        ⚡ 开始生成！
      </button>
    </form>
  )
}
