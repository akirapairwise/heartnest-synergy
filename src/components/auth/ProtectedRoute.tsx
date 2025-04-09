
import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is not authenticated after loading is complete, redirect to auth
    if (!isLoading && !user) {
      navigate('/auth', { state: { from: location }, replace: true });
    }
  }, [user, isLoading, location, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-love-50 via-harmony-50 to-calm-50">
        <Loader2 className="h-10 w-10 text-love-500 animate-spin mb-4" />
        <p className="text-harmony-700">Authenticating...</p>
      </div>
    );
  }

  // If user is not authenticated (after loading completed), don't render anything
  // The useEffect above will handle the redirect
  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
