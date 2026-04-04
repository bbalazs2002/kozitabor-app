import { Outlet } from "react-router-dom";
import { DbProvider } from "../context/core/DbContext";
import { ThemeProvider } from "../context/core/ThemeContext";

const CoreProviders = () => {
  return (
    <DbProvider>
      <ThemeProvider>
        <Outlet />
      </ThemeProvider>
    </DbProvider>
  );
};

export default CoreProviders;