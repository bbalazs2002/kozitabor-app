import { createContext, useContext, useState, type ReactNode, useCallback} from 'react';
import { type Activity, type Bring, type Contact, type DashboardSummary, type Info, type Program, type Task, type Team } from '../../types/database';
import { adminApiRequest } from '../../utils/api';
import { normalizeToUtcNoon } from '../../utils/dateHelpers';

const CACHE_TIME = 60000; // 1 perc

interface DbContextType {
  // Info
  getInfos: () => Promise<Info[]>;
  getInfo: (id: number) => Promise<Info>;
  addInfoToCache: (newInfo: Info) => void;
  updateInfoInCache: (updatedInfo: Info) => void;
  removeInfoFromCache: (id: number) => void;
  // Contact
  getContacts: () => Promise<Contact[]>;
  getContact: (id: number) => Promise<Contact>;
  addContactToCache: (newContact: Contact) => void;
  updateContactInCache: (updatedContact: Contact) => void;
  removeContactFromCache: (id: number) => void;
  reorderContactsInCache: (ids: number[]) => void;
  // Teams
  getTeams: () => Promise<Team[]>;
  getTeam: (id: number) => Promise<Team>;
  addTeamToCache: (newTeam: Team) => void;
  updateTeamInCache: (updatedTeam: Team) => void;
  removeTeamFromCache: (id: number) => void;
  // Activities
  getActivities: () => Promise<Activity[]>;
  getActivity: (id: number) => Promise<Activity>;
  addActivityToCache: (newActivity: Activity) => void;
  updateActivityInCache: (updatedActivity: Activity) => void;
  removeActivityFromCache: (id: number) => void;
  // Tasks
  getTasks: () => Promise<Task[]>;
  addTaskToCache: (newTask: any) => void;
  addTasksToCache: (newTasks: any[]) => void;
  removeTaskFromCache: (id: number) => void;
  // Brings
  getBrings: () => Promise<Bring[]>;
  addBringToCache: (newBring: Bring) => void;
  removeBringFromCache: (id: number) => void;
  // Programs
  getPrograms: () => Promise<Program[]>;
  getProgram: (id: number) => Promise<Program>;
  addProgramToCache: (newProg: any) => void;
  updateProgramInCache: (updatedProg: any) => void;
  removeProgramFromCache: (id: number) => void;
  // Dashboard
  getDashboardData: () => Promise<DashboardSummary>;
  //
  flushCache: () => void;
}

const DbContext = createContext<DbContextType | undefined>(undefined);

export const DbProvider = ({ children }: { children: ReactNode }) => {
  const [lastFetched, setLastFetched] = useState<Record<string, number | null>>({});
  // Dashboard külön state, mert nem illik a generikus T[] mintába
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);

  // --- GENERIKUS CACHE ENGINE ---
  const useEntityCache = <T extends { id: number }>(
    entityKey: string,
    endpoint: string,
    sortFn: (data: T[]) => T[] = (d) => [...d].sort((a, b) => b.id - a.id)
  ) => {
    const [data, setData] = useState<T[]>([]);

    const isCacheValid = useCallback(() => {
      const last = lastFetched[entityKey];
      return last ? Date.now() - last < CACHE_TIME : false;
    }, [lastFetched, entityKey]);

    const refresh = useCallback(async () => {
      try {
        const fresh = await adminApiRequest(endpoint);
        const sorted = sortFn(fresh || []);
        setData(sorted);
        setLastFetched(prev => ({ ...prev, [entityKey]: Date.now() }));
        return sorted;
      } catch (err) {
        console.error(`[${entityKey}] Refresh failed:`, err);
        // Hiba esetén is frissítjük az időt, hogy ne hívogassa percenként újra, ha halott a szerver
        setLastFetched(prev => ({ ...prev, [entityKey]: Date.now() }));
        return [];
      }
    }, [endpoint, entityKey, sortFn]);

    const getAll = async () => (isCacheValid() ? data : await refresh());
    const getOne = async (id: number) => await adminApiRequest(`${endpoint}/${id}`);

    const updateCache = (action: (prev: T[]) => T[]) => {
      setData(prev => sortFn(action(prev)));
      setLastFetched(prev => ({ ...prev, [entityKey]: Date.now() }));
      // Background sync nélkül is működik az optimista UI, 
      // de a refresh() biztosítja, hogy a szerver szerinti állapot legyen végül.
      refresh(); 
    };

    return { data, getAll, getOne, updateCache, setData };
  };

  // --- ENTITÁSOK ---
  const infos = useEntityCache<Info>('infos', '/info');
  const contacts = useEntityCache<Contact>('contacts', '/contact', d => [...d].sort((a, b) => a.ordering - b.ordering));
  const teams = useEntityCache<Team>('teams', '/team');
  const activities = useEntityCache<Activity>('activities', '/activity', d => [...d].sort((a, b) => a.title.localeCompare(b.title)));
  const brings = useEntityCache<Bring>('brings', '/bring', d => [...d].sort((a, b) => a.title.localeCompare(b.title)));
  
  const taskSort = (list: Task[]) => [...list].sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime() || a.timeOffset - b.timeOffset);
  const tasks = useEntityCache<Task>('tasks', '/task', taskSort);

  const progSort = (list: Program[]) => [...list].sort((a, b) => a.startDay.getTime() - b.startDay.getTime() || a.startTimeOffset - b.startTimeOffset);
  const programs = useEntityCache<Program>('programs', '/program', progSort);

  // --- EGYEDI LOGIKÁK ---

  const reorderContactsInCache = (ids: number[]) => {
    const orderMap = new Map(ids.map((id, index) => [id, index]));
    contacts.updateCache(prev => prev.map(item => ({
      ...item,
      ordering: orderMap.has(item.id) ? orderMap.get(item.id)! : item.ordering
    })));
  };

  const getDashboardData = async () => {
    if (dashboardData && lastFetched['dashboard'] && Date.now() - lastFetched['dashboard'] < CACHE_TIME) {
      return dashboardData;
    }
    const res = await adminApiRequest('/dashboard');
    setDashboardData(res);
    setLastFetched(prev => ({ ...prev, dashboard: Date.now() }));
    return res;
  };

  const flushCache = () => {
    setLastFetched({});
    setDashboardData(null);
    // Minden belső setData([]) hívása
    infos.setData([]);
    contacts.setData([]);
    teams.setData([]);
    activities.setData([]);
    brings.setData([]);
    tasks.setData([]);
    programs.setData([]);
  };

  return (
    <DbContext.Provider value={{
      getInfos: infos.getAll, getInfo: infos.getOne,
      addInfoToCache: (n) => infos.updateCache(p => [...p, n]),
      updateInfoInCache: (u) => infos.updateCache(p => p.map(i => i.id === u.id ? u : i)),
      removeInfoFromCache: (id) => infos.updateCache(p => p.filter(i => i.id !== id)),

      getContacts: contacts.getAll, getContact: contacts.getOne,
      addContactToCache: (n) => contacts.updateCache(p => [...p, n]),
      updateContactInCache: (u) => contacts.updateCache(p => p.map(c => c.id === u.id ? u : c)),
      removeContactFromCache: (id) => contacts.updateCache(p => p.filter(c => c.id !== id)),
      reorderContactsInCache,

      getTasks: tasks.getAll,
      addTaskToCache: (n) => tasks.updateCache(p => [...p, { ...n, day: new Date(n.day) }]),
      addTasksToCache: (ns) => tasks.updateCache(p => [...p, ...ns.map(n => ({ ...n, day: new Date(n.day) }))]),
      removeTaskFromCache: (id) => tasks.updateCache(p => p.filter(t => t.id !== id)),

      getPrograms: programs.getAll, getProgram: programs.getOne,
      addProgramToCache: (n) => programs.updateCache(p => [...p, { ...n, startDay: normalizeToUtcNoon(n.startDay), endDay: normalizeToUtcNoon(n.endDay) }]),
      updateProgramInCache: (u) => programs.updateCache(p => p.map(i => i.id === u.id ? u : i)),
      removeProgramFromCache: (id) => programs.updateCache(p => p.filter(i => i.id !== id)),

      getTeams: teams.getAll, getTeam: teams.getOne, 
      addTeamToCache: (n) => teams.updateCache(p => [n, ...p]),
      updateTeamInCache: (u) => teams.updateCache(p => p.map(t => t.id === u.id ? u : t)),
      removeTeamFromCache: (id) => teams.updateCache(p => p.filter(t => t.id !== id)),

      getActivities: activities.getAll, getActivity: activities.getOne,
      addActivityToCache: (n) => activities.updateCache(p => [...p, n]),
      updateActivityInCache: (u) => activities.updateCache(p => p.map(a => a.id === u.id ? u : a)),
      removeActivityFromCache: (id) => activities.updateCache(p => p.filter(a => a.id !== id)),

      getBrings: brings.getAll, 
      addBringToCache: (n) => brings.updateCache(p => [...p, n]), 
      removeBringFromCache: (id) => brings.updateCache(p => p.filter(b => b.id !== id)),
      
      getDashboardData, flushCache
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