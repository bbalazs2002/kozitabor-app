import React from 'react';
import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { useTheme } from '../../context/core/ThemeContext';

interface NavBtnProps {
  label: string;
  icon: LucideIcon;
  to: string;
  index: number;
}

export const NavBtn: React.FC<NavBtnProps> = ({ label, icon: Icon, to, index }) => {
  const { colors, isDarkMode } = useTheme();

  const gradient = colors.navBtnGradients[index % colors.navBtnGradients.length];

  return (
    <NavLink 
      key={isDarkMode ? 'dark' : 'light'}
      to={to} 
      style={{
        backgroundImage: `linear-gradient(to top right, ${gradient.from}, ${gradient.to})`,
        backgroundColor: 'transparent',
        borderColor: colors.border,
        color: colors.text1
      }}
      className={({ isActive }) => `
        flex flex-col items-center justify-center 
        w-24 h-24 rounded-full border-[3px] shadow-2xl
        ${isActive ? '!border-white scale-110 z-20 shadow-white/20' : 'opacity-90'}
      `}
    >
      <Icon size={28} style={{ color: 'inherit' }} />
      <span 
        className="font-cinzel mt-1 text-[0.6rem] font-bold tracking-widest uppercase text-center px-2 leading-tight"
        style={{ color: 'inherit' }}
      >
        {label}
      </span>
    </NavLink>
  );
};