import React from 'react';
import { useTheme } from '../../context/core/ThemeContext';

interface ContentCardProps {
  title: string;
  children: React.ReactNode;
}

export const ContentCard: React.FC<ContentCardProps> = ({ title, children }) => {
  const { colors } = useTheme();

  return (
    <div className="animate-fade-in w-full max-w-[25rem] mx-auto flex flex-col items-center">
      
      {/* CARD */}
      <div 
        className="w-full rounded-[1.875rem] border p-8 mb-8 shadow-xl transition-all duration-500"
        style={{
          backgroundImage: `linear-gradient(to bottom right, ${colors.cardBgGradient.from}, ${colors.cardBgGradient.to})`,
          borderColor: colors.border
        }}
      >
        
        {/* TITLE */}
        <h1 
          className="font-cinzel text-3xl mb-8 text-center tracking-widest drop-shadow-md transition-colors duration-500"
          style={{
            color: colors.text2 
          }}
        >
          {title}
        </h1>

        {/* CONTENT */}
        <div className="w-full">
          {children}
        </div>

      </div>
    </div>
  );
};