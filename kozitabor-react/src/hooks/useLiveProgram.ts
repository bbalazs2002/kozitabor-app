import { useState, useEffect } from 'react';
import { coreApiRequest } from '../utils/api';

interface Program {
  id: number;
  title: string;
  startTimeOffset: number;
  endTimeOffset: number;
}

interface LiveData {
  current: Program | null;
  next: Program | null;
}

export const useLivePrograms = (intervalMs = 60000) => {
  const [data, setData] = useState<LiveData>({ current: null, next: null });
  const [loading, setLoading] = useState(true);

  const fetchLive = async () => {
    try {
        const response = await coreApiRequest('/livePrograms');    
        setData(response);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
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