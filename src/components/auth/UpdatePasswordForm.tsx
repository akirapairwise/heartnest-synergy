
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { updatePassword } from '@/services/authService';
import { useNavigate } from 'react-router-dom';

interface UpdatePasswordFormProps {
  setError: (error: string | null) => void;
  error: string | null;
}

const UpdatePasswordForm: React.FC<UpdatePasswordFormProps> = ({ setError, error }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const navigate = useNavigate();
  
  const validateForm = () => {
    setError(null);
    
    if (!password || !confirmPassword) {
      setError('Both fields are required');
      return false;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }
    
    try {
      const { error: updateError } = await updatePassword(password);
      
      if (!updateError) {
        setIsSubmitted(true);
        
        // Redirect to dashboard after success
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setError('An unexpected error occurred. Please try again.');
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
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4 pt-4">
        {error && (
          <div className="p-3 text-sm rounded-md bg-destructive/10 text-destructive">
            {error}
          </div>
        )}
        
        {isSubmitted ? (
          <div className="p-4 text-sm rounded-md bg-green-100 text-green-800 text-center">
            <p className="font-medium">Password updated successfully!</p>
            <p className="mt-1">You will be redirected to the dashboard.</p>
            <Loader2 className="animate-spin h-5 w-5 mx-auto mt-2 text-green-600" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-gray-700">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input 
                  id="new-password" 
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
              <Label htmlFor="confirm-password" className="text-gray-700">Confirm New Password</Label>
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
        {!isSubmitted && (
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-love-500 to-harmony-500 hover:from-love-600 hover:to-harmony-600 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
              </span>
            ) : "Update Password"}
          </Button>
        )}
      </CardFooter>
    </form>
  );
};

export default UpdatePasswordForm;
