
import { useEffect, useRef } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

type ProfileCheckerProps = {
  onError: (error: string) => void;
}

/**
 * Component that checks if the user profile exists and handles profile initialization
 */
const ProfileChecker = ({ onError }: ProfileCheckerProps) => {
  const { user, isLoading, fetchUserProfile, profile } = useAuth();
  const initialized = useRef(false);
  const navigate = useNavigate();
  
  // Only handle profile loading if auth is ready
  useEffect(() => {
    if (isLoading || !user?.id || initialized.current) {
      return;
    }
    
    // Set the initialization flag to prevent multiple fetches
    initialized.current = true;
    
    // Check if the profile exists in the database directly
    const checkProfile = async () => {
      try {
        console.log('Checking if profile exists for user:', user.id);
        
        // First check if we can access the profile in user_profiles
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, partner_id')
          .eq('id', user.id)
          .maybeSingle();
          
        if (error) {
          console.error('Error checking profile in user_profiles:', error);
          onError('There was an issue accessing your profile. Please try again later.');
          return;
        }
        
        if (!data) {
          console.log('Profile not found in user_profiles table, will attempt to create one');
          
          // Explicitly try to create profile via AuthContext
          if (fetchUserProfile) {
            try {
              await fetchUserProfile(user.id);
              console.log('Profile created via fetchUserProfile');
            } catch (err) {
              console.error('Error creating profile via fetchUserProfile:', err);
              onError('Unable to set up your profile. Please try again later.');
            }
          }
        } else {
          console.log('Profile found in user_profiles table:', data);
          
          // If profile already has a partner, navigate to dashboard
          if (data.partner_id) {
            console.log('User already has a partner connected, redirecting to dashboard');
            toast.info('You already have a partner connected');
            navigate('/dashboard');
          }
        }
      } catch (err) {
        console.error('Unexpected error checking profile:', err);
        onError('An unexpected error occurred. Please try again later.');
      }
    };
    
    checkProfile();
  }, [user?.id, isLoading, fetchUserProfile, navigate, onError]);
  
  return null;
};

export default ProfileChecker;
