import { useState, useRef } from 'react';
import type { ToneStyle } from '../types';

interface InputFormProps {
  onSubmit: (data: { product: string; features: string; tone: ToneStyle; image?: string }) => void;
  loading: boolean;
}

const toneOptions: { value: ToneStyle; label: string }[] = [
  { value: 'professional', label: '专业商务风' },
  { value: 'friendly', label: '亲切友好风' },
  { value: 'creative', label: '创意潮流风' },
  { value: 'persuasive', label: '说服营销风' },
];

export function InputForm({ onSubmit, loading }: InputFormProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      tone: formData.get('tone') as ToneStyle,
      image: preview || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="product" className="block text-gray-700 font-semibold mb-2 text-lg">
          产品名称
        </label>
        <input
          type="text"
          id="product"
          name="product"
          defaultValue="无线蓝牙耳机"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-[#4facfe] focus:outline-none transition-colors"
          placeholder="例如：无线蓝牙耳机、智能手表、有机护肤品..."
        />
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2 text-lg">
          产品图片（可选）
        </label>
        {preview ? (
          <div className="relative mb-3">
            <img src={preview} alt="预览" className="w-full h-48 object-cover rounded-lg border-2 border-gray-300" />
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
        <label htmlFor="features" className="block text-gray-700 font-semibold mb-2 text-lg">
          产品特点
        </label>
        <textarea
          id="features"
          name="features"
          defaultValue="降噪功能、长续航、轻便设计、防水性能"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-[#4facfe] focus:outline-none transition-colors min-h-[120px] resize-y"
          placeholder="描述产品的核心卖点..."
        />
      </div>

      <div>
        <label htmlFor="tone" className="block text-gray-700 font-semibold mb-2 text-lg">
          文案风格
        </label>
        <select
          id="tone"
          name="tone"
          defaultValue="professional"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-[#4facfe] focus:outline-none transition-colors"
        >
          {toneOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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
