import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./context/admin/AuthContext";
import AdminLayout from "./layouts/AdminLayout";
import AuthLayout from "./layouts/AuthLayout";
import { CoreLayout } from "./layouts/CoreLayout";
import { ActivityFormPage } from "./pages/admin/ActivityFormPage";
import ActivityListPage from "./pages/admin/ActivityListPage";
import { BringFormPage } from "./pages/admin/BringFormPage";
import BringListPage from "./pages/admin/BringListPage";
import { ContactFormPage } from "./pages/admin/ContactFormPage";
import ContactListPage from "./pages/admin/ContactListPage";
import DashboardPage from "./pages/admin/DashboardPage";
import DeadlineFormPage from "./pages/admin/DeadlineFormPage";
import DeadlineListPage from "./pages/admin/DeadlineListPage";
import InfoFormPage from "./pages/admin/InfoFormPage";
import InfoListPage from "./pages/admin/InfoListPage";
import { OrganizerActivityFormPage } from "./pages/admin/OrganizerActivityFormPage";
import OrganizerActivityListPage from "./pages/admin/OrganizerActivityListPage";
import OrganizerTaskFormPage from "./pages/admin/OrganizerTaskFormPage";
import OrganizerTaskListPage from "./pages/admin/OrganizerTaskListPage";
import ProgramFormPage from "./pages/admin/ProgramFormPage";
import ProgramListPage from "./pages/admin/ProgramListPage";
import RoleListPage from "./pages/admin/RoleListPage";
import SettingsFormPage from "./pages/admin/SettingsFormPage";
import SettingsListPage from "./pages/admin/SettingsListPage";
import TaskFormPage from "./pages/admin/TaskFormPage";
import TaskListPage from "./pages/admin/TaskListPage";
import { TeamFormPage } from "./pages/admin/TeamFormPage";
import TeamListPage from "./pages/admin/TeamListPage";
import LoginPage from "./pages/auth/Login";
import CamperTaskPage from "./pages/core/CamperTaskPage";
import ContactPage from "./pages/core/ContactPage";
import DeadlinePage from "./pages/core/DeadlinePage";
import GYIKPage from "./pages/core/GYIKPage";
import HomePage from "./pages/core/HomePage";
import { InfoDetailsPage } from "./pages/core/InfoDetailsPage";
import InfoPage from "./pages/core/InfoPage";
import { ProgramDetailsPage } from "./pages/core/ProgramDetailsPage";
import ProgramPage from "./pages/core/ProgramPage";
import TeamPage from "./pages/core/TeamPage";
import WhatToBringPage from "./pages/core/WhatToBringPage";
import AdminProviders from "./providers/AdminProviders";
import AuthProviders from "./providers/AuthProviders";
import CoreProviders from "./providers/CoreProviders";

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
              <Route path="tasks" element={<CamperTaskPage />} />
              <Route path="deadlines" element={<DeadlinePage />} />
              <Route path="gyik" element={<GYIKPage />} />
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

                {/* CONTACTS & ROLES */}
                <Route path="contacts" element={<ContactListPage />} />
                <Route path="contact/:id" element={<ContactFormPage />} />
                <Route path="roles" element={<RoleListPage />} />

                {/* INFO */}
                <Route path="infos" element={<InfoListPage />} />
                <Route path="info/:id" element={<InfoFormPage />} />

                {/* ACTIVITIES */}
                <Route path="activities" element={<ActivityListPage />} />
                <Route path="activity/:id" element={<ActivityFormPage />} />

                {/* CAMPER TASKS */}
                <Route path="tasks" element={<TaskListPage />} />
                <Route path="task/new" element={<TaskFormPage />} />

                {/* ORGANIZER ACTIVITIES & TASKS */}
                <Route
                  path="organizer-activities"
                  element={<OrganizerActivityListPage />}
                />
                <Route
                  path="organizer-activity/:id"
                  element={<OrganizerActivityFormPage />}
                />
                <Route path="organizer-tasks" element={<OrganizerTaskListPage />} />
                <Route path="organizer-task/new" element={<OrganizerTaskFormPage />} />

                {/* BRING */}
                <Route path="brings" element={<BringListPage />} />
                <Route path="bring/new" element={<BringFormPage />} />

                {/* SETTINGS */}
                <Route path="settings" element={<SettingsListPage />} />
                <Route path="setting/:id" element={<SettingsFormPage />} />

                {/* DEADLINES */}
                <Route path="deadlines" element={<DeadlineListPage />} />
                <Route path="deadline/:id" element={<DeadlineFormPage />} />
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
