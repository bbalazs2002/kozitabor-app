import { createContext, useContext, useState, type ReactNode } from 'react';
import { type Bring, type Contact, type Info, type LivePrograms, type Program, type Team  } from '../../types/database';
import { coreApiRequest } from '../../utils/api';

interface DbContextType {
  getNInfos: (count: number) => Promise<Info[]>;
  getInfos: () => Promise<Info[]>;
  getInfo: (id: number) => Promise<Info>;
  getContacts: () => Promise<Contact[]>;
  getNContacts: (count: number) => Promise<Contact[]>;
  getBring: () => Promise<Bring[]>;
  getNBring: (count: number) => Promise<Bring[]>;
  getTeams: () => Promise<Team[]>;
  getNPrograms: (count: number) => Promise<Program[]>;
  getPrograms: () => Promise<Program[]>;
  getProgram : (id: number) => Promise<Program>;
  getLivePrograms: () => Promise<LivePrograms>;
  getUpcomingPrograms: (count: number) => Promise<Program[]>;
}

const DbContext = createContext<DbContextType | undefined>(undefined);

export const DbProvider = ({ children }: { children: ReactNode }) => {
  const [infos, setInfos] = useState<Info[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [bring, setBring] = useState<Bring[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);

  // Időbélyegek tárolása (milliszekundumban)
  const [lastFetched, setLastFetched] = useState<{ [key: string]: number | null }>({
    infos: null,
    contacts: null,
    bring: null,
    teams: null,
    programs: null,
  });

  // Segédfüggvény az idő ellenőrzéséhez (60 másodperc = 60000 ms)
  const isCacheValid = (key: keyof typeof lastFetched) => {
    const last = lastFetched[key];
    if (!last) return false;
    const now = Date.now();
    return now - last < 60000; // 1 perc
  };
  // Segédfüggvény az időbélyeg frissítéséhez
  const updateCacheTime = (key: string) => {
    setLastFetched(prev => ({ ...prev, [key]: Date.now() }));
  };

  {/* INFOS */}
  const getInfos = async (): Promise<Info[]> => {
    if (isCacheValid('infos')) return infos;

    try {
      const data = await coreApiRequest('/info');
      setInfos(data || []);
      updateCacheTime('infos');
      return data || [];
    } catch (err) {
      console.error(err);
      updateCacheTime('infos'); // Hiba esetén is frissítjük, hogy ne ciklusozzon
      return [];
    }
  };

  const getNInfos = async (count: number): Promise<Info[]> => {
    const data = await getInfos();
    return data.slice(0, count);
  };

  const getInfo = async (id: number): Promise<Info> => {
    // A detail lekéréseket általában nem cache-eljük globálisan, 
    // de az API hívás marad a megszokott
    try {
      return await coreApiRequest(`/info/${id}`);
    } catch (err) {
      console.error(err);
      return { id: 0, title: "Hiba", icon: "FileExclamationPoint" };
    }
  };

  {/* Contact */}
  const getContacts = async (): Promise<Contact[]> => {
    if (isCacheValid('contacts')) return contacts;

    try {
      const data = await coreApiRequest('/contact');
      setContacts(data || []);
      updateCacheTime('contacts');
      return data || [];
    } catch (err) {
      console.error(err);
      updateCacheTime('contacts');
      return [];
    }
  };

  const getNContacts = async (count: number): Promise<Contact[]> => {
    const data = await getContacts();
    return data.slice(0, count);
  };

  {/* Bring */}
  const getBring = async (): Promise<Bring[]> => {
    if (isCacheValid('bring')) return bring;

    try {
      const data = await coreApiRequest('/bring');
      setBring(data || []);
      updateCacheTime('bring');
      return data || [];
    } catch (err) {
      console.error(err);
      updateCacheTime('bring');
      return [];
    }
  };

  const getNBring = async (count: number): Promise<Bring[]> => {
    const data = await getBring();
    return data.slice(0, count);
  };

  {/* Teams */}
  const getTeams = async (): Promise<Team[]> => {
    if (isCacheValid('team')) return teams;

    try {
      const data = await coreApiRequest('/teams');
      setTeams(data || []);
      updateCacheTime('teams');
      return data || [];
    } catch (err) {
      console.error(err);
      updateCacheTime('teams');
      return [];
    }
  };

  {/* Live programs */}
  const getPrograms = async (): Promise<Program[]> => {
    if (isCacheValid('programs')) return programs;

    try {
      const data = await coreApiRequest('/program');
      setPrograms(data || []);
      updateCacheTime('programs');
      return data || [];
    } catch (err) {
      console.error(err);
      updateCacheTime('programs');
      return [];
    }
  };

  const getNPrograms = async (count: number): Promise<Program[]> => {
    const data = await getPrograms();
    return data.slice(0, count);
  };

  const getProgram = async (id: number): Promise<Program> => {
    try {
      return await coreApiRequest(`/program/${id}`);
    } catch (err) {
      console.error(err);
      return { id: 0, title: '', desc: '', startDay: new Date(), endDay: new Date(), startTimeOffset: 43200, endTimeOffset: 43200 };
    }
  };

  const getLivePrograms = async (): Promise<LivePrograms> => {
    try {
      return await coreApiRequest('/liveProgram');
    } catch (err) {
      console.error(err);
      return {
        current: undefined,
        next: undefined
      };
    }
  };

  const getUpcomingPrograms = async (count: number = 3): Promise<Program[]> => {
    // Itt is a közös getPrograms-t hívjuk, ami már kezeli a cache-t
    const allPrograms = await getPrograms();
    const now = new Date();

    const todayNoonUTC = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      12, 0, 0, 0
    );

    const currentUTCOffset = (now.getUTCHours() * 3600) +
                             (now.getUTCMinutes() * 60) +
                             now.getUTCSeconds();

    return allPrograms
      .filter(program => {
        const pDate = new Date(program.endDay);
        const programDateUTC = Date.UTC(
          pDate.getUTCFullYear(),
          pDate.getUTCMonth(),
          pDate.getUTCDate(),
          12, 0, 0, 0
        );

        if (programDateUTC > todayNoonUTC) return true;
        if (programDateUTC === todayNoonUTC) {
          return program.endTimeOffset > currentUTCOffset;
        }
        return false;
      })
      .slice(0, count);
  };

  return (
    <DbContext.Provider value={{ 
        getNInfos, getInfos, getInfo, 
        getContacts, getNContacts,
        getBring, getNBring,
        getTeams,
        getNPrograms, getPrograms, getProgram, getLivePrograms, getUpcomingPrograms
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