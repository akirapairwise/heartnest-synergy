
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Mail } from "lucide-react";
import { resetPassword } from '@/services/authService';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';

interface PasswordResetFormProps {
  setError: (error: string | null) => void;
  error: string | null;
}

const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ setError, error }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  
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
      
      if (resetError) {
        console.error('Password reset error:', resetError);
        toast.error('Password reset failed', {
          description: resetError.message || 'Please try again'
        });
        setError(resetError.message || 'Password reset failed. Please try again.');
      } else {
        setIsSubmitted(true);
        toast.success('Reset link sent', {
          description: 'Please check your email for the password reset link'
        });
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      
      // If there was an error, we might want to retry once
      if (retryCount === 0) {
        setRetryCount(1);
        setTimeout(() => {
          handleRetry();
        }, 1000);
      } else {
        setError('An unexpected error occurred. Please try again later.');
        toast.error('Password reset failed', {
          description: 'An unexpected error occurred. Please try again later.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRetry = async () => {
    setIsLoading(true);
    
    try {
      const { error: resetError } = await resetPassword(email);
      
      if (resetError) {
        toast.error('Password reset failed', {
          description: resetError.message || 'Please try again'
        });
        setError(resetError.message || 'Password reset failed. Please try again.');
      } else {
        setIsSubmitted(true);
        toast.success('Reset link sent', {
          description: 'Please check your email for the password reset link'
        });
      }
    } catch (error) {
      console.error('Error on retry:', error);
      setError('Password reset service is currently unavailable. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBackToLogin = () => {
    navigate('/auth');
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4 pt-4">
        {error && (
          <Alert variant="destructive" className="text-sm">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isSubmitted ? (
          <div className="p-4 text-sm rounded-md bg-green-50 border border-green-100 text-green-800 text-center">
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
      <CardFooter className={isSubmitted ? "flex justify-between" : ""}>
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
          <>
            <Button 
              type="button"
              onClick={handleBackToLogin}
              variant="outline" 
              className="flex-1 mr-2"
            >
              Back to Login
            </Button>
            <Button 
              type="button"
              onClick={() => setIsSubmitted(false)}
              variant="secondary" 
              className="flex-1"
            >
              Try Again
            </Button>
          </>
        )}
      </CardFooter>
    </form>
  );
};

export default PasswordResetForm;
