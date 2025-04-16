
import { supabase } from "@/integrations/supabase/client";
import { OperationResult } from "../types";

/**
 * Unlinks two partners and updates related resources
 * Ensures both partners are disconnected from each other
 */
export const unlinkPartner = async (userId: string, partnerId: string | null): Promise<OperationResult> => {
  if (!partnerId) {
    return { error: null }; // Nothing to unlink
  }
  
  try {
    console.log('Starting partner unlinking process...');
    console.log('User ID:', userId);
    console.log('Partner ID:', partnerId);
    
    // Begin a transaction for consistent updates
    // First, update shared resources
    
    // 1. Update shared goals to no longer be shared
    const { error: updateGoalsError } = await supabase
      .from('goals')
      .update({ 
        is_shared: false,
        partner_id: null 
      })
      .eq('owner_id', userId)
      .eq('partner_id', partnerId);
      
    if (updateGoalsError) {
      console.error('Error updating goals:', updateGoalsError);
      // Non-critical error, continue with the unlinking
    }
    
    // 2. Also update goals where the current user is the partner
    const { error: updatePartnerGoalsError } = await supabase
      .from('goals')
      .update({ 
        is_shared: false,
        partner_id: null 
      })
      .eq('owner_id', partnerId)
      .eq('partner_id', userId);
      
    if (updatePartnerGoalsError) {
      console.error('Error updating partner goals:', updatePartnerGoalsError);
      // Non-critical error, continue
    }
    
    // Critical: Get both profiles to check their current connection status
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, partner_id')
      .in('id', [userId, partnerId]);
      
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return { error: new Error('Could not verify connection status') };
    }
    
    // Find the current user and partner profiles
    const currentUserProfile = profiles?.find(p => p.id === userId);
    const partnerProfile = profiles?.find(p => p.id === partnerId);
    
    // Verify that the partnership is valid before proceeding
    if (!currentUserProfile || !partnerProfile) {
      console.error('Could not find one or both profiles');
      return { error: new Error('Could not find one or both profiles') };
    }
    
    // Verify the connection is still valid (both users are connected to each other)
    if (currentUserProfile.partner_id !== partnerId) {
      console.log('Current user is no longer connected to this partner');
      // If current user is already disconnected, just update partner if needed
      if (partnerProfile.partner_id === userId) {
        // Partner still thinks they're connected, update their profile
        const { error: unlinkPartnerError } = await supabase
          .from('user_profiles')
          .update({ partner_id: null })
          .eq('id', partnerId);
          
        if (unlinkPartnerError) {
          console.error('Error unlinking partner only:', unlinkPartnerError);
          return { error: new Error('Failed to update partner connection status') };
        }
      }
      return { error: null }; // Current user already disconnected
    }
    
    if (partnerProfile.partner_id !== userId) {
      console.log('Partner is no longer connected to this user');
      // If partner is already disconnected, just update current user
      const { error: unlinkUserError } = await supabase
        .from('user_profiles')
        .update({ partner_id: null })
        .eq('id', userId);
        
      if (unlinkUserError) {
        console.error('Error unlinking user only:', unlinkUserError);
        return { error: new Error('Failed to update your connection status') };
      }
      return { error: null }; // Partner already disconnected
    }
    
    // 3. Unlink the current user - critical: only update current user's own record
    const { error: unlinkUserError } = await supabase
      .from('user_profiles')
      .update({ partner_id: null })
      .eq('id', userId);
      
    if (unlinkUserError) {
      console.error('Error unlinking user:', unlinkUserError);
      throw unlinkUserError;
    }
    
    // 4. Unlink the partner - critical: only update partner's own record
    const { error: unlinkPartnerError } = await supabase
      .from('user_profiles')
      .update({ partner_id: null })
      .eq('id', partnerId);
      
    if (unlinkPartnerError) {
      console.error('Error unlinking partner:', unlinkPartnerError);
      throw unlinkPartnerError;
    }
    
    console.log('Partner connection successfully broken');
    
    return { error: null };
  } catch (error) {
    console.error('Error unlinking partner:', error);
    return { error };
  }
};
