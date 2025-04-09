
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Heart } from "lucide-react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AuthForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, user, isOnboardingComplete } = useAuth();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      const redirectPath = isOnboardingComplete ? '/dashboard' : '/onboarding';
      navigate(redirectPath, { replace: true });
    }
  }, [user, isOnboardingComplete, navigate]);

  const validateForm = (type: 'login' | 'register') => {
    setError(null);
    
    if (!email || !password) {
      setError('Email and password are required');
      return false;
    }
    
    if (type === 'register') {
      if (!fullName) {
        setError('Full name is required');
        return false;
      }
      
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
    }
    
    return true;
  };
  
  const handleAuth = async (e: React.FormEvent<HTMLFormElement>, type: 'login' | 'register') => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    if (!validateForm(type)) {
      setIsLoading(false);
      return;
    }
    
    try {
      if (type === 'login') {
        const { error } = await signIn(email, password);
        
        if (error) {
          setError(error.message);
        } else {
          toast({
            title: "Welcome back!",
            description: "You've successfully logged in to HeartNest.",
          });
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        
        if (error) {
          setError(error.message);
        } else {
          toast({
            title: "Account created successfully!",
            description: "Your account has been created. Let's set up your profile!",
          });
          navigate('/onboarding');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-2 text-center">
        <div className="flex justify-center mb-2">
          <Heart className="h-10 w-10 text-love-500 animate-pulse-soft" />
        </div>
        <CardTitle className="text-2xl font-bold">Welcome to HeartNest</CardTitle>
        <CardDescription>
          Build deeper connections and grow together
        </CardDescription>
      </CardHeader>
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <form onSubmit={(e) => handleAuth(e, 'login')}>
            <CardContent className="space-y-4 pt-4">
              {error && (
                <div className="p-3 text-sm rounded-md bg-destructive/10 text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button variant="link" size="sm" className="px-0 text-xs text-harmony-600">
                    Forgot password?
                  </Button>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full btn-primary-gradient" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
        <TabsContent value="register">
          <form onSubmit={(e) => handleAuth(e, 'register')}>
            <CardContent className="space-y-4 pt-4">
              {error && (
                <div className="p-3 text-sm rounded-md bg-destructive/10 text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="reg-name">Full Name</Label>
                <Input 
                  id="reg-name" 
                  placeholder="Your name" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input 
                  id="reg-email" 
                  type="email" 
                  placeholder="your@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <Input 
                  id="reg-password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full btn-primary-gradient" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default AuthForm;
