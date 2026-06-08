const inspirations = [
  { title: '极简主义海报设计', prompt: '干净的白底背景，产品居中放置，柔和的自然光线，极简主义风格', author: 'DesignMaster' },
  { title: '赛博朋克城市夜景', prompt: '霓虹灯光，雨夜街道，未来感建筑，赛博朋克风格，4K画质', author: 'CyberArtist' },
  { title: '日系动漫人物', prompt: '日式动漫风格，大眼睛角色，柔和的色彩，精致的细节', author: 'AnimeLover' },
  { title: '水彩风景画', prompt: '水彩风格，山川湖泊，柔和的色调，艺术感，留白构图', author: 'WatercolorFan' },
  { title: '3D产品展示', prompt: '3D渲染风格，产品漂浮展示，光影效果，科技感背景', author: 'ProductPro' },
  { title: '像素艺术游戏场景', prompt: '像素风格，复古游戏场景，鲜艳的色彩，8bit风格', author: 'PixelArtist' },
  { title: '超写实人物肖像', prompt: '超写实风格，自然光人像，细腻的皮肤纹理，眼神光', author: 'PortraitPro' },
  { title: '梦幻仙境场景', prompt: '梦幻风格，发光植物，奇幻生物，星空背景，魔法光效', author: 'FantasyCreator' },
]

export default function InspirationPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">灵感</h1>
        <p className="text-sm text-[var(--text-secondary)]">探索社区精选作品，获取创作灵感</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {inspirations.map((item, i) => (
          <div
            key={i}
            className="flex gap-4 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-4 hover:border-[var(--accent-primary)]/30 transition-colors cursor-pointer"
          >
            <div className="w-24 h-24 shrink-0 rounded-lg bg-[var(--bg-input)] flex items-center justify-center text-3xl text-[var(--text-muted)]">
              🎨
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium mb-1 truncate">{item.title}</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-3 mb-2">{item.prompt}</p>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-[10px] font-medium">
                  {item.author[0]}
                </div>
                <span className="text-xs text-[var(--text-secondary)]">{item.author}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
