import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/core/ThemeContext'; // Feltételezve az elérési utat

interface ButtonProps {
  color?: string;
  to?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string; // Új paraméter
}

export const Button: React.FC<ButtonProps> = ({ 
  color, to, children, onClick, className = "" 
}) => {
  const { colors, isDarkMode } = useTheme();
  const finalBgColor = color || colors.button1;

  // Megnézzük, hogy a kívülről jövő osztályok között van-e fix szélesség/magasság
  const hasFixedSize = className.includes('w-') || className.includes('h-');

  return (
    to ? <NavLink
      key={isDarkMode ? 'dark-btn' : 'light-btn'}
      onClick={onClick}
      to={to}
      style={{ 
        backgroundColor: finalBgColor,
        borderColor: colors.border,
        color: colors.text1 
      }}
      className={`
        inline-flex items-center justify-center gap-2 border 
        transition-all duration-300 font-cinzel font-bold text-[0.7rem] 
        uppercase tracking-wider hover:brightness-110 active:scale-95
        rounded-full overflow-hidden
        
        ${hasFixedSize ? 'p-0' : 'px-5 py-2'}
        
        ${!isDarkMode ? 'shadow-md shadow-black/20' : 'shadow-none'}
        ${className}
      `}
    >
      <span className="flex items-center justify-center w-full h-full">
        {children}
      </span>
    </NavLink> : <div
      key={isDarkMode ? 'dark-btn' : 'light-btn'}
      onClick={onClick}
      style={{ 
        backgroundColor: finalBgColor,
        borderColor: colors.border,
        color: colors.text1 
      }}
      className={`
        inline-flex items-center justify-center gap-2 border 
        transition-all duration-300 font-cinzel font-bold text-[0.7rem] 
        uppercase tracking-wider hover:brightness-110 active:scale-95
        rounded-full overflow-hidden
        
        ${hasFixedSize ? 'p-0' : 'px-5 py-2'}
        
        ${!isDarkMode ? 'shadow-md shadow-black/20' : 'shadow-none'}
        ${className}
      `}
    >
      <span className="flex items-center justify-center w-full h-full">
        {children}
      </span>
    </div>
  );
};