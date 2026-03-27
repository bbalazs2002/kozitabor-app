import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/core/ThemeContext';

export const ChangeThemeBtn: React.FC = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    return (
    <>
        {/* 1. LEBEGŐ TÉMAVÁLTÓ GOMB */}
        <button 
          onClick={() => toggleTheme()}
          className="fixed bottom-6 right-6 z-[1000] w-14 h-14 rounded-full border-2 flex items-center justify-center 
                     shadow-2xl transition-all hover:scale-110 active:scale-90
                     bg-[#C5A059] border-[#3e3028] text-white
                     dark:bg-[#2b1e16] dark:border-[#C5A059] dark:text-[#C5A059]"
        >
          {isDarkMode ? <Sun size={28} /> : <Moon size={28} />}
        </button>
    </>
)};