import { useRef, useState } from 'react';

export async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, { signal: AbortSignal.timeout(12_000), ...options });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result) {
    throw new Error(result?.error || 'The café service could not be reached. Please try again.');
  }
  return result as T;
}

export function useServiceSubmission<T>() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const token = useRef<string | null>(null);
  const pending = useRef(false);

  async function submit(path: string, data: object) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      token.current ??= crypto.randomUUID();
      return await requestJson<T>(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, reference: token.current }),
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Please try again.');
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  function reset() {
    token.current = null;
    setError('');
  }

  return { busy, error, submit, reset };
}

