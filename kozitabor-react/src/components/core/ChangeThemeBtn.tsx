import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/core/ThemeContext';
import { Button } from './Button';

export const ChangeThemeBtn: React.FC = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    return (
      <Button
        onClick={() => toggleTheme()}
        // A p-0-t most már a komponens kezeli, ha látja a w-14-et
        className="fixed bottom-6 right-6 z-[1000] w-14 h-14 
                   shadow-2xl hover:scale-110 active:scale-90"
      >
        {isDarkMode ? <Sun size={25} /> : <Moon size={25} />}
      </Button>
)};