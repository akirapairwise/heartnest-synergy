
import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const AppLayout = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isPageReady, setIsPageReady] = useState(false);
  
  // Check authentication status
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        toast.error("Authentication required", {
          description: "Please log in to continue"
        });
        navigate('/auth', { replace: true });
      } else {
        setIsPageReady(true);
      }
    }
  }, [user, isLoading, navigate]);

  // Show loading when authenticating
  if (isLoading || !isPageReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 p-4 sm:p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
