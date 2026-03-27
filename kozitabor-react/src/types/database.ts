export interface Contact {
  id: number;
  name: string;
  tel?: string;
  ordering: number;
}

export interface Program {
  id: number;
  startDay: Date;
  endDay: Date;
  startTimeOffset: number;
  endTimeOffset: number;
  title: string;
  desc?: string | null;
}

export interface Info {
  id: number;
  title: string;
  icon: string;
  content?: string;
  map?: Map;
}

export interface Map {
  id: number;
  title: string;
  lat: number;
  lng: number;
  zoom: number;
}

export interface Team {
  id: number;
  name: string;
  leaders?: { contact: Contact }[];
}

export interface Task {
  id: number;
  day: Date;
  timeOffset: number;
  activity: { title: Activity };
  team: { name: Team };
}

export interface Bring {
    id: number;
    title: string;
}

export interface Team {
    id: number;
    name: string;
}

export interface Activity {
    id: number;
    title: string;
}

export interface DashboardSummary {
  stats: {
    totalTeams: number;
    totalTasks: number;
    totalLeaders: number;
    activeInfoCards: number;
  };
  activityDistribution: {
    name: string; // Az Activity.title
    count: number; // Hány Task tartozik hozzá
  }[];
  teamWorkload: {
    teamName: string;
    taskCount: number;
  }[];
  upcomingPrograms: {
    id: number;
    title: string;
    startDay: string;
    startTimeOffset: number;
  }[];
}

export interface LivePrograms {
  current?: Program;
  next?: Program;
}