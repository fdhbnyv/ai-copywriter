import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { ResultDisplay } from './components/ResultDisplay';
import { StatusMessage } from './components/StatusMessage';
import { useGenerateCopywriting } from './hooks/useGenerate';
import type { GenerateRequest } from './types';

function App() {
  const { copywriting, loading, status, errorMessage, generate } = useGenerateCopywriting();

  const handleGenerate = (data: GenerateRequest) => {
    generate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center p-5">
      <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] w-full max-w-4xl overflow-hidden">
        <Header />
        
        <div className="p-8">
          <InputForm onSubmit={handleGenerate} loading={loading} />
          
          <ResultDisplay copywriting={copywriting} loading={loading} />
          
          <StatusMessage status={status} message={status === 'error' ? errorMessage : '文案生成成功！'} />
          
          <div className="mt-6 bg-[#f0f7ff] border border-[#cce5ff] rounded-xl p-4 text-sm text-[#004085]">
            <strong>技术说明：</strong> 支持纯文本和图片多模态输入，使用智谱 GLM-4.6V 模型，流式输出文案。
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
