import { useState, useEffect } from 'react';
import { useDb } from '../context/core/DbContext';
import type { LivePrograms } from '../types/database';

export const useLivePrograms = (intervalMs = 60000) => {
  const [data, setData] = useState<LivePrograms>({ current: undefined, next: undefined });
  const [loading, setLoading] = useState(true);

  const context = useDb();

  const fetchLive = async () => {
    const response = await context.getLivePrograms();
    setData(response);
    setLoading(false);
  };

  useEffect(() => {
    // Első lekérés azonnal
    fetchLive();

    // Időzítő beállítása
    const timer = setInterval(fetchLive, intervalMs);

    // Takarítás a komponens unmountolásakor
    return () => clearInterval(timer);
  }, [intervalMs]);

  return { data, loading, refetch: fetchLive };
};