import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout  from './layouts/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage'
import AdminProviders from './providers/AdminProviders';
import ProgramListPage from './pages/admin/ProgramListPage';
import ProgramFormPage from './pages/admin/ProgramFormPage';
import TeamListPage from './pages/admin/TeamListPage';
import { TeamFormPage } from './pages/admin/TeamFormPage';
import ContactListPage from './pages/admin/ContactListPage';
import { ContactFormPage } from './pages/admin/ContactFormPage';
import InfoListPage from './pages/admin/InfoListPage';
import InfoFormPage from './pages/admin/InfoFormPage';
import ActivityListPage from './pages/admin/ActivityListPage';
import { ActivityFormPage } from './pages/admin/ActivityFormPage';
import TaskListPage from './pages/admin/TaskListPage';
import TaskFormPage from './pages/admin/TaskFormPage';
import BringListPage from './pages/admin/BringListPage';
import { BringFormPage } from './pages/admin/BringFormPage';
import { CoreLayout } from './layouts/CoreLayout';
import HomePage from './pages/core/HomePage';
import ProgramPage from './pages/core/ProgramPage';
import InfoPage from './pages/core/InfoPage';
import { InfoDetailsPage } from './pages/core/InfoDetailsPage';
import TeamPage from './pages/core/TeamPage';
import ContactPage from './pages/core/ContactPage';
import WhatToBringPage from './pages/core/WhatToBringPage';
import CoreProviders from './providers/CoreProviders';
import { ProgramDetailsPage } from './pages/core/ProgramDetailsPage';
import LoginPage from './pages/auth/Login';
import AuthProviders from './providers/AuthProviders';
import AuthLayout from './layouts/AuthLayout';
import { AuthProvider } from './context/admin/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter basename="/kozitabor/">
      <AuthProvider>
        <Routes>
          {/* FELHASZNÁLÓI OLDALAK */}
          <Route element={<CoreProviders />}>
            <Route element={<CoreLayout />}>
              <Route index element={<HomePage />} />
              <Route path="program" element={<ProgramPage />} />
              <Route path="program/:progId" element={<ProgramDetailsPage />} />
              <Route path="info" element={<InfoPage />} />
              <Route path="info/:infoId" element={<InfoDetailsPage />} />
              <Route path="team" element={<TeamPage />} />
              <Route path="contacts" element={<ContactPage />} />
              <Route path="whattobring" element={<WhatToBringPage />} />
            </Route>
          </Route>

          {/* ADMIN OLDALAK */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminProviders />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />

                {/* PROGRAMS */}
                <Route path="programs" element={<ProgramListPage />} />
                <Route path="program/:id" element={<ProgramFormPage />} />

                {/* TEAMS */}
                <Route path="teams" element={<TeamListPage />} />
                <Route path="team/:id" element={<TeamFormPage />} />

                {/* CONTACTS */}
                <Route path="contacts" element={<ContactListPage />} />
                <Route path="contact/:id" element={<ContactFormPage />} />

                {/* INFO */}
                <Route path="infos" element={<InfoListPage />} />
                <Route path="info/:id" element={<InfoFormPage />} />

                {/* ACTIVITIES */}
                <Route path="activities" element={<ActivityListPage />} />
                <Route path="activity/:id" element={<ActivityFormPage />} />

                {/* TASKS */}
                <Route path="tasks" element={<TaskListPage />} />
                <Route path="task/new" element={<TaskFormPage />} />

                {/* BRING */}
                <Route path="brings" element={<BringListPage />} />
                <Route path="bring/new" element={<BringFormPage />} />
              </Route>
            </Route>
          </Route>

          {/* AUTH OLDALAK */}
          <Route element={<AuthProviders />}>
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<LoginPage />} />
            </Route>
          </Route>

          {/* 404 vagy átirányítás */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;