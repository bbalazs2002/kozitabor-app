import React from 'react';
import { ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface InfoCardItemTimeProps {
  time: string;
  children: React.ReactNode;
  to?: string;
}

export const InfoCardItemTime: React.FC<InfoCardItemTimeProps> = ({ time, to, children }) => (
  <NavLink to={to ?? ""}>
    <div className="flex items-center py-3 border-b border-[#5d4037]/10 dark:border-[#C5A059]/15 whitespace-nowrap
                  text-[#8B2622] dark:text-[#C5A059] font-bold">
        <span className="ml-3 w-16 font-cinzel">{time}</span> 
        <span>{children}</span>
        {to && <ChevronRight size={18} className="ml-auto opacity-30" />}
    </div>
  </NavLink>
);