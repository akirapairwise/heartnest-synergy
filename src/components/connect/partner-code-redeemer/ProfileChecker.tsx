
import { useEffect, useRef, useState } from 'react';
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
  const [isInitializing, setIsInitializing] = useState(false);
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
        setIsInitializing(true);
        
        // Use a simple query with no JOINs or subqueries to avoid recursion
        // Just get the user's own profile directly by ID
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('id, is_onboarding_complete, partner_id')
          .eq('id', user.id)
          .maybeSingle();
          
        if (profileError) {
          console.error('Error checking profile existence:', profileError);
          
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
            console.error('Error creating profile:', insertError);
            
            // Special handling for duplicate key errors (profile already exists)
            if (insertError.code === '23505') {
              console.log('Profile already exists (created by trigger), fetching it instead');
              
              // Refresh the profile in the auth context
              if (fetchUserProfile) {
                await fetchUserProfile(user.id);
              }
            } else {
              onError('Unable to set up your profile. Please try again later.');
              return;
            }
          } else {
            console.log('Profile created successfully');
            
            // Refresh the profile in the auth context
            if (fetchUserProfile) {
              await fetchUserProfile(user.id);
            }
          }
        } else if (profileData) {
          console.log('Profile found:', profileData.id);
          
          // If profile already has a partner, navigate to dashboard
          if (profileData.partner_id) {
            console.log('User already has a partner connected, redirecting to dashboard');
            toast.info('You already have a partner connected');
            navigate('/dashboard');
          }
        } else {
          console.log('No profile found, but no error. Attempting to create one.');
          
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
            console.error('Error creating profile:', insertError);
            onError('Unable to set up your profile. Please try again later.');
            return;
          }
          
          // Refresh the profile in the auth context
          if (fetchUserProfile) {
            await fetchUserProfile(user.id);
          }
        }
      } catch (err) {
        console.error('Unexpected error checking profile:', err);
        onError('An unexpected error occurred. Please try again later.');
      } finally {
        setIsInitializing(false);
      }
    };
    
    checkAndInitializeProfile();
  }, [user?.id, isLoading, fetchUserProfile, navigate, onError, profile?.partner_id]);
  
  return null;
};

export default ProfileChecker;
