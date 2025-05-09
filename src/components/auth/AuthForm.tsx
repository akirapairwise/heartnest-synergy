
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart } from "lucide-react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import SocialLoginButtons from './SocialLoginButtons';
import PasswordResetForm from './PasswordResetForm';
import UpdatePasswordForm from './UpdatePasswordForm';

const AuthForm = () => {
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('login');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isOnboardingComplete } = useAuth();
  
  // Check if there's a redirected parameter in the URL search params
  const searchParams = new URLSearchParams(location.search);
  const redirected = searchParams.get('redirected');
  
  // Set active tab based on URL query parameters
  useEffect(() => {
    if (redirected === 'reset-password') {
      setActiveTab('update-password');
    } else if (redirected === 'confirmation') {
      setError(null);
      setActiveTab('login');
    } else if (location.hash === '#reset') {
      setActiveTab('reset');
    }
  }, [redirected, location.hash]);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      const redirectPath = isOnboardingComplete ? '/dashboard' : '/onboarding';
      navigate(redirectPath, { replace: true });
    }
  }, [user, isOnboardingComplete, navigate]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setError(null);
  };
  
  const tabContent = () => {
    switch (activeTab) {
      case 'reset':
        return <PasswordResetForm error={error} setError={setError} />;
      case 'update-password':
        return <UpdatePasswordForm error={error} setError={setError} />;
      case 'register':
        return <RegisterForm error={error} setError={setError} />;
      case 'login':
      default:
        return <LoginForm error={error} setError={setError} />;
    }
  };
  
  const cardTitle = () => {
    switch (activeTab) {
      case 'reset':
        return "Reset Password";
      case 'update-password':
        return "Set New Password";
      case 'register':
        return "Create an Account";
      case 'login':
      default:
        return "Welcome to Usora";
    }
  };
  
  const cardDescription = () => {
    switch (activeTab) {
      case 'reset':
        return "Enter your email to receive a password reset link";
      case 'update-password':
        return "Create a new password for your account";
      case 'register':
        return "Sign up to build deeper connections";
      case 'login':
      default:
        return "Build deeper connections and grow together";
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-harmony-100">
      <CardHeader className="space-y-2 text-center">
        <div className="flex justify-center mb-2">
          <Heart className="h-10 w-10 text-love-500 animate-pulse-soft" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-800">{cardTitle()}</CardTitle>
        <CardDescription className="text-gray-600">
          {cardDescription()}
        </CardDescription>
      </CardHeader>
      
      {(activeTab === 'login' || activeTab === 'register') && (
        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login" className="text-sm font-medium">Login</TabsTrigger>
            <TabsTrigger value="register" className="text-sm font-medium">Register</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            {tabContent()}
          </TabsContent>
        </Tabs>
      )}
      
      {(activeTab === 'reset' || activeTab === 'update-password') && (
        <div className="w-full">
          {tabContent()}
        </div>
      )}
      
      {(activeTab === 'login' || activeTab === 'register') && (
        <div className="px-6 pb-6 pt-2">
          <SocialLoginButtons setError={setError} />
        </div>
      )}
    </Card>
  );
};

export default AuthForm;
