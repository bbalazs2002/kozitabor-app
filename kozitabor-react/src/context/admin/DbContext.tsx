import { type ReactNode, createContext, useCallback, useContext, useState } from "react";
import {
  type Activity,
  type Bring,
  type CamperTask,
  type Contact,
  type Deadline,
  type Info,
  type OrganizerActivity,
  type OrganizerTask,
  type Program,
  type Role,
  type Setting,
  type Team,
} from "../../types/database";
import { adminApiRequest } from "../../utils/api";
import { normalizeToUtcNoon } from "../../utils/dateHelpers";

const CACHE_TIME = 60000; // 1 perc

interface DbContextType {
  // Roles
  getRoles: () => Promise<Role[]>;
  addRoleToCache: (role: Role) => void;
  removeRoleFromCache: (id: number) => void;
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
  // Camper Activities
  getActivities: () => Promise<Activity[]>;
  getActivity: (id: number) => Promise<Activity>;
  addActivityToCache: (a: Activity) => void;
  updateActivityInCache: (a: Activity) => void;
  removeActivityFromCache: (id: number) => void;
  // Camper Tasks
  getTasks: () => Promise<CamperTask[]>;
  addTasksToCache: (tasks: CamperTask[]) => void;
  removeTaskFromCache: (id: number) => void;
  // Organizer Activities
  getOrganizerActivities: () => Promise<OrganizerActivity[]>;
  getOrganizerActivity: (id: number) => Promise<OrganizerActivity>;
  addOrganizerActivityToCache: (a: OrganizerActivity) => void;
  updateOrganizerActivityInCache: (a: OrganizerActivity) => void;
  removeOrganizerActivityFromCache: (id: number) => void;
  // Organizer Tasks
  getOrganizerTasks: () => Promise<OrganizerTask[]>;
  addOrganizerTasksToCache: (tasks: OrganizerTask[]) => void;
  removeOrganizerTaskFromCache: (id: number) => void;
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
  // Settings
  getSettings: () => Promise<Setting[]>;
  getSetting: (id: number) => Promise<Setting>;
  addSettingToCache: (s: Setting) => void;
  updateSettingInCache: (s: Setting) => void;
  removeSettingFromCache: (id: number) => void;
  // Deadlines
  getDeadlines: () => Promise<Deadline[]>;
  getDeadline: (id: number) => Promise<Deadline>;
  addDeadlineToCache: (d: Deadline) => void;
  updateDeadlineInCache: (d: Deadline) => void;
  removeDeadlineFromCache: (id: number) => void;
  flushCache: () => void;
}

const DbContext = createContext<DbContextType | undefined>(undefined);

export const DbProvider = ({ children }: { children: ReactNode }) => {
  const [lastFetched, setLastFetched] = useState<Record<string, number | null>>({});

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
        setLastFetched((prev) => ({ ...prev, [entityKey]: Date.now() }));
        return sorted;
      } catch (err) {
        console.error(`[${entityKey}] Refresh failed:`, err);
        setLastFetched((prev) => ({ ...prev, [entityKey]: Date.now() }));
        return [];
      }
    }, [endpoint, entityKey, sortFn]);

    const getAll = async () => (isCacheValid() ? data : await refresh());
    const getOne = async (id: number) => await adminApiRequest(`${endpoint}/${id}`);

    const updateCache = (action: (prev: T[]) => T[]) => {
      setData((prev) => sortFn(action(prev)));
      setLastFetched((prev) => ({ ...prev, [entityKey]: Date.now() }));
      refresh();
    };

    return { data, getAll, getOne, updateCache, setData };
  };

  // --- ENTITÁSOK ---
  const roles = useEntityCache<Role>("roles", "/role", (d) =>
    [...d].sort((a, b) => a.name.localeCompare(b.name))
  );
  const infos = useEntityCache<Info>("infos", "/info");
  const contacts = useEntityCache<Contact>("contacts", "/contact", (d) =>
    [...d].sort((a, b) => a.ordering - b.ordering)
  );
  const teams = useEntityCache<Team>("teams", "/team");
  const activities = useEntityCache<Activity>("activities", "/camper-activity", (d) =>
    [...d].sort((a, b) => a.title.localeCompare(b.title))
  );
  const brings = useEntityCache<Bring>("brings", "/bring", (d) =>
    [...d].sort((a, b) => a.title.localeCompare(b.title))
  );
  const organizerActivities = useEntityCache<OrganizerActivity>(
    "organizerActivities",
    "/organizer-activity",
    (d) => [...d].sort((a, b) => a.title.localeCompare(b.title))
  );

  const taskSort = (list: CamperTask[]) =>
    [...list].sort(
      (a, b) =>
        new Date(a.day).getTime() - new Date(b.day).getTime() ||
        a.timeOffset - b.timeOffset
    );
  const tasks = useEntityCache<CamperTask>("tasks", "/camper-task", taskSort);

  const orgTaskSort = (list: OrganizerTask[]) =>
    [...list].sort(
      (a, b) =>
        new Date(a.day).getTime() - new Date(b.day).getTime() ||
        a.timeOffset - b.timeOffset
    );
  const organizerTasks = useEntityCache<OrganizerTask>(
    "organizerTasks",
    "/organizer-task",
    orgTaskSort
  );

  const progSort = (list: Program[]) =>
    [...list].sort(
      (a, b) =>
        new Date(a.startDay).getTime() - new Date(b.startDay).getTime() ||
        a.startTimeOffset - b.startTimeOffset
    );
  const programs = useEntityCache<Program>("programs", "/program", progSort);

  const settings = useEntityCache<Setting>("settings", "/setting", (d) =>
    [...d].sort((a, b) => a.label.localeCompare(b.label))
  );

  const deadlineSort = (list: Deadline[]) =>
    [...list].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const deadlines = useEntityCache<Deadline>("deadlines", "/deadline", deadlineSort);

  // --- EGYEDI LOGIKÁK ---

  const reorderContactsInCache = (ids: number[]) => {
    const orderMap = new Map(ids.map((id, index) => [id, index]));
    contacts.updateCache((prev) =>
      prev.map((item) => ({
        ...item,
        ordering: orderMap.has(item.id) ? orderMap.get(item.id)! : item.ordering,
      }))
    );
  };

  const flushCache = () => {
    setLastFetched({});
    roles.setData([]);
    infos.setData([]);
    contacts.setData([]);
    teams.setData([]);
    activities.setData([]);
    brings.setData([]);
    tasks.setData([]);
    organizerActivities.setData([]);
    organizerTasks.setData([]);
    programs.setData([]);
    settings.setData([]);
    deadlines.setData([]);
  };

  return (
    <DbContext.Provider
      value={{
        getRoles: roles.getAll,
        addRoleToCache: (n) => roles.updateCache((p) => [...p, n]),
        removeRoleFromCache: (id) =>
          roles.updateCache((p) => p.filter((r) => r.id !== id)),

        getInfos: infos.getAll,
        getInfo: infos.getOne,
        addInfoToCache: (n) => infos.updateCache((p) => [...p, n]),
        updateInfoInCache: (u) =>
          infos.updateCache((p) => p.map((i) => (i.id === u.id ? u : i))),
        removeInfoFromCache: (id) =>
          infos.updateCache((p) => p.filter((i) => i.id !== id)),

        getContacts: contacts.getAll,
        getContact: contacts.getOne,
        addContactToCache: (n) => contacts.updateCache((p) => [...p, n]),
        updateContactInCache: (u) =>
          contacts.updateCache((p) => p.map((c) => (c.id === u.id ? u : c))),
        removeContactFromCache: (id) =>
          contacts.updateCache((p) => p.filter((c) => c.id !== id)),
        reorderContactsInCache,

        getTeams: teams.getAll,
        getTeam: teams.getOne,
        addTeamToCache: (n) => teams.updateCache((p) => [n, ...p]),
        updateTeamInCache: (u) =>
          teams.updateCache((p) => p.map((t) => (t.id === u.id ? u : t))),
        removeTeamFromCache: (id) =>
          teams.updateCache((p) => p.filter((t) => t.id !== id)),

        getActivities: activities.getAll,
        getActivity: activities.getOne,
        addActivityToCache: (n) => activities.updateCache((p) => [...p, n]),
        updateActivityInCache: (u) =>
          activities.updateCache((p) => p.map((a) => (a.id === u.id ? u : a))),
        removeActivityFromCache: (id) =>
          activities.updateCache((p) => p.filter((a) => a.id !== id)),

        getTasks: tasks.getAll,
        addTasksToCache: (ns) => tasks.updateCache((p) => [...p, ...ns]),
        removeTaskFromCache: (id) =>
          tasks.updateCache((p) => p.filter((t) => t.id !== id)),

        getOrganizerActivities: organizerActivities.getAll,
        getOrganizerActivity: organizerActivities.getOne,
        addOrganizerActivityToCache: (n) =>
          organizerActivities.updateCache((p) => [...p, n]),
        updateOrganizerActivityInCache: (u) =>
          organizerActivities.updateCache((p) => p.map((a) => (a.id === u.id ? u : a))),
        removeOrganizerActivityFromCache: (id) =>
          organizerActivities.updateCache((p) => p.filter((a) => a.id !== id)),

        getOrganizerTasks: organizerTasks.getAll,
        addOrganizerTasksToCache: (ns) =>
          organizerTasks.updateCache((p) => [...p, ...ns]),
        removeOrganizerTaskFromCache: (id) =>
          organizerTasks.updateCache((p) => p.filter((t) => t.id !== id)),

        getBrings: brings.getAll,
        addBringToCache: (n) => brings.updateCache((p) => [...p, n]),
        removeBringFromCache: (id) =>
          brings.updateCache((p) => p.filter((b) => b.id !== id)),

        getPrograms: programs.getAll,
        getProgram: programs.getOne,
        addProgramToCache: (n) =>
          programs.updateCache((p) => [
            ...p,
            {
              ...n,
              startDay: normalizeToUtcNoon(n.startDay),
              endDay: normalizeToUtcNoon(n.endDay),
            },
          ]),
        updateProgramInCache: (u) =>
          programs.updateCache((p) => p.map((i) => (i.id === u.id ? u : i))),
        removeProgramFromCache: (id) =>
          programs.updateCache((p) => p.filter((i) => i.id !== id)),

        getSettings: settings.getAll,
        getSetting: settings.getOne,
        addSettingToCache: (n) => settings.updateCache((p) => [...p, n]),
        updateSettingInCache: (u) =>
          settings.updateCache((p) => p.map((s) => (s.id === u.id ? u : s))),
        removeSettingFromCache: (id) =>
          settings.updateCache((p) => p.filter((s) => s.id !== id)),

        getDeadlines: deadlines.getAll,
        getDeadline: deadlines.getOne,
        addDeadlineToCache: (n) => deadlines.updateCache((p) => [...p, n]),
        updateDeadlineInCache: (u) =>
          deadlines.updateCache((p) => p.map((d) => (d.id === u.id ? u : d))),
        removeDeadlineFromCache: (id) =>
          deadlines.updateCache((p) => p.filter((d) => d.id !== id)),

        flushCache,
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
