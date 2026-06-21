import { getApiBase } from '../utils/apiBase'
import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

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
  const [searchParams] = useSearchParams()
  const [prompt, setPrompt] = useState(() => searchParams.get('prompt') || '')
  const [mode, setMode] = useState<'text' | 'image'>(searchParams.get('prompt') ? 'image' : 'text')
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
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
      <aside
        className="w-full lg:w-[400px] xl:w-[440px] shrink-0 p-5 overflow-y-auto"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(12px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <h2 className="text-lg font-semibold mb-5 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
          <span>&#10024;</span> 生成控制台
        </h2>

        <div
          className="flex gap-1 mb-5 p-1 rounded-xl"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          {(['text', 'image'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
              style={{
                fontFamily: 'var(--font-display)',
                background: mode === m ? 'rgba(244, 114, 182, 0.2)' : 'transparent',
                border: mode === m ? '1px solid rgba(244, 114, 182, 0.25)' : '1px solid transparent',
                color: mode === m ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)',
                backdropFilter: mode === m ? 'blur(12px)' : 'none',
                boxShadow: mode === m ? '0 0 20px rgba(244, 114, 182, 0.1)' : 'none',
              }}
            >
              {m === 'text' ? '&#9997;&#65039; 文案生成' : '&#127912; 图片生成'}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {mode === 'text'
            ? <CopywritingForm setCopywriting={setCopywriting} setLoading={setLoading} onGenerated={addTextToHistory} />
            : <ImageForm setImageUrl={setImageUrl} setLoading={setLoading} prompt={prompt} setPrompt={setPrompt} onGenerated={addToHistory} />
          }
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
        {mode === 'text' ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            {loading ? (
              <div className="flex flex-col items-center gap-5 glass-fade-in">
                <div className="glass-spinner w-14 h-14" />
                <p className="text-base glass-pulse" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-pink)' }}>
                  AI 正在构思文案...
                </p>
              </div>
            ) : copywriting ? (
              <div className="w-full max-w-2xl glass-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                    &#128221; 生成结果
                  </h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(copywriting)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    className="glass-btn-secondary px-4 py-2 text-sm rounded-xl"
                  >
                    {copied ? '&#10003; 复制成功' : '&#128203; 复制文案'}
                  </button>
                </div>
                <div className="glass-card p-5 text-left whitespace-pre-wrap leading-relaxed text-sm rounded-xl">
                  {copywriting}
                </div>
              </div>
            ) : (
              <div className="glass-fade-in" style={{ color: 'var(--text-muted)' }}>
                <div className="text-6xl mb-4 opacity-40">&#9997;&#65039;</div>
                <p className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                  输入产品信息，开始创作文案
                </p>
                <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                  AI 将根据你的需求生成营销文案
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            {loading ? (
              <div className="flex flex-col items-center gap-5 glass-fade-in">
                <div className="glass-spinner w-14 h-14" />
                <p className="text-base glass-pulse" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-pink)' }}>
                  AI 正在绘制中...
                </p>
              </div>
            ) : imageUrl ? (
              <div className="w-full max-w-2xl glass-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                    &#128444;&#65039; 生成结果
                  </h3>
                  <button
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = `${getApiBase()}/api/proxy-download?url=${encodeURIComponent(imageUrl)}`
                      link.download = `ai-${Date.now()}.png`
                      link.click()
                    }}
                    className="glass-btn-secondary px-4 py-2 text-sm rounded-xl"
                  >
                    &#11015;&#65039; 下载
                  </button>
                </div>
                <div className="glass-card p-2 rounded-xl">
                  <img src={imageUrl} alt="生成的图片" className="w-full rounded-lg" />
                </div>
              </div>
            ) : (
              <div className="glass-fade-in" style={{ color: 'var(--text-muted)' }}>
                <div className="text-6xl mb-4 opacity-40">&#127912;</div>
                <p className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                  输入提示词，开始生成图片
                </p>
                <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                  AI 将把你的创意变成视觉作品
                </p>
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
        setCopywriting('错误: ' + data.error)
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message?.includes('timed out') || err.message?.includes('timeout')) {
        setCopywriting('生成超时，请重试')
      } else {
        setCopywriting('请求失败: ' + err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
          产品名称
        </label>
        <input
          value={product} onChange={(e) => setProduct(e.target.value)}
          placeholder="例如：无线蓝牙耳机"
          className="w-full px-4 py-2.5 glass-input rounded-xl text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
          产品特点
        </label>
        <textarea
          value={features} onChange={(e) => setFeatures(e.target.value)}
          placeholder="描述核心卖点..."
          rows={3}
          className="w-full px-4 py-2.5 glass-input rounded-xl text-sm resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
            目标群体
          </label>
          <input
            value={audience} onChange={(e) => setAudience(e.target.value)}
            placeholder="如：年轻人"
            className="w-full px-4 py-2.5 glass-input rounded-xl text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
            发布平台
          </label>
          <input
            value={platform} onChange={(e) => setPlatform(e.target.value)}
            placeholder="如：小红书"
            className="w-full px-4 py-2.5 glass-input rounded-xl text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
          文案风格
        </label>
        <div className="flex flex-wrap gap-2">
          {[{v:'professional',l:'专业'},{v:'friendly',l:'友好'},{v:'creative',l:'创意'},{v:'persuasive',l:'说服'},{v:'humorous',l:'幽默'}].map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => setTone(opt.v)}
              className="px-3 py-1.5 text-xs font-medium rounded-xl transition-all duration-200"
              style={{
                background: tone === opt.v ? 'rgba(244, 114, 182, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: tone === opt.v ? '1px solid rgba(244, 114, 182, 0.25)' : '1px solid rgba(255, 255, 255, 0.06)',
                color: tone === opt.v ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)',
                backdropFilter: tone === opt.v ? 'blur(8px)' : 'none',
              }}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </div>
      <button
        type="submit"
        className="glass-btn w-full h-11 text-sm font-semibold rounded-xl"
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
  const [model, setModel] = useState<'premium' | 'free'>('premium')
  const [refImages, setRefImages] = useState<string[]>([])
  const [strength, setStrength] = useState(70)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset to supported sizes when switching models
  const freeSizes = ['1024x1024', '1024x1792', '1792x1024']
  useEffect(() => {
    if (model === 'free' && !freeSizes.includes(size)) {
      setSize('1024x1024')
    }
  }, [model])

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
      const endpoint = hasRefImages ? base + '/api/edit-image' : base + '/api/generate-image'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hasRefImages ? { prompt, size, count, style, refImages, model } : { prompt, size, count, style, model }),
      })
      let data: any
      try {
        data = await res.json()
      } catch {
        const text = await res.text().catch(() => '')
        alert('服务器返回异常: ' + (text || res.status + ' ' + res.statusText))
        setLoading(false)
        return
      }
      if (data.images && data.images.length > 0) {
        setImageUrl(data.images[0].url)
        onGenerated(data.images[0].url, prompt)
      } else if (data.error) {
        setImageUrl(null)
        alert('生成失败: ' + data.error)
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message?.includes('timed out') || err.message?.includes('timeout')) {
        alert('图片生成超时，请重试或选择较小的尺寸')
      } else {
        alert('请求失败: ' + err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const premiumSizeOptions = [
    { v: '1024x1024', l: '1024x1024 (1:1)' },
    { v: '1536x1024', l: '1536x1024 (3:2)' },
    { v: '1024x1536', l: '1024x1536 (2:3)' },
    { v: '1824x1024', l: '1824x1024 (16:9)' },
    { v: '1024x1824', l: '1024x1824 (9:16)' },
    { v: '1360x1024', l: '1360x1024 (4:3)' },
    { v: '1024x1360', l: '1024x1360 (3:4)' },
    { v: '2384x1024', l: '2384x1024 (21:9)' },
  ]
  const freeSizeOptions = [
    { v: '1024x1024', l: '1024x1024 (1:1)' },
    { v: '1024x1792', l: '1024x1792 (9:16)' },
    { v: '1792x1024', l: '1792x1024 (16:9)' },
  ]
  const sizeOptions = model === 'premium' ? premiumSizeOptions : freeSizeOptions
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
        <label className="block text-xs font-medium mb-1.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
          提示词
        </label>
        <textarea
          value={prompt} onChange={(e) => setPrompt(e.target.value)}
          placeholder="描述你想要生成的图片..."
          rows={4}
          className="w-full px-4 py-2.5 glass-input rounded-xl text-sm resize-none"
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{prompt.length}/500</span>
          {prompt && (
            <button type="button" onClick={() => setPrompt('')} className="text-xs glass-btn-secondary px-2 py-0.5 rounded-lg">
              清空
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
          参考图片（可选 / 最多16张）
        </label>
        {refImages.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 mb-2">
            {refImages.map((img, i) => (
              <div key={i} className="relative glass rounded-lg overflow-hidden">
                <img src={img} alt={''} className="w-full h-24 object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveRef(i)}
                  className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full"
                  style={{
                    background: 'rgba(244, 114, 182, 0.8)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  x
                </button>
              </div>
            ))}
            {refImages.length < 16 && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-24 glass rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200"
                style={{ border: '1px dashed rgba(255, 255, 255, 0.15)' }}
              >
                <span className="text-xl opacity-50">+</span>
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-24 glass rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200"
            style={{ border: '1px dashed rgba(255, 255, 255, 0.15)' }}
          >
            <span className="text-2xl mb-1 opacity-50">+</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>点击上传参考图片</span>
          </div>
        )}
        <input type="file" ref={fileInputRef} accept="image/*" multiple onChange={handleFileChange} className="hidden" />
        {refImages.length > 0 && (
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>参考强度</span>
            <input type="range" min={10} max={100} value={strength} onChange={(e) => setStrength(Number(e.target.value))} className="flex-1 glass-range" />
            <span className="text-xs w-6 text-right" style={{ color: 'var(--text-muted)' }}>{strength}%</span>
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
          生成模型
        </label>
        <div className="flex gap-1 p-0.5 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            type="button"
            onClick={() => setModel('premium')}
            className="flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-200"
            style={{
              fontFamily: 'var(--font-display)',
              background: model === 'premium' ? 'rgba(244, 114, 182, 0.2)' : 'transparent',
              border: model === 'premium' ? '1px solid rgba(244, 114, 182, 0.25)' : '1px solid transparent',
              color: model === 'premium' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.4)',
            }}>
            高级模型
          </button>
          <button
            type="button"
            onClick={() => setModel('free')}
            className="flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-200"
            style={{
              fontFamily: 'var(--font-display)',
              background: model === 'free' ? 'rgba(52, 211, 153, 0.15)' : 'transparent',
              border: model === 'free' ? '1px solid rgba(52, 211, 153, 0.25)' : '1px solid transparent',
              color: model === 'free' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.4)',
            }}>
            普通模型
          </button>
        </div>
        {model === 'free' && (
          <p className="text-[10px] mt-1.5" style={{ color: 'var(--accent-success)' }}>
            当前使用免费模型 (Agnes Image 2.1 Flash)，无需消耗积分
          </p>
        )}
        {model === 'premium' && (
          <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
            高级模型 (GPT Image 2)，质量更高但消耗积分
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
          风格预设
        </label>
        <div className="flex flex-wrap gap-2">
          {styleOptions.map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => setStyle(opt.v)}
              className="px-3 py-1.5 text-xs font-medium rounded-xl transition-all duration-200"
              style={{
                background: style === opt.v ? 'rgba(244, 114, 182, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: style === opt.v ? '1px solid rgba(244, 114, 182, 0.25)' : '1px solid rgba(255, 255, 255, 0.06)',
                color: style === opt.v ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)',
                backdropFilter: style === opt.v ? 'blur(8px)' : 'none',
              }}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
            尺寸
          </label>
          <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full px-4 py-2.5 glass-select rounded-xl text-sm">
            {sizeOptions.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
            数量
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCount(Math.max(1, count - 1))}
              className="w-9 h-9 flex items-center justify-center glass-btn-secondary rounded-xl text-sm"
            >-</button>
            <span className="w-8 text-center text-sm font-semibold">{count}</span>
            <button
              type="button"
              onClick={() => setCount(Math.min(4, count + 1))}
              className="w-9 h-9 flex items-center justify-center glass-btn-secondary rounded-xl text-sm"
            >+</button>
          </div>
        </div>
      </div>

      <details className="glass-details rounded-xl">
        <summary className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          <span className="text-[10px] transition-transform duration-200">&#9654;</span>
          高级参数
        </summary>
        <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="pt-3">
            <label className="block text-xs font-medium mb-1.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
              负面提示词
            </label>
            <input placeholder="不想出现在图片中的内容..." className="w-full px-4 py-2.5 glass-input rounded-xl text-sm" />
          </div>
        </div>
      </details>

      <button type="submit" className="glass-btn w-full h-11 text-sm font-semibold rounded-xl">
        开始生成
      </button>
    </form>
  )
}
