
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Mail } from "lucide-react";
import { resetPassword } from '@/services/authService';

interface PasswordResetFormProps {
  setError: (error: string | null) => void;
  error: string | null;
}

const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ setError, error }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const validateForm = () => {
    setError(null);
    
    if (!email) {
      setError('Email is required');
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
      const { error: resetError } = await resetPassword(email);
      
      if (!resetError) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
            <p className="font-medium">Password reset email sent!</p>
            <p className="mt-1">Please check your email for the reset link.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="reset-email" className="text-gray-700">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input 
                id="reset-email" 
                type="email" 
                placeholder="your@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 focus:border-harmony-500 focus:ring-harmony-200"
                required 
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              We'll send a password reset link to this email address.
            </p>
          </div>
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
              </span>
            ) : "Send Reset Link"}
          </Button>
        )}
        
        {isSubmitted && (
          <Button 
            type="button"
            onClick={() => setIsSubmitted(false)}
            variant="outline" 
            className="w-full"
          >
            Try Again
          </Button>
        )}
      </CardFooter>
    </form>
  );
};

export default PasswordResetForm;
