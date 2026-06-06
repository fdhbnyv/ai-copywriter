import { useState, useCallback } from 'react';
import type { GenerateRequest, StatusType } from '../types';
import { generateCopywriting } from '../services/api';

export function useGenerateCopywriting() {
  const [copywriting, setCopywriting] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<StatusType>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const generate = useCallback(async (data: GenerateRequest) => {
    setLoading(true);
    setStatus(null);
    setCopywriting('');
    setErrorMessage('');

    try {
      const result = await generateCopywriting(data);
      setCopywriting(result.copywriting);
      setStatus('success');
    } catch (error) {
      const msg = error instanceof Error ? error.message : '生成失败';
      setErrorMessage(msg);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    copywriting,
    loading,
    status,
    errorMessage,
    generate,
  };
}
