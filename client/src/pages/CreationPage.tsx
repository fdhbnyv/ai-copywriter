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
    <div className="flex flex-col lg:flex-row h-[calc(100vh-56px)]">
      <aside className="w-full lg:w-[400px] xl:w-[440px] shrink-0 border-b lg:border-b-0 lg:border-r border-[var(--border-default)] p-5 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">生成控制台</h2>

        <div className="flex gap-1 mb-5 bg-[var(--bg-card)] p-1 rounded-lg">
          <button
            onClick={() => setMode('text')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === 'text' ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            ✍ 文案生成
          </button>
          <button
            onClick={() => setMode('image')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === 'image' ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            🎨 图片生成
          </button>
        </div>

        <div className="space-y-4">
          {mode === 'text' ? <CopywritingForm setCopywriting={setCopywriting} setLoading={setLoading} onGenerated={addTextToHistory} /> : <ImageForm setImageUrl={setImageUrl} setLoading={setLoading} prompt={prompt} setPrompt={setPrompt} onGenerated={addToHistory} />}
        </div>
      </aside>

      <main className="flex-1 p-5 overflow-y-auto">
        {mode === 'text' ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-[var(--border-default)] border-t-[var(--accent-primary)] rounded-full animate-spin" />
                <p className="text-[var(--text-secondary)]">AI 正在生成中...</p>
              </div>
            ) : copywriting ? (
              <div className="w-full max-w-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">生成结果</h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(copywriting)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    className="px-4 py-1.5 text-sm border rounded-lg transition-colors"
                    style={{ borderColor: copied ? 'var(--accent-success)' : 'var(--border-default)', color: copied ? 'var(--accent-success)' : 'var(--text-secondary)' }}
                  >
                    {copied ? '✓ 复制成功' : '复制文案'}
                  </button>
                </div>
                <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-5 text-left whitespace-pre-wrap leading-relaxed">
                  {copywriting}
                </div>
                {copyHistory.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm text-[var(--text-secondary)] mb-3">历史记录 ({copyHistory.length})</h4>
                    <div className="space-y-2">
                      {copyHistory.map((item, idx) => (
                        <button key={item.time} onClick={() => setCopywriting(item.text)} className={`w-full text-left p-3 rounded-lg border transition-colors ${idx === 0 ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5' : 'border-[var(--border-default)] hover:border-[var(--accent-primary)]'}`}>
                          <div className="text-xs text-[var(--text-muted)] mb-1">{item.product} · {new Date(item.time).toLocaleString('zh-CN')}</div>
                          <div className="text-sm text-[var(--text-secondary)] truncate">{item.text.slice(0, 80)}...</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-[var(--text-muted)]">
                <div className="text-6xl mb-4 opacity-30">✍</div>
                <p className="text-lg">输入产品信息，开始创作文案</p>
                <p className="text-sm mt-2">AI 将根据你的需求生成营销文案</p>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-[var(--border-default)] border-t-[var(--accent-primary)] rounded-full animate-spin" />
                <p className="text-[var(--text-secondary)]">AI 正在生成中...</p>
              </div>
            ) : imageUrl ? (
              <div className="w-full max-w-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">生成结果</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = `/api/proxy-download?url=${encodeURIComponent(imageUrl)}`
                        link.download = `ai-${Date.now()}.png`
                        link.click()
                      }}
                      className="px-4 py-1.5 text-sm border border-[var(--border-default)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      下载
                    </button>
                  </div>
                </div>
                <img src={imageUrl} alt="生成的图片" className="w-full rounded-xl border border-[var(--border-default)]" />
                {imageHistory.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm text-[var(--text-secondary)] mb-3">历史记录 ({imageHistory.length})</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {imageHistory.map((item) => (
                        <button key={item.time} onClick={() => setImageUrl(item.url)} className={`relative group rounded-lg overflow-hidden border transition-colors ${item.url === imageUrl ? 'border-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)]' : 'border-[var(--border-default)] hover:border-[var(--accent-primary)]'}`}>
                          <img src={item.url} alt="" className="w-full aspect-square object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
                            <span className="text-[10px] text-white/80 px-2 py-1 truncate w-full opacity-0 group-hover:opacity-100 transition-opacity">{item.prompt}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-[var(--text-muted)]">
                <div className="text-6xl mb-4 opacity-30">🎨</div>
                <p className="text-lg">输入提示词，开始生成图片</p>
                <p className="text-sm mt-2">AI 将把你的创意变成视觉作品</p>
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
      const res = await fetch('/api/generate-text', {
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
        <label className="block text-sm text-[var(--text-secondary)] mb-1.5">产品名称</label>
        <input
          value={product} onChange={(e) => setProduct(e.target.value)}
          placeholder="例如：无线蓝牙耳机"
          className="w-full px-3.5 py-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-active)] transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm text-[var(--text-secondary)] mb-1.5">产品特点</label>
        <textarea
          value={features} onChange={(e) => setFeatures(e.target.value)}
          placeholder="描述核心卖点..."
          rows={3}
          className="w-full px-3.5 py-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-active)] transition-colors resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1.5">目标群体</label>
          <input
            value={audience} onChange={(e) => setAudience(e.target.value)}
            placeholder="如：年轻人"
            className="w-full px-3.5 py-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-active)] transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1.5">发布平台</label>
          <input
            value={platform} onChange={(e) => setPlatform(e.target.value)}
            placeholder="如：小红书"
            className="w-full px-3.5 py-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-active)] transition-colors"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm text-[var(--text-secondary)] mb-1.5">文案风格</label>
        <div className="flex flex-wrap gap-2">
          {[{v:'professional',l:'专业'},{v:'friendly',l:'友好'},{v:'creative',l:'创意'},{v:'persuasive',l:'说服'},{v:'humorous',l:'幽默'}].map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => setTone(opt.v)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                tone === opt.v ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white' : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </div>
      <button
        type="submit"
        className="w-full h-11 text-sm font-semibold text-white rounded-lg transition-all duration-200 hover:brightness-110 active:translate-y-[1px]"
        style={{ background: 'var(--gradient-cta)' }}
      >
        生成文案
      </button>
    </form>
  )
}

function ImageForm({ setImageUrl, setLoading, prompt, setPrompt, onGenerated }: { setImageUrl: (v: string | null) => void; setLoading: (v: boolean) => void; prompt: string; setPrompt: (v: string) => void; onGenerated: (url: string, prompt: string) => void }) {
  const [size, setSize] = useState('1024x1024')
  const [count, setCount] = useState(1)
  const [style, setStyle] = useState('realistic')
  const [refImage, setRefImage] = useState<string | null>(null)
  const [strength, setStrength] = useState(70)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setRefImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleRemoveRef = () => {
    setRefImage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setLoading(true)
    setImageUrl(null)

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, size, count, style, refImage, strength }),
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

  const sizeOptions = ['1024x1024', '1024x1792', '1792x1024', '768x1024', '1024x768']
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
        <label className="block text-sm text-[var(--text-secondary)] mb-1.5">提示词</label>
        <textarea
          value={prompt} onChange={(e) => setPrompt(e.target.value)}
          placeholder="描述你想要生成的图片..."
          rows={4}
          className="w-full px-3.5 py-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-active)] transition-colors resize-none"
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-[var(--text-muted)]">{prompt.length}/500</span>
          {prompt && <button type="button" onClick={() => setPrompt('')} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]">清空</button>}
        </div>
      </div>

      <div>
        <label className="block text-sm text-[var(--text-secondary)] mb-1.5">参考图片（可选 / 图生图模式）</label>
        {refImage ? (
          <div className="relative mb-2">
            <img src={refImage} alt="参考图" className="w-full h-40 object-cover rounded-lg border border-[var(--border-default)]" />
            <button
              type="button"
              onClick={handleRemoveRef}
              className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center text-sm hover:bg-black/80"
            >
              ×
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-24 border-2 border-dashed border-[var(--border-default)] rounded-lg flex flex-col items-center justify-center text-[var(--text-muted)] hover:border-[var(--accent-primary)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
          >
            <span className="text-2xl mb-1">+</span>
            <span className="text-xs">点击上传参考图片</span>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        {refImage && (
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-[var(--text-secondary)] shrink-0">参考强度</span>
            <input
              type="range"
              min={10}
              max={100}
              value={strength}
              onChange={(e) => setStrength(Number(e.target.value))}
              className="flex-1 accent-[var(--accent-primary)]"
            />
            <span className="text-xs text-[var(--text-muted)] w-6 text-right">{strength}%</span>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm text-[var(--text-secondary)] mb-1.5">风格预设</label>
        <div className="flex flex-wrap gap-2">
          {styleOptions.map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => setStyle(opt.v)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                style === opt.v ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white' : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1.5">尺寸</label>
          <select
            value={size} onChange={(e) => setSize(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-active)] transition-colors"
          >
            {sizeOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1.5">数量</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCount(Math.max(1, count - 1))}
              className="w-9 h-9 flex items-center justify-center bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm hover:bg-[var(--bg-hover)] transition-colors"
            >−</button>
            <span className="w-8 text-center text-sm">{count}</span>
            <button
              type="button"
              onClick={() => setCount(Math.min(4, count + 1))}
              className="w-9 h-9 flex items-center justify-center bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm hover:bg-[var(--bg-hover)] transition-colors"
            >+</button>
          </div>
        </div>
      </div>

      <details className="group">
        <summary className="text-sm text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] transition-colors list-none flex items-center gap-1">
          <span className="text-xs opacity-50">▼</span>
          高级参数
        </summary>
        <div className="mt-3 space-y-3">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1.5">负面提示词</label>
            <input
              placeholder="不想出现在图片中的内容..."
              className="w-full px-3.5 py-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-active)] transition-colors"
            />
          </div>
        </div>
      </details>

      <button
        type="submit"
        className="w-full h-11 text-sm font-semibold text-white rounded-lg transition-all duration-200 hover:brightness-110 active:translate-y-[1px]"
        style={{ background: 'var(--gradient-cta)' }}
      >
        开始生成
      </button>
    </form>
  )
}
