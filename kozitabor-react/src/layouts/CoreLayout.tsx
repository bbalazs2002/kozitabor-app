// src/layouts/MainLayout.tsx
import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { StatusHeader } from '../components/core/StatusHeader';
import { NavBtn } from '../components/core/NavBtn';
import { ChangeThemeBtn } from '../components/core/ChangeThemeBtn';
import { Calendar, Users, MapPin, ChevronLeft, Home } from 'lucide-react';
import forestBg from '../assets/core/forest-background.avif';
import { Button } from '../components/core/Button';

export const CoreLayout: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center px-[0.95rem] pt-[1.25rem] pb-[6.25rem] 
                 bg-cover bg-center bg-fixed relative transition-all duration-700 font-montserrat"
      style={{ backgroundImage: `url(${forestBg})` }}
    >
      <div className="absolute inset-0 bg-black/15 dark:bg-black/75 transition-opacity duration-700 pointer-events-none" />
      
      <ChangeThemeBtn />
      <StatusHeader />

      {/* FIX NAVIGÁCIÓ */}
      <div className="relative z-10 flex gap-4 mb-5">
                  <NavBtn 
                      label="PROGRAM" 
                      icon={Calendar} 
                      index={0}
                      to="program"
                  />
                  <NavBtn 
                      label="CSOPORT" 
                      icon={Users}
                      index={1}
                      to="team"
                  />
                  <NavBtn 
                      label="INFÓK" 
                      icon={MapPin}
                      index={2}
                      to="info"
                  />
              </div>

      <main className="w-full max-w-[25rem] relative z-10">

        {/* Navigate back buttons */}
        {!isHomePage && <div className="flex gap-1 justify-start w-full mb-1 max-w-[25rem]">
          <Button onClick={() => navigate(-1)}>
            <ChevronLeft /> Vissza
          </Button>
          <Button to='/'>
            <Home /> Főoldal
          </Button>
        </div>}

        {/* Main content */}
        <Outlet />
        
      </main>
    </div>
  );
};