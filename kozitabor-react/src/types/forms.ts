export interface InfoData {
  title: string;
  content: string;
  icon: string;
}

export interface MapData {
  show: boolean;
  lat: number;
  lng: number;
  zoom: number;
}

export interface ContactData {
  name: string;
  tel: string;
  roleId?: number | null;
}

export interface TeamData {
  name: string;
}

export interface ActivityData {
  title: string;
}

export interface TaskData {
  day: Date;
  timeOffset: number;
  activityIds: number[];
  teamIds: number[];
}

export interface BringData {
  title: string;
}

export interface OrganizerTaskData {
  day: Date;
  timeOffset: number;
  contactIds: number[];
  activityIds: number[];
}

export interface DeadlineData {
  label: string;
  date: string;
}

export interface SettingData {
  label: string;
  value: string;
}

export interface ProgramData {
  title: string;
  desc: string;
  startDay: Date;
  endDay: Date;
  startTimeOffset: number;
  endTimeOffset: number;
}
