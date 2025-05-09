
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { OnboardingFormData } from '@/types/onboarding';

export const useProfileCompletion = (setIsLoading: (value: boolean) => void, formData: OnboardingFormData) => {
  const { toast: useToastHook } = useToast();
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  
  // Complete with both basic and personalization data
  const handleComplete = async (e: React.FormEvent) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setIsLoading(true);
    
    try {
      // Verify user is authenticated before proceeding
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        toast.error("Authentication error", {
          description: "You must be logged in to complete your profile.",
          duration: 3000
        });
        navigate('/auth', { replace: true });
        return;
      }
      
      // Collect all relevant profile data from the form
      const profileData = {
        full_name: formData.full_name || null,
        location: formData.location || null,
        bio: formData.bio || null,
        love_language: formData.love_language || null,
        communication_style: formData.communication_style || null,
        emotional_needs: formData.emotional_needs || null,
        relationship_goals: formData.relationship_goals || null,
        financial_attitude: formData.financial_attitude || null,
        // New relationship fields
        pronouns: formData.pronouns || null,
        relationship_status: formData.relationship_status || null,
        relationship_start_date: formData.relationship_start_date || null,
        living_together: formData.living_together || null,
        interaction_frequency: formData.interaction_frequency || null,
        preferred_communication: formData.preferred_communication || null,
        areas_to_improve: formData.areas_to_improve || null,
        // Optional personalization
        love_language_preference: formData.love_language_preference || null,
        conflict_resolution_style: formData.conflict_resolution_style || null,
        shared_goals: formData.shared_goals || null,
        // Mark complete stage - fix the type here
        profile_complete_stage: 'complete' as 'complete',
        // Explicitly set the onboarding flag to true
        is_onboarding_complete: true
      };
      
      console.log("Completing onboarding with full personalization", profileData);
      
      // Update the profile with all collected data
      const updateResult = await updateProfile(profileData);
      
      if (updateResult?.error) {
        throw new Error(updateResult.error.message || "Failed to update profile");
      }
      
      // Show success toast with longer duration
      toast.success("Profile completed!", {
        description: "Your profile has been set up. Redirecting to settings page for further personalization...",
        duration: 3000
      });
      
      // Navigate to profile settings
      navigate('/profile/settings', { replace: true });
    } catch (error) {
      console.error('Error updating profile:', error);
      useToastHook({
        title: "Error",
        description: error instanceof Error ? error.message : "There was a problem saving your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Complete with just basic data
  const handleCompleteBasic = async () => {
    setIsLoading(true);
    
    try {
      // Verify user is authenticated before proceeding
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        toast.error("Authentication error", {
          description: "You must be logged in to complete your profile.",
          duration: 3000
        });
        navigate('/auth', { replace: true });
        return;
      }
      
      console.log("Completing onboarding with basic information only");
      
      // Collect basic profile data
      const profileData = {
        full_name: formData.full_name || null,
        pronouns: formData.pronouns || null,
        relationship_status: formData.relationship_status || null,
        relationship_start_date: formData.relationship_start_date || null,
        living_together: formData.living_together || null,
        interaction_frequency: formData.interaction_frequency || null,
        preferred_communication: formData.preferred_communication || null,
        areas_to_improve: formData.areas_to_improve || null,
        // Mark complete stage - fix the type here
        profile_complete_stage: 'basic' as 'basic',
        // Explicitly set the onboarding flag to true
        is_onboarding_complete: true
      };
      
      // Update the profile with basic data
      const updateResult = await updateProfile(profileData);
      
      if (updateResult?.error) {
        throw new Error(updateResult.error.message || "Failed to update profile");
      }
      
      // Show success toast with longer duration
      toast.success("Profile basics completed!", {
        description: "Your profile has been set up. Redirecting to dashboard.",
        duration: 3000
      });
      
      // Navigate to dashboard
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error("Error", {
        description: error instanceof Error ? error.message : "There was a problem saving your profile. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    handleComplete,
    handleCompleteBasic
  };
};
