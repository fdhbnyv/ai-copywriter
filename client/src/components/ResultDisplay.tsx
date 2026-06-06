interface ResultDisplayProps {
  copywriting: string;
  loading: boolean;
}

export function ResultDisplay({ copywriting, loading }: ResultDisplayProps) {
  if (!copywriting && !loading) {
    return null;
  }

  if (loading) {
    return (
      <div className="mt-8 text-center py-8">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#4facfe] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">AI正在创作中，请稍候...</p>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-gray-50 rounded-xl p-6 border-l-4 border-[#4facfe] animate-fadeIn">
      <h3 className="text-gray-800 mb-4 text-xl font-semibold flex items-center gap-2">
        <span>📝</span>
        为您生成的文案
      </h3>
      <div className="bg-white rounded-lg p-5 leading-relaxed whitespace-pre-wrap text-gray-700">
        {copywriting}
      </div>
    </div>
  );
}
