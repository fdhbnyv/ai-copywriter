interface StatusMessageProps {
  status: 'success' | 'error' | null;
  message: string;
}

export function StatusMessage({ status, message }: StatusMessageProps) {
  if (!status) {
    return null;
  }

  const classes = status === 'success'
    ? 'bg-green-100 text-green-800 border border-green-300'
    : 'bg-red-100 text-red-800 border border-red-300';

  return (
    <div className={`mt-4 px-4 py-3 rounded-lg ${classes} animate-fadeIn`}>
      {status === 'success' ? '✅ ' : '❌ '}{message}
    </div>
  );
}
