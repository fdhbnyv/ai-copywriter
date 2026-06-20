export default function PortfolioPage() {
  const placeholderImages = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    title: `作品 ${i + 1}`,
    prompt: '示例提示词内容...',
  }))

  return (
    <div className="p-6 max-w-7xl mx-auto bg-[var(--bg-primary)]">
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-3xl flex items-center gap-2"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.03em', textShadow: '2px 2px 0px rgba(26,26,26,0.15)' }}
        >
          <span>🎨</span> 作品集
        </h1>
        <div className="flex gap-2">
          <select className="comic-select px-3 py-1.5 bg-[var(--bg-card)] text-sm">
            <option>全部风格</option>
            <option>写实</option>
            <option>动漫</option>
          </select>
          <select className="comic-select px-3 py-1.5 bg-[var(--bg-card)] text-sm">
            <option>最新</option>
            <option>最早</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {placeholderImages.map((img) => (
          <div
            key={img.id}
            className="group relative aspect-square comic-card overflow-hidden transition-all duration-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none cursor-pointer bg-[var(--bg-card)]"
          >
            {/* 漫画风格装饰 — 对角斜条装饰 */}
            <div
              className="absolute top-0 right-0 w-16 h-16"
              style={{
                background: 'linear-gradient(135deg, transparent 50%, #FF4757 50%)',
                borderLeft: '3px solid #1A1A1A',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)]">
              <span className="text-5xl opacity-40">🖼️</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[var(--bg-card)]/95 via-[var(--bg-card)]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity border-t-[3px] border-[#1A1A1A]">
              <p className="text-sm font-bold truncate" style={{ fontFamily: 'var(--font-display)' }}>
                {img.prompt}
              </p>
            </div>
          </div>
        ))}
      </div>

      {placeholderImages.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4 animate-comic-bounce">🖼️</div>
          <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.03em' }}>
            还没有作品
          </p>
          <p className="text-base mt-2 text-[var(--text-secondary)]">
            去创作页面生成你的第一个作品吧！
          </p>
        </div>
      )}
    </div>
  )
}
