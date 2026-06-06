import { useState, useCallback } from 'react';
import type { GenerateRequest, StatusType } from '../types';
import { generateCopywritingStream } from '../services/api';

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

    let currentText = '';

    await generateCopywritingStream(
      data,
      (chunk) => {
        currentText += chunk;
        setCopywriting(currentText);
      },
      () => {
        setLoading(false);
        if (currentText) {
          setStatus('success');
        }
      },
      (error) => {
        setLoading(false);
        setErrorMessage(error);
        setStatus('error');
      }
    );
  }, []);

  return {
    copywriting,
    loading,
    status,
    errorMessage,
    generate,
  };
}
