
import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardPage from '@/pages/DashboardPage';
import AuthPage from '@/pages/AuthPage';
import ProfileSettingsPage from '@/pages/ProfileSettingsPage';
import GoalsPage from '@/pages/GoalsPage';
import RecommendationsPage from '@/pages/RecommendationsPage';
import InvitePage from '@/pages/InvitePage';
import PartnerInvitationPage from '@/pages/PartnerInvitationPage';
import ConnectPage from '@/pages/ConnectPage';
import PartnerDebugPage from './pages/PartnerDebugPage';

function App() {
  const { user, isLoading } = useAuth();
  const [firstLoad, setFirstLoad] = useState(true);

  // Check if user is logged in
  const isLoggedIn = !!user;

  useEffect(() => {
    if (!isLoading) {
      setFirstLoad(false);
    }
  }, [isLoading]);

  if (isLoading && firstLoad) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={isLoggedIn ? <Navigate to="/dashboard" /> : <AuthPage />} />
        <Route path="/profile" element={isLoggedIn ? <ProfileSettingsPage /> : <Navigate to="/auth" />} />
        <Route path="/dashboard" element={isLoggedIn ? <DashboardPage /> : <Navigate to="/auth" />} />
        <Route path="/goals" element={isLoggedIn ? <GoalsPage /> : <Navigate to="/auth" />} />
        <Route path="/recommendations" element={isLoggedIn ? <RecommendationsPage /> : <Navigate to="/auth" />} />
        <Route path="/invite" element={isLoggedIn ? <InvitePage /> : <Navigate to="/auth" />} />
        <Route path="/invitation/:code" element={isLoggedIn ? <PartnerInvitationPage /> : <Navigate to="/auth" />} />
        <Route path="/connect" element={isLoggedIn ? <ConnectPage /> : <Navigate to="/auth" />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/partner-debug" element={<PartnerDebugPage />} />
      </Routes>
    </Router>
  );
}

export default App;
