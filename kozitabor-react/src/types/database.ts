export interface Role {
  id: number;
  name: string;
}

export interface Contact {
  id: number;
  name: string;
  tel?: string;
  ordering: number;
  role?: Role;
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

export interface Media {
  id: number;
  url: string;
  type: "IMAGE" | "FILE";
}

export interface Info {
  id: number;
  title: string;
  icon: string;
  content?: string;
  map?: Map;
  media?: Media[];
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

export interface Bring {
  id: number;
  title: string;
}

export interface Activity {
  id: number;
  title: string;
}

export interface OrganizerActivity {
  id: number;
  title: string;
}

export interface CamperTask {
  id: number;
  day: string | Date;
  timeOffset: number;
  team: Team;
  camperActivity: Activity;
}

export interface OrganizerTask {
  id: number;
  day: string | Date;
  timeOffset: number;
  contact: Contact;
  organizerActivity: OrganizerActivity;
}

export interface Deadline {
  id: number;
  label: string;
  date: string | Date;
}

export interface Setting {
  id: number;
  str_id: string;
  label: string;
  value: string;
  comment: string;
}

export interface LivePrograms {
  current?: Program;
  next?: Program;
}
