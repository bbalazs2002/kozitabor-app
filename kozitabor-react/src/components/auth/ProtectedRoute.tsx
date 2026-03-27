import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/admin/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. Amíg a refreshSession fut (pl. oldalfrissítéskor), ne dobjuk ki a júzert
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-gray-500 font-medium">Azonosítás folyamatban...</p>
      </div>
    );
  }

  // 2. Ha nincs user (és már nem is töltünk), mehet a loginra
  if (!user) {
    // A 'state' segítségével megjegyezzük, honnan jött a júzer, 
    // hogy belépés után visszaküldhessük oda.
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 3. Ha van user, mehet a kért tartalom
  return <Outlet />;
};