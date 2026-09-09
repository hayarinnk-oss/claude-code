import { useCallback, useState } from 'react';
import { fetchPropertyReport } from '../api.js';

export function usePropertyReport() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | error | success
  const [error, setError] = useState(null);
  const [lastQuery, setLastQuery] = useState(null);

  const search = useCallback(async (query) => {
    setStatus('loading');
    setError(null);
    setLastQuery(query);
    try {
      const report = await fetchPropertyReport(query);
      setData(report);
      setStatus('success');
    } catch (e) {
      setError(e.message || '不明なエラーが発生しました。');
      setStatus('error');
    }
  }, []);

  const setMapFilter = useCallback(
    (patch) => {
      if (lastQuery) search({ ...lastQuery, ...patch });
    },
    [lastQuery, search]
  );

  return { data, status, error, search, setMapFilter, lastQuery };
}
