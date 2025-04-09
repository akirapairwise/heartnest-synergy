
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import GoalsPage from "./pages/GoalsPage";
import CheckInsPage from "./pages/CheckInsPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import AppLayout from "./components/layout/AppLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Routes that require authentication and completed onboarding */}
            <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/moods" element={<MoodsPage />} />
              <Route path="/goals" element={<GoalsPage />} />
              <Route path="/check-ins" element={<CheckInsPage />} />
              <Route path="/recommendations" element={<RecommendationsPage />} />
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
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
