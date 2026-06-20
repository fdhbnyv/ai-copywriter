const inspirations = [
  { title: '极简主义海报设计', prompt: '干净的白底背景，产品居中放置，柔和的自然光线，极简主义风格', author: 'DesignMaster', emoji: '🎯' },
  { title: '赛博朋克城市夜景', prompt: '霓虹灯光，雨夜街道，未来感建筑，赛博朋克风格，4K画质', author: 'CyberArtist', emoji: '🌃' },
  { title: '日系动漫人物', prompt: '日式动漫风格，大眼睛角色，柔和的色彩，精致的细节', author: 'AnimeLover', emoji: '🌟' },
  { title: '水彩风景画', prompt: '水彩风格，山川湖泊，柔和的色调，艺术感，留白构图', author: 'WatercolorFan', emoji: '🎨' },
  { title: '3D产品展示', prompt: '3D渲染风格，产品漂浮展示，光影效果，科技感背景', author: 'ProductPro', emoji: '📦' },
  { title: '像素艺术游戏场景', prompt: '像素风格，复古游戏场景，鲜艳的色彩，8bit风格', author: 'PixelArtist', emoji: '🕹️' },
  { title: '超写实人物肖像', prompt: '超写实风格，自然光人像，细腻的皮肤纹理，眼神光', author: 'PortraitPro', emoji: '👤' },
  { title: '梦幻仙境场景', prompt: '梦幻风格，发光植物，奇幻生物，星空背景，魔法光效', author: 'FantasyCreator', emoji: '✨' },
]

export default function InspirationPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto bg-[var(--bg-primary)]">
      <div className="mb-6">
        <h1
          className="text-3xl flex items-center gap-2 mb-2"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.03em', textShadow: '2px 2px 0px rgba(26,26,26,0.15)' }}
        >
          <span>💡</span> 灵感
        </h1>
        <p className="text-base text-[var(--text-secondary)]" style={{ fontFamily: 'var(--font-body)' }}>
          探索社区精选作品，获取创作灵感
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {inspirations.map((item, i) => (
          <div
            key={i}
            className="flex gap-4 comic-card p-4 bg-[var(--bg-card)] transition-all duration-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none cursor-pointer"
          >
            <div
              className="w-24 h-24 shrink-0 flex items-center justify-center text-4xl"
              style={{
                border: '3px solid #1A1A1A',
                background: 'linear-gradient(135deg, #FFEAA7, #FFD93D)',
                boxShadow: '3px 3px 0px #1A1A1A',
              }}
            >
              {item.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className="text-lg mb-1 truncate"
                style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}
              >
                {item.title}
              </h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed line-clamp-3 mb-3">
                {item.prompt}
              </p>
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 flex items-center justify-center text-sm font-bold text-white"
                  style={{
                    fontFamily: 'var(--font-display)',
                    border: '2px solid #1A1A1A',
                    background: 'var(--accent-secondary)',
                    boxShadow: '2px 2px 0px #1A1A1A',
                  }}
                >
                  {item.author[0]}
                </div>
                <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-body)' }}>
                  {item.author}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
