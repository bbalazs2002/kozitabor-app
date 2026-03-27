import React from 'react';
import { ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface InfoCardItemIconProps {
  icon: React.ReactNode;
  to?: string;
  children: React.ReactNode;
}

export const InfoCardItemIcon: React.FC<InfoCardItemIconProps> = ({ icon, to, children }) => (
  <NavLink to={to ?? ""}>
    <div className="flex items-center gap-1 pl-2 py-3 border-b border-[#5d4037]/10 dark:border-[#C5A059]/15 text-[#3e3028] dark:text-[#eaddca] whitespace-nowrap">
        {icon}
        {children}
        {to && <ChevronRight size={18} className="ml-auto opacity-30" />}
    </div>
  </NavLink>
);