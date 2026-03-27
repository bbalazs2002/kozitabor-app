import { Outlet } from "react-router-dom";
import { DbProvider } from "../context/admin/DbContext";
import { ToastProvider } from "../context/admin/ToastContext";

const AdminProviders = () => {
  return (
    <DbProvider>
      <ToastProvider>
        <Outlet /> 
      </ToastProvider>
    </DbProvider>
  );
};

export default AdminProviders;