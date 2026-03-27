import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface NavBtnProps {
  label: string;
  icon: LucideIcon;
  color1: string;
  color2: string;
  to: string;
}

export const NavBtn: React.FC<NavBtnProps> = ({ label, icon: Icon, color1, color2, to }) => (
  <NavLink 
    to={to} 
    style={() => ({
      backgroundImage: `linear-gradient(to top right, ${color1}, ${color2})`
    })}
    className={({ isActive }) => `
      /* ADJUNK HOZZÁ FLEX-ET A MÉRETEZÉSHEZ */
      flex flex-col items-center justify-center 
      w-24 h-24 rounded-full border-[3px] shadow-2xl transition-all
      
      /* HÁTTÉR KEZELÉSE */
      dark:!bg-none dark:!bg-[#150c08] 
      
      /* SZÍNEK ÉS AKTÍV ÁLLAPOT */
      text-[#f4e4bc] dark:text-[#C5A059]
      ${isActive ? 'border-white scale-110 z-20' : 'border-[#C5A059] opacity-90 hover:opacity-100'}
    `}
  >
    <Icon size={28} />
    <span className="font-cinzel mt-1 text-[0.6rem] font-bold tracking-widest uppercase">
      {label}
    </span>
  </NavLink>
);