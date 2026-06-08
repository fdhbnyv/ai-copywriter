export default function PortfolioPage() {
  const placeholderImages = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    title: `作品 ${i + 1}`,
    prompt: '示例提示词内容...',
  }))

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">作品集</h1>
        <div className="flex gap-2">
          <select className="px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none">
            <option>全部风格</option>
            <option>写实</option>
            <option>动漫</option>
          </select>
          <select className="px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none">
            <option>最新</option>
            <option>最早</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {placeholderImages.map((img) => (
          <div
            key={img.id}
            className="group relative aspect-square bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl overflow-hidden hover:border-[var(--accent-primary)]/50 transition-all cursor-pointer"
          >
            <div className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)]">
              <span className="text-4xl opacity-30">🖼</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[var(--bg-primary)]/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-xs text-[var(--text-secondary)] truncate">{img.prompt}</p>
            </div>
          </div>
        ))}
      </div>

      {placeholderImages.length === 0 && (
        <div className="text-center py-20 text-[var(--text-muted)]">
          <div className="text-5xl mb-4 opacity-30">🖼</div>
          <p className="text-lg">还没有作品</p>
          <p className="text-sm mt-2">去创作页面生成你的第一个作品吧</p>
        </div>
      )}
    </div>
  )
}
