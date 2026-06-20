import type { VercelRequest, VercelResponse } from '@vercel/node';

// 精选 GPT Image 2 提示词数据集（按分类整理）
const PROMPTS_DB = [
  // --- 写实/摄影 ---
  { id: 'p1', title: '城市夜景人像', prompt: 'A beautiful woman standing on a rainy city street at night, neon lights reflecting in puddles, cinematic lighting, bokeh background, Sony A7R IV, 85mm lens, shallow depth of field, photorealistic, 8K', category: '写实', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop' },
  { id: 'p2', title: '日落海滩', prompt: 'Golden hour at a tropical beach, waves crashing on shore, warm sunset colors, palm trees silhouette, birds flying, ultra realistic, Canon EOS R5, 24-70mm lens, natural lighting, 8K', category: '写实', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop' },
  { id: 'p3', title: '专业产品摄影', prompt: 'A premium wireless earphone product shot on marble surface, studio lighting, soft shadows, clean white background, commercial product photography, sharp details, 8K, minimalist composition', category: '写实', image: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f75?w=400&h=400&fit=crop' },
  { id: 'p4', title: '美食特写', prompt: 'Close-up of a delicious burger with melting cheese, crispy bacon, fresh lettuce, sesame bun, steam rising, dramatic lighting, food photography, 8K, mouth-watering details', category: '写实', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop' },
  { id: 'p5', title: '复古咖啡店', prompt: 'Cozy vintage coffee shop interior, warm ambient lighting, wooden tables, latte art, steam rising from coffee, film grain texture, nostalgic atmosphere, 35mm photography style', category: '写实', image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=400&fit=crop' },

  // --- 动漫/二次元 ---
  { id: 'p6', title: '日系少女插画', prompt: 'Anime style cute girl with long blue hair in school uniform, cherry blossom background, soft pastel colors, Ghibli art style, clean lines, cel shading, high detail, vibrant', category: '动漫', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=400&fit=crop' },
  { id: 'p7', title: '奇幻森林精灵', prompt: 'Magical forest spirit with glowing wings, bioluminescent plants, floating orbs of light, deep purple and teal colors, anime illustration style, ethereal atmosphere, detailed background', category: '动漫', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=400&fit=crop' },
  { id: 'p8', title: '赛博朋克武士', prompt: 'Cybernetic samurai standing in neon-lit Tokyo street at night, glowing katana, holographic advertisements, rain, high-tech armor, manga style, dramatic lighting, intense colors', category: '动漫', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=400&fit=crop' },
  { id: 'p9', title: '幻想城堡', prompt: 'Floating fantasy castle in the sky, waterfalls falling from the edges, rainbow, white marble architecture, magical glow, anime landscape, Makoto Shinkai style, dreamy clouds', category: '动漫', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop' },

  // --- 3D/渲染 ---
  { id: 'p10', title: '3D卡通角色', prompt: 'Cute 3D character of a little robot with big eyes, made of shiny metal, Pixar style, soft lighting, vibrant colors, detailed textures, 4K, isometric view, playful expression', category: '3D', image: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=400&h=400&fit=crop' },
  { id: 'p11', title: '科技产品爆炸图', prompt: '3D exploded view of a modern smartphone showing internal components, glass and metal materials, studio lighting, white background, technical illustration style, ultra detailed, 8K', category: '3D', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop' },
  { id: 'p12', title: '微缩城市景观', prompt: 'Tilt-shift miniature city, tiny buildings with detailed architecture, cars and trees like models, bright sunny day, 3D render, shallow depth of field, toy-like scale, 4K', category: '3D', image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=400&fit=crop' },

  // --- 像素/复古 ---
  { id: 'p13', title: '复古RPG游戏场景', prompt: '16-bit pixel art RPG village scene, cute houses with red roofs, NPC characters, green trees, blue river, retro game style, vibrant colors, nostalgic, grid-based design', category: '像素', image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b7e5e?w=400&h=400&fit=crop' },
  { id: 'p14', title: '像素城市', prompt: 'Cyberpunk pixel art cityscape at night, neon signs, flying cars, rain, retro 8-bit aesthetic, detailed buildings, purple and pink color palette', category: '像素', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=400&fit=crop' },

  // --- 水彩/艺术 ---
  { id: 'p15', title: '水彩花园', prompt: 'Watercolor painting of a blooming garden, roses and lavender, soft brush strokes, pigment textures, white background, artistic style, pastel colors, elegant composition', category: '水彩', image: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=400&h=400&fit=crop' },
  { id: 'p16', title: '水墨山水', prompt: 'Traditional Chinese ink wash painting, misty mountains, pine trees, waterfall, bamboo, monochrome, elegant brush strokes, zen atmosphere, vertical scroll composition', category: '水彩', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop' },

  // --- 海报/设计 ---
  { id: 'p17', title: '极简主义海报', prompt: 'Minimalist poster design, geometric abstract shapes, black white and gold color scheme, clean typography, modern layout, negative space, high-end fashion magazine style', category: '设计', image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=400&fit=crop' },
  { id: 'p18', title: '音乐节海报', prompt: 'Vibrant music festival poster, bold typography, colorful abstract waves, neon gradients, dynamic composition, party atmosphere, A1 poster design, eye-catching', category: '设计', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop' },

  // --- 科幻/概念 ---
  { id: 'p19', title: '外星殖民地', prompt: 'Futuristic space colony on Mars, domed structures, solar panels, red landscape, space suits, advanced technology, cinematic lighting, sci-fi concept art, ultra realistic, 8K', category: '科幻', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=400&fit=crop' },
  { id: 'p20', title: 'AI 机器人', prompt: 'Humanoid robot with transparent skin showing mechanical inner workings, blue LED lights, futuristic laboratory background, cyberpunk aesthetic, photorealistic, 4K', category: '科幻', image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=400&fit=crop' },

  // --- 线稿 ---
  { id: 'p21', title: '花卉线稿', prompt: 'Black and white line art drawing of intricate floral pattern, mandala style, detailed petals and leaves, clean lines, Zentangle art, printable design, tattoo style', category: '线稿', image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=400&fit=crop' },
  { id: 'p22', title: '建筑速写', prompt: 'Architectural sketch of a Gothic cathedral, pen and ink style, cross-hatching, detailed stone work, towering spires, artistic black and white illustration, vintage', category: '线稿', image: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=400&h=400&fit=crop' },
];

const CATEGORIES = ['全部', '写实', '动漫', '3D', '像素', '水彩', '设计', '科幻', '线稿'] as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, max-age=3600');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { cat = '全部', search = '', page = '1' } = req.query;
    const pageNum = Math.max(1, Number(page) || 1);
    const pageSize = 12;

    let filtered = [...PROMPTS_DB];

    // Filter by category
    if (cat && cat !== '全部') {
      filtered = filtered.filter(p => p.category === cat);
    }

    // Filter by search
    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(
        p => p.title.toLowerCase().includes(q) || p.prompt.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (pageNum - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return res.status(200).json({
      items,
      categories: CATEGORIES,
      total,
      page: pageNum,
      totalPages,
      hasMore: pageNum < totalPages,
    });
  } catch (error) {
    return res.status(500).json({ error: '获取灵感数据失败' });
  }
}
