import { useState } from 'react';

interface ResultDisplayProps {
  copywriting: string;
  loading: boolean;
}

export function ResultDisplay({ copywriting, loading }: ResultDisplayProps) {
  const [copied, setCopied] = useState<boolean>(false);

  if (!copywriting && !loading) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copywriting);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = copywriting;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mt-6 bg-gray-50 rounded-xl p-5 animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-800 text-xl font-semibold flex items-center gap-2">
          <span>📝</span>
          为您生成的文案
        </h3>
        {copywriting && (
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-600 hover:border-[#4facfe] hover:text-[#4facfe] transition-colors flex items-center gap-2"
          >
            {copied ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                已复制
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                复制文案
              </>
            )}
          </button>
        )}
      </div>
      <div className="bg-white rounded-lg p-5 border-l-4 border-[#4facfe] leading-relaxed whitespace-pre-wrap text-gray-700 min-h-[100px]">
        {loading && !copywriting ? (
          <div className="flex items-center gap-3 text-gray-500">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-[#4facfe] rounded-full animate-spin" />
            正在生成中...
          </div>
        ) : (
          <>
            {copywriting}
            {loading && <span className="inline-block w-2 h-5 bg-[#4facfe] animate-pulse ml-1" />}
          </>
        )}
      </div>
    </div>
  );
}
