
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
    
    // Check if the profile exists and initialize if needed
    const checkAndInitializeProfile = async () => {
      try {
        console.log('Checking if profile exists for user:', user.id);
        
        // First check if we can access the profile in user_profiles
        // Use maybeSingle to avoid errors if the profile doesn't exist
        const { data: existingProfile, error } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();
          
        if (error) {
          console.error('Error checking profile existence:', error);
          onError('There was an issue accessing your profile. Please try again later.');
          return;
        }
        
        if (!existingProfile) {
          console.log('Profile not found, attempting to create one');
          
          // Create a basic profile with minimal required fields
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              id: user.id,
              is_onboarding_complete: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (insertError) {
            // Check if it's a duplicate key error (profile might have been created by the trigger)
            if (insertError.code === '23505') {
              console.log('Profile already exists (created by trigger), fetching it instead');
              
              // Try to fetch the profile that was created by the trigger
              if (fetchUserProfile) {
                await fetchUserProfile(user.id);
              }
            } else {
              console.error('Error creating profile:', insertError);
              onError('Unable to set up your profile. Please try again later.');
            }
          } else {
            console.log('Profile created successfully');
            
            // Refresh the profile in the auth context
            if (fetchUserProfile) {
              await fetchUserProfile(user.id);
              console.log('Profile refreshed in auth context');
            }
          }
        } else {
          console.log('Profile found in user_profiles table:', existingProfile.id);
          
          // If profile already has a partner, navigate to dashboard
          if (profile?.partner_id) {
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
    
    checkAndInitializeProfile();
  }, [user?.id, isLoading, fetchUserProfile, navigate, onError, profile?.partner_id]);
  
  return null;
};

export default ProfileChecker;
