import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuthLayout;