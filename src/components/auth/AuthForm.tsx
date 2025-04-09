
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart } from "lucide-react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthForm = () => {
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isOnboardingComplete } = useAuth();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      const redirectPath = isOnboardingComplete ? '/dashboard' : '/onboarding';
      navigate(redirectPath, { replace: true });
    }
  }, [user, isOnboardingComplete, navigate]);
  
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-harmony-100">
      <CardHeader className="space-y-2 text-center">
        <div className="flex justify-center mb-2">
          <Heart className="h-10 w-10 text-love-500 animate-pulse-soft" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-800">Welcome to HeartNest</CardTitle>
        <CardDescription className="text-gray-600">
          Build deeper connections and grow together
        </CardDescription>
      </CardHeader>
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="login" className="text-sm font-medium">Login</TabsTrigger>
          <TabsTrigger value="register" className="text-sm font-medium">Register</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <LoginForm error={error} setError={setError} />
        </TabsContent>
        <TabsContent value="register">
          <RegisterForm error={error} setError={setError} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default AuthForm;
