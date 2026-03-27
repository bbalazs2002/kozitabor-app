import { createContext, useContext, useState, type ReactNode } from 'react';
import { type Activity, type Bring, type Contact, type DashboardSummary, type Info, type Program, type Task, type Team } from '../../types/database';
import { adminApiRequest } from '../../utils/api';
import { normalizeToUtcNoon } from '../../utils/dateHelpers';

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
  const [infos, setInfos] = useState<Info[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [brings, setBrings] = useState<Bring[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Időbélyegek minden típushoz
  const [lastFetched, setLastFetched] = useState<{ [key: string]: number | null }>({
    infos: null,
    contacts: null,
    teams: null,
    activities: null,
    tasks: null,
    brings: null,
    programs: null,
    dashboard: null as number | null
  });

  const isCacheValid = (key: keyof typeof lastFetched) => {
    const last = lastFetched[key];
    if (!last) return false;
    return Date.now() - last < 60000; // 1 percig érvényes
  };

  const updateCacheTime = (key: keyof typeof lastFetched) => {
    setLastFetched(prev => ({ ...prev, [key]: Date.now() }));
  };

  {/* INFOS */}
  const refreshInfos = async () => {
    try {
      const freshData = await adminApiRequest('/info');
      setInfos(freshData || []);
      updateCacheTime('infos'); // Itt mondjuk meg, hogy friss az adatunk
    } catch (err) {
      console.error("[INFO] Háttér frissítés sikertelen:", err);
      updateCacheTime('infos'); // Hiba esetén is frissítjük az időt a ciklus ellen
    }
  };
  const getInfos = async (): Promise<Info[]> => {
    // Ha nem érvényes a cache, lefrissítjük
    if (!isCacheValid('infos')) {
      await refreshInfos();
    }
    return infos;
  };
  const getInfo = async (id: number): Promise<Info> => {
    try {
      // Egyedi lekérést általában nem cache-eljük ilyen szigorúan
      return await adminApiRequest(`/info/${id}`);
    } catch (err) {
      console.error(err);
      return { id: 0, title: "", icon: "Info" };
    }
  };
  const addInfoToCache = (newInfo: Info) => {
    setInfos(prev => [...prev, newInfo].sort((a, b) => b.id - a.id));
    updateCacheTime('infos'); // Frissítettük, 1 percig ne bántsa
    refreshInfos(); // Háttérszinkron
  };
  const updateInfoInCache = (updatedInfo: Info) => {
    setInfos(prev => prev.map(info => info.id === updatedInfo.id ? updatedInfo : info));
    updateCacheTime('infos');
    refreshInfos();
  };
  const removeInfoFromCache = (id: number) => {
    setInfos(prev => prev.filter(e => e.id !== id));
    updateCacheTime('infos');
    refreshInfos();
  };

  {/* CONTACTS */}
  const refreshContacts = async () => {
    try {
      const freshData = await adminApiRequest('/contact');
      setContacts(freshData || []);
      updateCacheTime('contacts'); // Jelezzük, hogy friss az adat
      return freshData || [];
    } catch (err) {
      console.error("[CONTACT] Háttér frissítés sikertelen:", err);
      updateCacheTime('contacts'); // Hiba esetén is frissítjük az időt a ciklus ellen
      return [];
    }
  };
  const getContacts = async (): Promise<Contact[]> => {
    // Ha a cache érvénytelen (régebbi mint 1 perc), lekérjük
    if (!isCacheValid('contacts')) {
      return await refreshContacts();
    }
    return contacts;
  };
  const getContact = async (id: number): Promise<Contact> => {
    try {
      return await adminApiRequest(`/contact/${id}`);
    } catch (err) {
      console.error(err);
      return { id: 0, name: "", tel: "", ordering: 999 };
    }
  };
  const addContactToCache = (newContact: Contact) => {
    setContacts(prev => [...prev, newContact].sort((a, b) => a.ordering - b.ordering));
    updateCacheTime('contacts'); // Manuális frissítés: a cache mostantól "friss"
    refreshContacts(); // Szinkron a háttérben
  };
  const updateContactInCache = (updatedContact: Contact) => {
    setContacts(prev => 
      prev.map(c => c.id === updatedContact.id ? updatedContact : c)
          .sort((a, b) => a.ordering - b.ordering)
    );
    updateCacheTime('contacts');
    refreshContacts();
  };
  const removeContactFromCache = (id: number) => {
    setContacts(prev => prev.filter(e => e.id !== id));
    updateCacheTime('contacts');
    refreshContacts();
  };
  const reorderContactsInCache = (ids: number[]) => {
    const orderMap = new Map(ids.map((id, index) => [id, index]));
    
    setContacts(prev => {
      const updated = prev.map(item => ({
        ...item,
        ordering: orderMap.has(item.id) ? orderMap.get(item.id)! : item.ordering
      })).sort((a, b) => a.ordering - b.ordering);
      
      return updated;
    });

    updateCacheTime('contacts');
  };

  {/* TEAMS */}
  const refreshTeams = async () => {
    try {
      const freshData = await adminApiRequest('/team');
      setTeams(freshData || []);
      updateCacheTime('teams'); // Jelezzük, hogy friss az adat
      return freshData || [];
    } catch (err) {
      console.error("[TEAMS] Háttér frissítés sikertelen:", err);
      updateCacheTime('teams'); // Hiba esetén is frissítjük az időt a ciklus ellen
      return [];
    }
  };
  const getTeams = async (): Promise<Team[]> => {
    // Csak akkor kérünk le újat, ha letelt az 1 perc (isCacheValid = false)
    if (!isCacheValid('teams')) {
      return await refreshTeams();
    }
    return teams;
  };
  const getTeam = async (id: number): Promise<Team> => {
    try {
      return await adminApiRequest(`/team/${id}`);
    } catch (err) {
      console.error(err);
      return { id: 0, name: "" };
    }
  };
  const addTeamToCache = (newTeam: Team) => {
    setTeams(prev => [newTeam, ...prev].sort((a, b) => b.id - a.id));
    updateCacheTime('teams'); // Optimista frissítés: a cache-t érvényesnek jelöljük
    refreshTeams(); // Szinkronizáció a háttérben
  };
  const updateTeamInCache = (updatedTeam: Team) => {
    setTeams(prev => prev.map(team => team.id === updatedTeam.id ? updatedTeam : team));
    updateCacheTime('teams');
    refreshTeams();
  };
  const removeTeamFromCache = (id: number) => {
    setTeams(prev => prev.filter(team => team.id !== id));
    updateCacheTime('teams');
    refreshTeams();
  };

  {/* ACTIVITIES */}
  const refreshActivities = async () => {
    try {
      const freshData = await adminApiRequest('/activity');
      // ABC sorrendbe rendezzük a nevek alapján
      const sortedData = (freshData || []).sort((a: Activity, b: Activity) => 
        a.title.localeCompare(b.title)
      );
      setActivities(sortedData);
      updateCacheTime('activities'); // Frissítjük az időbélyeget
      return sortedData;
    } catch (err) {
      console.error("[ACTIVITY] Háttér frissítés sikertelen:", err);
      updateCacheTime('activities'); // Hiba esetén is frissítünk a végtelen ciklus ellen
      return [];
    }
  };
  const getActivities = async (): Promise<Activity[]> => {
    // Ha lejárt az 1 perc, vagy még nem volt lekérve, frissítünk
    if (!isCacheValid('activities')) {
      return await refreshActivities();
    }
    return activities;
  };
  const getActivity = async (id: number): Promise<Activity> => {
    try {
      return await adminApiRequest(`/activity/${id}`);
    } catch (err) {
      console.error(err);
      return { id: 0, title: "" };
    }
  };
  const addActivityToCache = (newActivity: Activity) => {
    setActivities(prev => 
      [...prev, newActivity].sort((a, b) => a.title.localeCompare(b.title))
    );
    updateCacheTime('activities'); // Manuálisan érvényesnek jelöljük a cache-t
    refreshActivities(); // Szinkron a háttérben
  };
  const updateActivityInCache = (updatedActivity: Activity) => {
    setActivities(prev => 
      prev.map(a => a.id === updatedActivity.id ? updatedActivity : a)
          .sort((a, b) => a.title.localeCompare(b.title))
    );
    updateCacheTime('activities');
    refreshActivities();
  };
  const removeActivityFromCache = (id: number) => {
    setActivities(prev => prev.filter(a => a.id !== id));
    updateCacheTime('activities');
    refreshActivities();
  };

  {/* TASKS */}
  const sortTasks = (list: Task[]) => {
    return [...list].sort((a, b) => {
      const dateDiff = new Date(a.day).getTime() - new Date(b.day).getTime();
      if (dateDiff !== 0) return dateDiff;
      return a.timeOffset - b.timeOffset;
    });
  };
  const refreshTasks = async () => {
    try {
      const rawData = await adminApiRequest('/task');
      
      const formattedData: Task[] = (rawData || []).map((t: any) => ({
        ...t,
        day: normalizeToUtcNoon(t.day) // Feltételezve, hogy ez a segédfüggvény elérhető
      }));

      const sorted = sortTasks(formattedData);

      setTasks(sorted);
      updateCacheTime('tasks'); // Frissítjük az időbélyeget
      return sorted;
    } catch (err) {
      console.error("[TASKS] Frissítés hiba:", err);
      updateCacheTime('tasks'); // Hiba esetén is frissítünk a végtelen ciklus ellen
      return [];
    }
  };
  const getTasks = async (): Promise<Task[]> => {
    // Ha lejárt az 1 perc, vagy még nem volt lekérve, frissítünk
    if (!isCacheValid('tasks')) {
      return await refreshTasks();
    }
    return tasks;
  };
  const addTaskToCache = (newTask: any) => {
    const formattedTask: Task = {
      ...newTask,
      day: new Date(newTask.day)
    };
    setTasks(prev => sortTasks([...prev, formattedTask]));
    
    updateCacheTime('tasks'); // Manuálisan érvényesnek jelöljük a cache-t
    refreshTasks(); // Szinkron a háttérben
  };
  const addTasksToCache = (newTasks: any[]) => {
    setTasks(prev => {
      const formattedTasks: Task[] = newTasks.map((t: any) => ({
        ...t,
        day: new Date(t.day)
      }));
      return sortTasks([...prev, ...formattedTasks]);
    });

    updateCacheTime('tasks');
    refreshTasks();
  };
  const removeTaskFromCache = (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    updateCacheTime('tasks');
    refreshTasks();
  };

  {/* BRINGS */}
  const refreshBrings = async () => {
    try {
      const freshData = await adminApiRequest('/bring');
      const sorted = (freshData || []).sort((a: Bring, b: Bring) => 
        a.title.localeCompare(b.title)
      );
      setBrings(sorted);
      updateCacheTime('brings'); // Időbélyeg frissítése
      return sorted;
    } catch (err) {
      console.error("[BRINGS] Frissítés hiba:", err);
      updateCacheTime('brings'); // Hiba esetén is frissítünk a végtelen ciklus ellen
      return [];
    }
  };
  const getBrings = async (): Promise<Bring[]> => {
    // Ha a cache lejárt (1 perc), lekérjük újra
    if (!isCacheValid('brings')) {
      return await refreshBrings();
    }
    return brings;
  };
  const addBringToCache = (newBring: Bring) => {
    setBrings(prev => 
      [...prev, newBring].sort((a, b) => a.title.localeCompare(b.title))
    );
    updateCacheTime('brings'); // Manuális érvényesítés
    refreshBrings(); // Háttérszinkron (Javítva: refreshBrings-et hívunk, nem refreshTasks-ot)
  };
  const removeBringFromCache = (id: number) => {
    // JAVÍTÁS: A brings state-et módosítjuk, nem a contacts-ot!
    setBrings(prev => prev.filter(e => e.id !== id));
    updateCacheTime('brings');
    refreshBrings(); // JAVÍTÁS: refreshBrings-et hívunk
  };

  {/* PROGRAMS */}
  const sortPrograms = (list: Program[]) => {
    return [...list].sort((a, b) => {
      // getTime() most már fixen UTC 12:00-ákat hasonlít össze
      const dateDiff = a.startDay.getTime() - b.startDay.getTime();
      if (dateDiff !== 0) return dateDiff;
      return a.startTimeOffset - b.startTimeOffset;
    });
  };
  const refreshPrograms = async () => {
    try {
      const rawData = await adminApiRequest('/program');

      // KONVERZIÓ: A JSON stringeket valódi Date objektumokká alakítjuk
      const formattedData: Program[] = (rawData || []).map((p: any) => ({
        ...p,
        startDay: normalizeToUtcNoon(p.startDay),
        endDay: normalizeToUtcNoon(p.endDay)
      }));

      const sorted = sortPrograms(formattedData);

      setPrograms(sorted);
      updateCacheTime('programs'); // Időbélyeg frissítése
      return sorted;
    } catch (err) {
      console.error("[PROGRAMS] Frissítés hiba:", err);
      updateCacheTime('programs'); // Hiba esetén is frissítünk a végtelen ciklus ellen
      return [];
    }
  };
  const getPrograms = async (): Promise<Program[]> => {
    // Ha nem érvényes a cache (1 percnél régebbi), lekérjük
    if (!isCacheValid('programs')) {
      return await refreshPrograms();
    }
    return programs;
  };
  const getProgram = async (id: number): Promise<Program> => {
    try {
      return await adminApiRequest(`/program/${id}`);
    } catch (err) {
      console.error(`[PROGRAMS] Hiba a(z) ${id} lekérésekor:`, err);
      return {
        id: 0,
        title: "",
        startDay: normalizeToUtcNoon("1997-01-01 12:00:00"),
        endDay: normalizeToUtcNoon("1997-01-01 12:00:00"),
        endTimeOffset: 0,
        startTimeOffset: 0
      };
    }
  };
  const addProgramToCache = (newProg: any) => {
    const formattedProg: Program = {
      ...newProg,
      startDay: normalizeToUtcNoon(newProg.startDay),
      endDay: normalizeToUtcNoon(newProg.endDay)
    };
    
    setPrograms(prev => sortPrograms([...prev, formattedProg]));
    updateCacheTime('programs'); // Manuálisan frissnek jelöljük a cache-t
    refreshPrograms(); // Szinkron a háttérben
  };
  const updateProgramInCache = (updatedProg: any) => {
    const formattedProg: Program = {
      ...updatedProg,
      startDay: normalizeToUtcNoon(updatedProg.startDay),
      endDay: normalizeToUtcNoon(updatedProg.endDay)
    };

    setPrograms(prev => 
      sortPrograms(prev.map(p => p.id === formattedProg.id ? formattedProg : p))
    );
    updateCacheTime('programs');
    refreshPrograms();
  };
  const removeProgramFromCache = (id: number) => {
    setPrograms(prev => prev.filter(p => p.id !== id));
    updateCacheTime('programs');
    refreshPrograms();
  };

  {/* DASHBOARD */}
  const getDashboardData = async () => {
    // Ha van friss cache (1 percen belül), azt adjuk vissza
    if (isCacheValid('dashboard') && dashboardData) {
      return dashboardData;
    }

    try {
      const response = await adminApiRequest('/dashboard');
      
      setDashboardData(response);
      updateCacheTime('dashboard');
      
      return response;
    } catch (error) {
      console.error("Hiba a dashboard adatok lekérésekor:", error);
      
      // Hiba esetén is frissítjük az időbélyeget, hogy ne bombázzuk az API-t
      updateCacheTime('dashboard');
      throw error;
    }
  };

  // Flush
  const flushCache = () => {
    setInfos([]);
    setContacts([]);
    setTeams([]);
    setActivities([]);
    setTasks([]);
    setBrings([]);
    setPrograms([]);
    setDashboardData([]);
    setLastFetched({
      infos: null,
      contacts: null,
      teams: null,
      activities: null,
      tasks: null,
      brings: null,
      programs: null,
      dashboard: null as number | null
    });
  };

  return (
    <DbContext.Provider value={{ 
        getInfos, getInfo, addInfoToCache, updateInfoInCache, removeInfoFromCache,
        getContacts, getContact, addContactToCache, updateContactInCache, removeContactFromCache, reorderContactsInCache,
        getTeams, getTeam, addTeamToCache, updateTeamInCache, removeTeamFromCache,
        getActivities, getActivity, addActivityToCache, updateActivityInCache, removeActivityFromCache,
        getTasks, addTaskToCache, addTasksToCache, removeTaskFromCache,
        getBrings, addBringToCache, removeBringFromCache,
        getPrograms, getProgram, addProgramToCache, updateProgramInCache, removeProgramFromCache,
        getDashboardData,
        flushCache
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