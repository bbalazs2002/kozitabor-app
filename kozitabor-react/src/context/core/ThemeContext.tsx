import { type ReactNode, createContext, useContext, useMemo, useState } from "react";

// --- SZÍNPALETTA DEFINÍCIÓK ---
const LIGHT_PALETTE = {
  text1: "#f4e4bc",
  text2: "#3e3028",
  icon: "#5d4037",
  border: "#c5a059",
  button1: "#4e7a3a",
  button2: "#8b2622",
  headerBgGradient: {
    from: "#8b2622",
    to: "#561412",
  },
  cardBgGradient: {
    from: "#fffcf0",
    to: "#f4e4bc",
  },
  navBtnGradients: [
    { from: "#00428a", to: "#0085c7" },
    { from: "#1a1a1a", to: "#444444" },
    { from: "#9a0030", to: "#df0024" },
    { from: "#b07200", to: "#f4c300" },
    { from: "#005c2e", to: "#009f3d" },
  ],
};

const DARK_PALETTE = {
  text1: "#c5a059",
  text2: "#eaddca",
  icon: "#d4af37",
  border: "#c5a059",
  button1: "rgba(0,0,0,0)",
  button2: "rgba(0,0,0,0)",
  headerBgGradient: {
    from: "#1a120d",
    to: "#000",
  },
  cardBgGradient: {
    from: "#3c2a21",
    to: "#2b1e16",
  },
  navBtnGradients: [{ from: "#150c08", to: "#150c08" }],
};

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: typeof LIGHT_PALETTE;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const hour = new Date().getHours();
    return hour < 6 || hour >= 20;
  });

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const colors = useMemo(() => (isDarkMode ? DARK_PALETTE : LIGHT_PALETTE), [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
      <div
        className={`${isDarkMode ? "dark" : ""} min-h-screen transition-colors duration-300`}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
