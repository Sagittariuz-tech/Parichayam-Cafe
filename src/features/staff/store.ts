'use client';
import { useCallback, useEffect, useState } from 'react';
import { STAFF_KEY, seedStaff, type StaffState } from './model';
export function readStaff(): StaffState {
  const stored = localStorage.getItem(STAFF_KEY);
  if (!stored) return seedStaff();
  const value = JSON.parse(stored);
  if (value.version !== 2 || !['shifts','leave','offDuty','ingredients','movements','replenishments'].every(key => Array.isArray(value[key]))) throw new Error('The saved workspace could not be read. Your existing data has been kept.');
  return value as StaffState;
}
export function useStaffStore() {
  const [state, setState] = useState<StaffState>(() => seedStaff());
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    function load() { try { setState(readStaff()); setReady(true); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to read the local workspace.'); } }
    load();
    const storage = (e: StorageEvent) => { if (e.key === STAFF_KEY) load(); };
    window.addEventListener('storage', storage);
    window.addEventListener('staff-workspace-updated', load);
    return () => { window.removeEventListener('storage', storage); window.removeEventListener('staff-workspace-updated', load); };
  }, []);
  const commit = useCallback((action: (current: StaffState) => StaffState, success: string) => {
    setError(''); setMessage('');
    try {
      const next = action(readStaff());
      localStorage.setItem(STAFF_KEY, JSON.stringify(next));
      setState(next); setMessage(success);
      window.dispatchEvent(new Event('staff-workspace-updated'));
      return true;
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save. Please try again.'); return false; }
  }, []);
  return { state, ready, commit, message, error, clear: () => { setMessage(''); setError(''); } };
}
export type StaffStore = ReturnType<typeof useStaffStore>;
