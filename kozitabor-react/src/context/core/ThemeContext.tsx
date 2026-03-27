import { createContext, useContext, useState, type ReactNode } from 'react';

const getInitialTheme = (): boolean => {
  const hour = new Date().getHours();
  // 20:00 és 06:00 között sötét mód
  return hour < 6 || hour >= 20;
};

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(getInitialTheme);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {/* Fontos: A div és a Provider is le legyen zárva! */}
      <div className={isDarkMode ? 'dark' : ''}>
        {children}
      </div>
    </ThemeContext.Provider>
  )};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};