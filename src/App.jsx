import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { ParticipantProvider, useParticipant } from '@/lib/ParticipantContext';
import { BrandingProvider } from '@/lib/BrandingContext';

import Home from './pages/Home';
import Entry from './pages/Entry';
import Dashboard from './pages/Dashboard';
import JobSearch from './pages/JobSearch';
import JobTracker from './pages/JobTracker';
import ResumeBuilder from './pages/ResumeBuilder';
import CareerPath from './pages/CareerPath';
import Resources from './pages/Resources';
import Profile from './pages/Profile';
import AppLayout from './components/layout/AppLayout';

const RequireParticipant = ({ children }) => {
  const { participant, loading } = useParticipant();
  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
    </div>
  );
  if (!participant) return <Navigate to="/" replace />;
  return children;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <ParticipantProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/onsite" element={<Entry />} />
        <Route path="/public" element={<Entry />} />
        <Route element={<RequireParticipant><AppLayout /></RequireParticipant>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/job-search" element={<JobSearch />} />
          <Route path="/job-tracker" element={<JobTracker />} />
          <Route path="/resume-builder" element={<ResumeBuilder />} />
          <Route path="/career-path" element={<CareerPath />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </ParticipantProvider>
  );
};

function App() {
  return (
    <BrandingProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </BrandingProvider>
  )
}

export default App