import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/use-auth';
import { PublicLayout } from '@/components/shared/PublicLayout';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import ProgramsPage from '@/pages/ProgramsPage';
import EventsPage from '@/pages/EventsPage';
import ProjectsPage from '@/pages/ProjectsPage';
import InsightsPage from '@/pages/InsightsPage';
import PartnersPage from '@/pages/PartnersPage';
import TeamPage from '@/pages/TeamPage';
import GetInvolvedPage from '@/pages/GetInvolvedPage';
import ContactPage from '@/pages/ContactPage';
import JoinPage from '@/pages/JoinPage';
import LoginPage from '@/pages/LoginPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import PartnerPage from '@/pages/PartnerPage';
import ApplyPage from '@/pages/ApplyPage';
import DashboardPage from '@/pages/DashboardPage';
import ProfilePage from '@/pages/ProfilePage';
import MembershipPage from '@/pages/MembershipPage';
import VerifyMemberPage from '@/pages/VerifyMemberPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import AdminMembersPage from '@/pages/AdminMembersPage';
import AdminEventsPage from '@/pages/AdminEventsPage';
import AdminMessagesPage from '@/pages/AdminMessagesPage';
import AdminPartnershipsPage from '@/pages/AdminPartnershipsPage';
import AdminSettingsPage from '@/pages/AdminSettingsPage';
import AdminAdminsPage from '@/pages/AdminAdminsPage';
import NotFoundPage from '@/pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/programs" element={<ProgramsPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/partners" element={<PartnersPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/get-involved" element={<GetInvolvedPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/join" element={<JoinPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/partner" element={<PartnerPage />} />
          </Route>

          {/* Public verification routes */}
          <Route path="/verify/member/:memberId" element={<VerifyMemberPage />} />

          {/* Protected member routes */}
          <Route
            path="/apply"
            element={
              <ProtectedRoute>
                <ApplyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/membership"
            element={
              <ProtectedRoute>
                <MembershipPage />
              </ProtectedRoute>
            }
          />

          {/* Protected admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireRole={['SUPER_ADMIN', 'CHAPTER_ADMIN']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/members"
            element={
              <ProtectedRoute requireRole={['SUPER_ADMIN', 'CHAPTER_ADMIN']}>
                <AdminMembersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <ProtectedRoute requireRole={['SUPER_ADMIN', 'CHAPTER_ADMIN']}>
                <AdminEventsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/messages"
            element={
              <ProtectedRoute requireRole={['SUPER_ADMIN', 'CHAPTER_ADMIN']}>
                <AdminMessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/partnerships"
            element={
              <ProtectedRoute requireRole={['SUPER_ADMIN', 'CHAPTER_ADMIN']}>
                <AdminPartnershipsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requireRole={['SUPER_ADMIN', 'CHAPTER_ADMIN']}>
                <AdminSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/admins"
            element={
              <ProtectedRoute requireRole={['SUPER_ADMIN']}>
                <AdminAdminsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
