import React from 'react';
import { type LucideIcon, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { useTheme } from '../../context/core/ThemeContext';

interface InfoCardProps {
  title: string;
  icon: LucideIcon;
  buttonText?: string;
  buttonColor?: string;
  buttonTo?: string;
  children: React.ReactNode;
}

export const InfoCard: React.FC<InfoCardProps> = ({ 
  title, 
  icon: Icon, 
  buttonText, 
  buttonColor, 
  buttonTo, 
  children 
}) => {
  const { colors } = useTheme();

  return (
    <div 
      className="w-full max-w-[25rem] rounded-[1.875rem] border p-[1.375rem] mb-[1.125rem] relative z-10 shadow-lg"
      style={{
        // Gradiens háttér a paletta szerint
        backgroundImage: `linear-gradient(to bottom right, ${colors.cardBgGradient.from}, ${colors.cardBgGradient.to})`,
        // Keret színe (sötét módban 40% opacity-vel)
        borderColor: colors.border,
        // Árnyék finomhangolása
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.6)'
      }}
    >
      {/* HEADER: ICON + TITLE */}
      <div className="flex items-center mb-4">
        <Icon 
          size={22} 
          className="mr-3"
          color={colors.icon}
        />
        <h3 
          className="font-cinzel text-lg"
          style={{ color: colors.text2 }}
        >
          {title}
        </h3>
      </div>
      
      {/* CONTENT AREA */}
      <div className="space-y-0">
        {children}
      </div>

      {/* OPTIONAL ACTION BUTTON */}
      {buttonText && (
        <div className='flex justify-end w-full mt-4'>
          <Button color={buttonColor} to={buttonTo}>
             <span className="flex items-center gap-1">
                {buttonText} <ChevronRight size={16} />
             </span>
          </Button>
        </div>
      )}
    </div>
  );
};