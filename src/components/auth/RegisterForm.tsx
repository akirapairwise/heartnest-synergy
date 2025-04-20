import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

interface RegisterFormProps {
  setError: (error: string | null) => void;
  error: string | null;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ setError, error }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  
  const { toast: useToastHook } = useToast();
  const { signUp } = useAuth();
  const navigate = useNavigate();
  
  const validateForm = () => {
    setError(null);
    
    if (!email || !password) {
      setError('Email and password are required');
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
    
    return true;
  };
  
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }
    
    try {
      const { error: signUpError } = await signUp(email, password);
      
      if (signUpError) {
        setError(signUpError.message);
        useToastHook({
          variant: "destructive",
          description: signUpError.message
        });
      } else {
        setRegistrationComplete(true);
        useToastHook({
          description: "Your account has been created. Let's set up your profile!",
        });
        
        // Navigate to onboarding after a short delay
        setTimeout(() => {
          console.log("Redirecting to onboarding after registration");
          navigate('/onboarding', { replace: true });
        }, 1500);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError('An unexpected error occurred. Please try again.');
      useToastHook({
        variant: "destructive",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  return (
    <form onSubmit={handleRegister}>
      <CardContent className="space-y-4 pt-4">
        {error && (
          <div className="p-3 text-sm rounded-md bg-destructive/10 text-destructive">
            {error}
          </div>
        )}
        
        {registrationComplete ? (
          <div className="p-4 text-sm rounded-md bg-green-100 text-green-800 text-center">
            <p className="font-medium">Registration successful!</p>
            <p className="mt-1">Redirecting you to set up your profile...</p>
            <Loader2 className="animate-spin h-5 w-5 mx-auto mt-2 text-green-600" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="reg-email" className="text-gray-700">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input 
                  id="reg-email" 
                  type="email" 
                  placeholder="your@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 focus:border-harmony-500 focus:ring-harmony-200"
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password" className="text-gray-700">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input 
                  id="reg-password" 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 focus:border-harmony-500 focus:ring-harmony-200"
                  required 
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-gray-700">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input 
                  id="confirm-password" 
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 focus:border-harmony-500 focus:ring-harmony-200"
                  required 
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        {!registrationComplete && (
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-love-500 to-harmony-500 hover:from-love-600 hover:to-harmony-600 text-white shadow-md hover:shadow-lg transition-all"
            disabled={isLoading || registrationComplete}
          >
            {isLoading ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...
              </span>
            ) : "Create Account"}
          </Button>
        )}
      </CardFooter>
    </form>
  );
};

export default RegisterForm;
