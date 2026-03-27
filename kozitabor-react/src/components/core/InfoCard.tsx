import React from 'react';
import { type LucideIcon, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface InfoCardProps {
  title: string;
  icon: LucideIcon;
  buttonText?: string;
  buttonColor?: string;
  buttonTo?: string;
  children: React.ReactNode;
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, icon: Icon, buttonText, buttonColor, buttonTo, children }) => (
  <div className="w-full max-w-[25rem] rounded-[1.875rem] border p-[1.375rem] mb-[1.125rem] relative z-10 transition-all duration-500 shadow-lg
                  bg-gradient-to-br from-[#fffcf0] to-[#f4e4bc] border-[#C5A059] shadow-black/10
                  dark:from-[#3c2a21] dark:to-[#2b1e16] dark:border-[#C5A059]/40 dark:shadow-black/60">
    <div className="flex items-center mb-4">
      <Icon size={22} className="mr-3 text-[#5d4037] dark:text-[#d4af37]" />
      <h3 className="font-cinzel text-lg text-[#3e3028] dark:text-[#eaddca]">{title}</h3>
    </div>
    
    <div className="space-y-1">
      {children}
    </div>

    {buttonText && (
      <div className='flex justify-end w-full mt-4'>
        <Button color={buttonColor ?? ""} to={buttonTo ?? ""}>
            {buttonText} <ChevronRight />
        </Button>
      </div>
    )}
  </div>
);