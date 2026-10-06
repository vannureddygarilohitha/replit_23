import { useCallback, useEffect, useState } from 'react';
import { loadWorkspaceData, subscribeWorkspace } from '@/lib/data';
import type { WorkspaceData } from '@/lib/types';

export type Workspace = WorkspaceData;
export function useWorkspace() {
  const [data, setData] = useState<Workspace | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try { setData(await loadWorkspaceData() as Workspace); }
    catch (e) { setError(e instanceof Error ? e.message : 'Workspace data could not be loaded.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    void refresh();
    const unsubscribe = subscribeWorkspace(() => { void refresh(); });
    return typeof unsubscribe === 'function' ? unsubscribe : undefined;
  }, [refresh]);
  return { data, error, loading, refresh };
}
