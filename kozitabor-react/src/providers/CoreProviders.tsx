import { Outlet } from "react-router-dom";
import { DbProvider } from "../context/core/DbContext";
import { ThemeProvider } from "../context/core/ThemeContext";

const CoreProviders = () => {
  return (
    <DbProvider>
      <ThemeProvider>
        {/* Az Outlet mondja meg a Routernek, hogy hova kerüljenek a gyerek útvonalak */}
        <Outlet />
      </ThemeProvider>
    </DbProvider>
  );
};

export default CoreProviders;