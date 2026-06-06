import { useState, useRef } from 'react';
import type { Platform } from '../types';

interface InputFormProps {
  onSubmit: (data: { product: string; features: string; tone: string; audience?: string; platform?: Platform; image?: string }) => void;
  loading: boolean;
}

const toneOptions: { value: string; label: string }[] = [
  { value: 'professional', label: '专业商务风' },
  { value: 'friendly', label: '亲切友好风' },
  { value: 'creative', label: '创意潮流风' },
  { value: 'persuasive', label: '说服营销风' },
  { value: 'humorous', label: '幽默搞笑风' },
  { value: 'lyrical', label: '文艺清新风' },
  { value: 'luxury', label: '高端奢华风' },
  { value: 'tech', label: '科技极客风' },
];

const platformOptions: { value: Platform; label: string }[] = [
  { value: 'wechat', label: '微信公众号' },
  { value: 'xiaohongshu', label: '小红书' },
  { value: 'douyin', label: '抖音/短视频' },
  { value: 'taobao', label: '淘宝/电商' },
  { value: 'weibo', label: '微博' },
  { value: 'general', label: '通用平台' },
];

const audienceOptions: string[] = [
  '18-25岁年轻人',
  '25-35岁白领',
  '35-50岁中年人',
  '学生群体',
  '宝妈群体',
  '企业用户',
  '高端用户',
  '价格敏感型用户',
];

export function InputForm({ onSubmit, loading }: InputFormProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [audienceValue, setAudienceValue] = useState<string>('');
  const [showAudienceSuggestions, setShowAudienceSuggestions] = useState<boolean>(false);
  const [platformValue, setPlatformValue] = useState<Platform>('general');
  const [showPlatformSuggestions, setShowPlatformSuggestions] = useState<boolean>(false);
  const [toneValue, setToneValue] = useState<string>('professional');
  const [showToneSuggestions, setShowToneSuggestions] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audienceInputRef = useRef<HTMLInputElement>(null);
  const platformInputRef = useRef<HTMLInputElement>(null);
  const toneInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAudienceSelect = (value: string) => {
    setAudienceValue(value);
    setShowAudienceSuggestions(false);
  };

  const handlePlatformSelect = (value: Platform) => {
    setPlatformValue(value);
    setShowPlatformSuggestions(false);
    if (platformInputRef.current) {
      platformInputRef.current.value = value;
    }
  };

  const handleToneSelect = (value: string) => {
    setToneValue(value);
    setShowToneSuggestions(false);
    if (toneInputRef.current) {
      toneInputRef.current.value = value;
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const product = formData.get('product') as string;
    if (!product.trim()) {
      alert('请输入产品名称');
      return;
    }

    onSubmit({
      product,
      features: formData.get('features') as string,
      tone: toneValue || 'professional',
      audience: audienceValue || undefined,
      platform: platformValue || undefined,
      image: preview || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="product" className="block text-gray-700 font-semibold mb-2">
          产品名称
        </label>
        <input
          type="text"
          id="product"
          name="product"
          defaultValue="无线蓝牙耳机"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#4facfe] focus:outline-none transition-colors"
          placeholder="例如：无线蓝牙耳机、智能手表、有机护肤品..."
        />
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">
          产品图片（可选）
        </label>
        {preview ? (
          <div className="relative mb-3">
            <img src={preview} alt="预览" className="w-full h-40 object-cover rounded-lg border-2 border-gray-300" />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
            >
              ×
            </button>
          </div>
        ) : null}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 border-2 border-dashed border-gray-400 rounded-lg text-gray-600 hover:border-[#4facfe] hover:text-[#4facfe] transition-colors"
        >
          {preview ? '更换图片' : '上传图片'}
        </button>
      </div>

      <div>
        <label htmlFor="features" className="block text-gray-700 font-semibold mb-2">
          产品特点
        </label>
        <textarea
          id="features"
          name="features"
          defaultValue="降噪功能、长续航、轻便设计、防水性能"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#4facfe] focus:outline-none transition-colors min-h-[100px] resize-y"
          placeholder="描述产品的核心卖点..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <label htmlFor="audience" className="block text-gray-700 font-semibold mb-2">
            目标群体（可选）
          </label>
          <input
            type="text"
            id="audience"
            ref={audienceInputRef}
            value={audienceValue}
            onChange={(e) => setAudienceValue(e.target.value)}
            onFocus={() => setShowAudienceSuggestions(true)}
            onBlur={() => setTimeout(() => setShowAudienceSuggestions(false), 200)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#4facfe] focus:outline-none transition-colors"
            placeholder="输入或选择目标群体"
          />
          {showAudienceSuggestions && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {audienceOptions
                .filter(opt => opt.includes(audienceValue) || audienceValue === '')
                .map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleAudienceSelect(option)}
                    className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors"
                  >
                    {option}
                  </button>
                ))}
            </div>
          )}
        </div>

        <div className="relative">
          <label htmlFor="platform" className="block text-gray-700 font-semibold mb-2">
            发布平台
          </label>
          <input
            type="text"
            id="platform"
            ref={platformInputRef}
            defaultValue="general"
            onChange={(e) => setPlatformValue(e.target.value)}
            onFocus={() => setShowPlatformSuggestions(true)}
            onBlur={() => setTimeout(() => setShowPlatformSuggestions(false), 200)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#4facfe] focus:outline-none transition-colors"
            placeholder="输入或选择平台"
          />
          {showPlatformSuggestions && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {platformOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handlePlatformSelect(option.value)}
                  className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <label htmlFor="tone" className="block text-gray-700 font-semibold mb-2">
          文案风格
        </label>
        <input
          type="text"
          id="tone"
          ref={toneInputRef}
          defaultValue="professional"
          onChange={(e) => setToneValue(e.target.value)}
          onFocus={() => setShowToneSuggestions(true)}
          onBlur={() => setTimeout(() => setShowToneSuggestions(false), 200)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#4facfe] focus:outline-none transition-colors"
          placeholder="输入或选择文案风格"
        />
        {showToneSuggestions && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {toneOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleToneSelect(option.value)}
                className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-[#4facfe] to-[#00f2fe] text-white py-3 px-6 rounded-full text-lg font-semibold hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(79,172,254,0.3)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            AI正在创作中...
          </>
        ) : (
          '✨ 生成文案'
        )}
      </button>
    </form>
  );
}
