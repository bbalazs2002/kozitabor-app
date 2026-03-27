import React, { useMemo, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Search, ChevronDown } from 'lucide-react';

// Közös label stílus
const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1 uppercase tracking-wider text-[11px]">
    {children}
  </label>
);

export const Input = ({ label, ...props }: any) => (
  <div className="w-full">
    <Label>{label}</Label>
    <input 
      {...props} 
      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white" 
    />
  </div>
);

export const TextArea = ({ label, ...props }: any) => (
  <div className="w-full">
    <Label>{label}</Label>
    <textarea 
      {...props} 
      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-gray-50 focus:bg-white min-h-[200px]" 
    />
  </div>
);

export const Select = ({ label, options, ...props }: any) => (
  <div className="w-full">
    <Label>{label}</Label>
    <select 
      {...props} 
      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 appearance-none cursor-pointer"
    >
      <option value="">Nincs kiválasztva</option>
      {options.map((opt: any) => (
        <option key={opt.id} value={opt.id}>{opt.title || opt.name}</option>
      ))}
    </select>
  </div>
);

export const Checkbox = ({ label, checked, onChange }: any) => (
  <label className="flex items-center gap-3 cursor-pointer group p-2">
    <div className="relative">
      <input 
        type="checkbox" 
        className="sr-only" 
        checked={checked} 
        onChange={onChange} 
      />
      <div className={`w-10 h-6 rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-4' : ''}`}></div>
    </div>
    <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider text-[11px]">{label}</span>
  </label>
);

export const IconPicker = ({ label, value, onChange }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Az összes elérhető ikon nevének kinyerése
  const iconNames = useMemo(() => {
    return Object.keys(LucideIcons).filter(
      (key) => key !== 'createLucideIcon' && typeof (LucideIcons as any)[key] !== 'undefined'
    );
  }, []);

  // Szűrés a keresőkifejezés alapján
  const filteredIcons = useMemo(() => {
    return iconNames
      .filter((name) => name.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 100); // Csak az első 100-at mutatjuk a teljesítmény miatt
  }, [searchTerm, iconNames]);

  // A kiválasztott ikon renderelése dinamikusan
  const SelectedIcon = (LucideIcons as any)[value] || LucideIcons.HelpCircle;

  return (
    <div className="relative w-full">
      <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1 uppercase tracking-wider text-[11px]">
        {label}
      </label>
      
      {/* Választó gomb */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white transition-all outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <div className="flex items-center gap-3">
          <SelectedIcon size={20} className="text-indigo-600" />
          <span className="text-gray-700 font-medium">{value || 'Válassz ikont...'}</span>
        </div>
        <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Autocomplete Panel */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-3 border-b border-gray-50 flex items-center gap-2 bg-gray-50/50">
            <Search size={16} className="text-gray-400" />
            <input
              autoFocus
              className="bg-transparent border-none outline-none text-sm w-full py-1"
              placeholder="Ikon keresése (pl: Map, Heart...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="max-h-64 overflow-y-auto p-2 grid grid-cols-4 gap-1">
            {filteredIcons.map((name) => {
              const IconTag = (LucideIcons as any)[name];
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => {
                    onChange(name);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors hover:bg-indigo-50 group ${
                    value === name ? 'bg-indigo-100' : ''
                  }`}
                >
                  <IconTag size={20} className={`${value === name ? 'text-indigo-600' : 'text-gray-500 group-hover:text-indigo-600'}`} />
                  <span className="text-[8px] mt-1 text-gray-400 truncate w-full text-center">{name}</span>
                </button>
              );
            })}
            {filteredIcons.length === 0 && (
              <div className="col-span-4 py-4 text-center text-xs text-gray-400">Nincs találat...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface NoonDatePickerProps {
  value: string | Date; // ISO string vagy Date objektum
  onChange: (date: Date) => void;
  label?: string;
}
export const NoonDatePicker: React.FC<NoonDatePickerProps> = ({ value, onChange, label = "Nap" }) => {
  
  // Segédfüggvény: Biztonságos konverzió YYYY-MM-DD formátumra az input számára
  const getInputValue = () => {
    if (!value) return "";
    
    // Ha string, megpróbáljuk Date-té tenni
    const d = typeof value === 'string' ? new Date(value) : value;
    
    if (isNaN(d.getTime())) return "";

    // Az toISOString() a legbiztonságosabb, mert az MINDIG az UTC dátumot adja vissza.
    // Mivel az adatbázisban 12:00:00Z van, az toISOString() garantáltan 
    // a helyes napot fogja visszaadni "YYYY-MM-DD" formátumban.
    return d.toISOString().split('T')[0];
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // "YYYY-MM-DD"
    if (!val) return;

    const [year, month, day] = val.split('-').map(Number);
    
    // Fontos: a hónap 0-tól indul a JS Date-nél!
    const utcDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
    
    onChange(utcDate);
  };

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-semibold text-gray-600">{label}</label>}
      <input
        type="date"
        value={getInputValue()}
        onChange={handleChange}
        className="border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
      />
    </div>
  );
};

interface TimeOffsetPickerProps {
  offset: number; // Másodpercben (pl. 36000 = 10:00)
  onChange: (newOffset: number) => void;
  label?: string;
}
export const TimeOffsetPicker: React.FC<TimeOffsetPickerProps> = ({ offset, onChange, label = "Időpont" }) => {
  
  // Másodpercből csinál "HH:mm" stringet az inputnak
  const secondsToTimeString = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  // "HH:mm" stringből csinál másodpercet a mentéshez
  const timeStringToSeconds = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h * 3600) + (m * 60);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type="time"
        value={secondsToTimeString(offset)}
        onChange={(e) => onChange(timeStringToSeconds(e.target.value))}
        className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </div>
  );
};