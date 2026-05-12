import { type ReactNode, createContext, useCallback, useContext, useState } from "react";
import {
  type Bring,
  type CamperTask,
  type Contact,
  type Deadline,
  type Info,
  type LivePrograms,
  type Program,
  type Setting,
  type Team,
} from "../../types/database";
import { coreApiRequest } from "../../utils/api";
import { dayOffsetToUtcTs } from "../../utils/dateHelpers";

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
  getCamperTasks: () => Promise<CamperTask[]>;
  getTodayCamperTasks: () => Promise<CamperTask[]>;
  getSettings: () => Promise<Setting[]>;
  getSettingByStrId: (strId: string) => Promise<Setting | undefined>;
  getDeadlines: () => Promise<Deadline[]>;
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
        setLastFetched((prev) => ({ ...prev, [entityKey]: Date.now() }));
        return fresh || [];
      } catch (err) {
        console.error(`[CORE-${entityKey}] Fetch failed:`, err);
        setLastFetched((prev) => ({ ...prev, [entityKey]: Date.now() }));
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
  const infos = useReadCache<Info>("infos", "/info");
  const contacts = useReadCache<Contact>("contacts", "/contact");
  const bring = useReadCache<Bring>("bring", "/bring");
  const teams = useReadCache<Team>("teams", "/team");
  const programs = useReadCache<Program>("programs", "/program");
  const camperTasks = useReadCache<CamperTask>("camperTasks", "/task");
  const settings = useReadCache<Setting>("settings", "/setting");
  const deadlines = useReadCache<Deadline>("deadlines", "/deadline");

  // --- EGYEDI KLIENS LOGIKÁK ---

  const getLivePrograms = async (): Promise<LivePrograms> => {
    try {
      return await coreApiRequest("/liveProgram");
    } catch (err) {
      console.error(err);
      return { current: undefined, next: undefined };
    }
  };

  const getTodayCamperTasks = async (): Promise<CamperTask[]> => {
    const all = await camperTasks.getAll();
    const todayUTC = new Date().toISOString().split("T")[0];
    return all.filter(
      (task) => new Date(task.day).toISOString().split("T")[0] === todayUTC
    );
  };

  const getUpcomingPrograms = async (count: number = 3): Promise<Program[]> => {
    const allPrograms = await programs.getAll();
    const nowTs = Date.now();
    return allPrograms
      .filter((p) => dayOffsetToUtcTs(p.endDay, p.endTimeOffset) > nowTs)
      .slice(0, count);
  };

  return (
    <DbContext.Provider
      value={{
        getInfos: infos.getAll,
        getNInfos: infos.getN,
        getInfo: infos.getById,
        getContacts: contacts.getAll,
        getNContacts: contacts.getN,
        getContact: contacts.getById,
        getBring: bring.getAll,
        getNBring: bring.getN,
        getTeams: teams.getAll,
        getTeam: teams.getById,
        getPrograms: programs.getAll,
        getNPrograms: programs.getN,
        getProgram: programs.getById,
        getLivePrograms,
        getUpcomingPrograms,
        getCamperTasks: camperTasks.getAll,
        getTodayCamperTasks,
        getSettings: settings.getAll,
        getSettingByStrId: async (strId: string) => {
          const all = await settings.getAll();
          return all.find((s) => s.str_id === strId);
        },
        getDeadlines: deadlines.getAll,
      }}
    >
      {children}
    </DbContext.Provider>
  );
};

export const useDb = () => {
  const context = useContext(DbContext);
  if (!context) throw new Error("useDb must be used within a DbProvider");
  return context;
};
