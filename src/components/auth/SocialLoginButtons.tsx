
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface SocialLoginButtonsProps {
  setError: (error: string | null) => void;
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ setError }) => {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        console.error('Google sign in error:', error);
        setError(error.message);
        toast.error('Failed to sign in with Google', {
          description: error.message
        });
      }
    } catch (error: any) {
      console.error('Unexpected error during Google sign in:', error);
      setError('An unexpected error occurred. Please try again.');
      toast.error('Failed to sign in with Google', {
        description: 'An unexpected error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      <Button 
        variant="outline" 
        type="button" 
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2"
        onClick={handleGoogleSignIn}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12.545 12.151c0 .988-.747 1.641-1.699 1.641c-.946 0-1.693-.653-1.693-1.641c0-.998.747-1.641 1.693-1.641c.952 0 1.699.643 1.699 1.641m3.766 0c0 .988-.747 1.641-1.699 1.641c-.946 0-1.693-.653-1.693-1.641c0-.998.747-1.641 1.693-1.641c.952 0 1.699.643 1.699 1.641m3.766 0c0 .988-.747 1.641-1.699 1.641c-.946 0-1.693-.653-1.693-1.641c0-.998.747-1.641 1.693-1.641c.952 0 1.699.643 1.699 1.641" />
          </svg>
        )}
        {isLoading ? "Signing in..." : "Continue with Google"}
      </Button>
    </div>
  );
};

export default SocialLoginButtons;
