
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import OnboardingRequired from "./components/auth/OnboardingRequired";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import ConnectPage from "./pages/ConnectPage";
import DashboardPage from "./pages/DashboardPage";
import MoodsPage from "./pages/MoodsPage";
import MoodHistoryPage from "./pages/MoodHistoryPage";
import GoalsPage from "./pages/GoalsPage";
import CheckInsPage from "./pages/CheckInsPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";
import AppLayout from "./components/layout/AppLayout";
import InvitePage from "./pages/InvitePage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/invite" element={<InvitePage />} />
          
          {/* Routes that require authentication and completed onboarding */}
          <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/moods" element={<MoodsPage />} />
            <Route path="/mood-history" element={<MoodHistoryPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/check-ins" element={<CheckInsPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/profile" element={<Navigate to="/profile/settings" replace />} />
            <Route path="/profile/settings" element={<ProfileSettingsPage />} />
          </Route>
          
          {/* Routes that require authentication but not completed onboarding */}
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <OnboardingRequired mustBeIncomplete>
                <OnboardingPage />
              </OnboardingRequired>
            </ProtectedRoute>
          } />
          <Route path="/connect" element={
            <ProtectedRoute>
              <OnboardingRequired>
                <ConnectPage />
              </OnboardingRequired>
            </ProtectedRoute>
          } />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
