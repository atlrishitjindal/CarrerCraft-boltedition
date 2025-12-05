import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardOverview } from './pages/Dashboard/DashboardOverview';
import { ResumePage } from './pages/Dashboard/ResumePage';
import { JobsPage } from './pages/Dashboard/JobsPage';
import { ApplicationsPage } from './pages/Dashboard/ApplicationsPage';
import { SettingsPage } from './pages/Dashboard/SettingsPage';
import { EmailsPage } from './pages/Dashboard/EmailsPage';
import { Toaster } from 'sonner';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Routes>
                      <Route index element={<DashboardOverview />} />
                      <Route path="resumes" element={<ResumePage />} />
                      <Route path="jobs" element={<JobsPage />} />
                      <Route path="applications" element={<ApplicationsPage />} />
                      <Route path="emails" element={<EmailsPage />} />
                      <Route path="settings" element={<SettingsPage />} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
