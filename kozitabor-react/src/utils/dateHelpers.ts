/** ISO dátumból (day) és másodpercből (offset) csinál szép HH:mm-t */
export const formatOffsetToTime = (offset: number): string => {
  const hours = Math.floor(offset / 3600);
  const minutes = Math.floor((offset % 3600) / 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/** Visszaadja a nap nevét (pl. "Hétfő") egy ISO stringből */
export const getDayName = (date: Date): string => {
  return date.toLocaleDateString('hu-HU', { 
    weekday: 'long',
    timeZone: 'UTC' // Ez a kulcs! Így a tárolt UTC időt nézi, nem a gépit.
  });
};

export const getDayDate = (dateString: string | Date): string => {
  // Mindig kényszerítjük a Date objektummá alakítást
  const d = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  return d.toLocaleDateString('hu-HU', { 
    weekday: 'long',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC' // Ez garantálja, hogy a tárolt 12:00-át nézi
  });
};

/** Csoportosítja az elemeket napok szerint a UI megjelenítéshez */
export const groupByDay = <T>(items: T[], dateField: keyof T) => {
  return items.reduce((acc, item) => {
    const val = item[dateField];
    // Konvertáljuk Date-re, ha string lenne
    const d = typeof val === 'string' || val instanceof Date ? new Date(val as any) : null;
    
    if (d) {
      const dayName = getDayDate(d);
      if (!acc[dayName]) acc[dayName] = [];
      acc[dayName].push(item);
    }
    return acc;
  }, {} as Record<string, T[]>);
};

export const getTodayNoonISO = (): string => {
  return getTodayNoon().toISOString(); 
  // Mindig "...T12:00:00.000Z" lesz a vége, bárhol is vagy.
};

export const getTodayNoon = (): Date => {
  const d = new Date();
  // Létrehozunk egy új dátumot a mai év/hónap/nap adatokkal, de fixen UTC 12:00-kor
  return new Date(Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    12, 0, 0, 0
  ));
};

export const normalizeToUtcNoon = (dateInput: string | Date): Date => {
  const d = new Date(dateInput);
  return new Date(Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    12, 0, 0, 0
  ));
};