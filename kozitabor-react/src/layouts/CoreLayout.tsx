// src/layouts/MainLayout.tsx
import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { StatusHeader } from '../components/core/StatusHeader';
import { NavBtn } from '../components/core/NavBtn';
import { ChangeThemeBtn } from '../components/core/ChangeThemeBtn';
import { Calendar, Users, ChevronLeft, Home, BadgeQuestionMark, Contact2, Info } from 'lucide-react';
import forestBg from '../assets/core/forest-background.avif';
import { Button } from '../components/core/Button';

export const CoreLayout: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center px-[0.95rem] pb-[6.25rem]
                 bg-cover bg-center bg-fixed relative transition-all duration-700 font-montserrat"
      style={{
        backgroundImage: `url(${forestBg})`,
        paddingTop: 'calc(var(--status-header-height, 68px) + 2.25rem)',
      }}
    >
      <div className="absolute inset-0 bg-black/15 dark:bg-black/75 transition-opacity duration-700 pointer-events-none" />
      
      <ChangeThemeBtn />
      <StatusHeader />

      {/* FIX NAVIGÁCIÓ */}
      <div className="relative z-10 w-full max-w-[25rem] flex flex-col gap-3 mb-5">
        <div className="flex justify-center gap-3">
          <NavBtn
            label="GYIK"
            icon={BadgeQuestionMark}
            index={0}
            to="gyik"
          />
          <NavBtn
            label="ELÉRHETŐSÉGEK"
            icon={Contact2}
            index={1}
            to="contacts"
          />
          <NavBtn
            label="PROGRAMOK"
            icon={Calendar}
            index={2}
            to="program"
          />
        </div>
        <div className="flex justify-center gap-3">
          <NavBtn
            label="CSOPORTOK"
            icon={Users}
            index={3}
            to="team"
          />
          <NavBtn
            label="INFÓK"
            icon={Info}
            index={4}
            to="info"
          />
        </div>
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