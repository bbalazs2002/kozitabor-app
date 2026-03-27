import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, Calendar, Users, Contact, ClipboardList, Info, Home, List, CheckCheck, LogOut } from 'lucide-react'; // Ajánlott ikoncsomag
import AdminButton from '../components/admin/AdminButton';
import { useAuth } from '../context/admin/AuthContext';

const AdminLayout = () => {

  const [user, setUser] = useState(null);
  const auth = useAuth();
  useEffect(() => {
    if (!auth.loading) {
      setUser(auth.user);
    }
  }, [auth]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const menuItems = user ? [
    { name: 'Irányítópult', icon: <Home size={20} />, path: '/admin' },
    { name: 'Programok', icon: <Calendar size={20} />, path: '/admin/programs' },
    { name: 'Csapatok', icon: <Users size={20} />, path: '/admin/teams' },
    { name: 'Kontaktok', icon: <Contact size={20} />, path: '/admin/contacts' },
    { name: 'Fontos infók', icon: <Info size={20} />, path: '/admin/infos' },
    { name: 'Mit hozz?', icon: <CheckCheck size={20} />, path: '/admin/brings' },
    { name: 'Tevékenységek', icon: <List size={20} />, path: '/admin/activities' },
    { name: 'Feladatok', icon: <ClipboardList size={20} />, path: '/admin/tasks' },
  ] : [];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobil Overlay - csak akkor látszik, ha nyitva a menü mobilon */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" 
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-indigo-900 text-white transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-6 border-b border-indigo-800">
          <span className="text-xl font-bold tracking-wider">KoziAdmin</span>
          <button className="lg:hidden" onClick={toggleSidebar}>
            <X size={24} />
          </button>
        </div>

        <nav className="mt-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)} // Mobilon bezáródik kattintás után
                className={`
                  flex items-center gap-4 px-4 py-3 rounded-lg transition-colors
                  ${isActive ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'}
                `}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 lg:px-8">
          <button 
            onClick={toggleSidebar} 
            className="p-2 rounded-md hover:bg-gray-100 lg:hidden"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex-1 flex justify-end items-center gap-4">
            {user && <AdminButton
              onClick={auth.logout}
            >
              Kijelentkezés
              <LogOut />
            </AdminButton>}
          </div>
        </header>

        {/* Dinamikus tartalom (Outlet) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;