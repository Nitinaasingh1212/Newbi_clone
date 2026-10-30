import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { HomePage } from './pages/HomePage';
import { CreatorPage } from './pages/CreatorPage';
import { ServicesPage } from './pages/ServicesPage';
import { WorkPage } from './pages/WorkPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

import { ProtectedRoute } from './components/common/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardOverview } from './pages/dashboard/DashboardOverview';
import { DashboardProfile } from './pages/dashboard/DashboardProfile';
import { DashboardCampaigns } from './pages/dashboard/DashboardCampaigns';
import { DashboardApplications } from './pages/dashboard/DashboardApplications';
import { DashboardRewards } from './pages/dashboard/DashboardRewards';

import { AdminLayout } from './layouts/AdminLayout';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminCampaigns } from './pages/admin/AdminCampaigns';
import { AdminApplications } from './pages/admin/AdminApplications';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminMessages } from './pages/admin/AdminMessages';
import { AdminRewards } from './pages/admin/AdminRewards';

export const App = () => {
  return (
    <Routes>
      {/* Public Pages with Navigation & Footer */}
      <Route path="/" element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="creator" element={<CreatorPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="work" element={<WorkPage />} />
        <Route path="contact" element={<ContactPage />} />
      </Route>

      {/* Authentication */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected Creator Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardOverview />} />
        <Route path="profile" element={<DashboardProfile />} />
        <Route path="campaigns" element={<DashboardCampaigns />} />
        <Route path="applications" element={<DashboardApplications />} />
        <Route path="rewards" element={<DashboardRewards />} />
      </Route>

      {/* Protected Admin Command Center */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="campaigns" element={<AdminCampaigns />} />
        <Route path="applications" element={<AdminApplications />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="rewards" element={<AdminRewards />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
