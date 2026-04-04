import { createContext, useContext, useState, type ReactNode, useCallback } from 'react';
import { type Bring, type Contact, type Info, type LivePrograms, type Program, type Team } from '../../types/database';
import { coreApiRequest } from '../../utils/api';

const CACHE_TIME = 60000; // 1 perc

interface DbContextType {
  getInfos: () => Promise<Info[]>;
  getNInfos: (count: number) => Promise<Info[]>;
  getInfo: (id: number) => Promise<Info>;
  getContacts: () => Promise<Contact[]>;
  getNContacts: (count: number) => Promise<Contact[]>;
  getContact: (id: number) => Promise<Contact>;
  getBring: () => Promise<Bring[]>;
  getNBring: (count: number) => Promise<Bring[]>;
  getTeams: () => Promise<Team[]>;
  getTeam: (id: number) => Promise<Team>;
  getPrograms: () => Promise<Program[]>;
  getNPrograms: (count: number) => Promise<Program[]>;
  getProgram: (id: number) => Promise<Program>;
  getLivePrograms: () => Promise<LivePrograms>;
  getUpcomingPrograms: (count: number) => Promise<Program[]>;
}

const DbContext = createContext<DbContextType | undefined>(undefined);

export const DbProvider = ({ children }: { children: ReactNode }) => {
  const [lastFetched, setLastFetched] = useState<Record<string, number | null>>({});

  // --- READ-ONLY CACHE ENGINE ---
  const useReadCache = <T,>(entityKey: string, endpoint: string) => {
    const [data, setData] = useState<T[]>([]);

    const getAll = useCallback(async (): Promise<T[]> => {
      const last = lastFetched[entityKey];
      if (last && Date.now() - last < CACHE_TIME) return data;

      try {
        const fresh = await coreApiRequest(endpoint);
        setData(fresh || []);
        setLastFetched(prev => ({ ...prev, [entityKey]: Date.now() }));
        return fresh || [];
      } catch (err) {
        console.error(`[CORE-${entityKey}] Fetch failed:`, err);
        setLastFetched(prev => ({ ...prev, [entityKey]: Date.now() }));
        return [];
      }
    }, [data, entityKey, endpoint]);

    const getN = async (count: number) => {
      const all = await getAll();
      return all.slice(0, count);
    };

    const getById = async (id: number) => coreApiRequest(`${endpoint}/${id}`);

    return { getAll, getN, getById };
  };

  // --- ENTITÁSOK DEFINIÁLÁSA ---
  const infos = useReadCache<Info>('infos', '/info');
  const contacts = useReadCache<Contact>('contacts', '/contact');
  const bring = useReadCache<Bring>('bring', '/bring');
  const teams = useReadCache<Team>('teams', '/team');
  const programs = useReadCache<Program>('programs', '/program');

  // --- EGYEDI KLIENS LOGIKÁK ---

  const getLivePrograms = async (): Promise<LivePrograms> => {
    try {
      return await coreApiRequest('/liveProgram');
    } catch (err) {
      console.error(err);
      return { current: undefined, next: undefined };
    }
  };

  const getUpcomingPrograms = async (count: number = 3): Promise<Program[]> => {
    const allPrograms = await programs.getAll();
    const now = new Date();
    
    // Időbélyegek kiszámítása az összehasonlításhoz
    const todayNoonUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12, 0, 0, 0);
    const currentUTCOffset = (now.getUTCHours() * 3600) + (now.getUTCMinutes() * 60) + now.getUTCSeconds();

    return allPrograms
      .filter(program => {
        const pDate = new Date(program.endDay);
        const programDateUTC = Date.UTC(pDate.getUTCFullYear(), pDate.getUTCMonth(), pDate.getUTCDate(), 12, 0, 0, 0);

        if (programDateUTC > todayNoonUTC) return true;
        if (programDateUTC === todayNoonUTC) return program.endTimeOffset > currentUTCOffset;
        return false;
      })
      .slice(0, count);
  };

  return (
    <DbContext.Provider value={{ 
      getInfos: infos.getAll, getNInfos: infos.getN, getInfo: infos.getById,
      getContacts: contacts.getAll, getNContacts: contacts.getN, getContact: contacts.getById,
      getBring: bring.getAll, getNBring: bring.getN,
      getTeams: teams.getAll, getTeam: teams.getById,
      getPrograms: programs.getAll, getNPrograms: programs.getN, getProgram: programs.getById,
      getLivePrograms,
      getUpcomingPrograms
    }}>
      {children}
    </DbContext.Provider>
  );
};

export const useDb = () => {
  const context = useContext(DbContext);
  if (!context) throw new Error("useDb must be used within a DbProvider");
  return context;
};