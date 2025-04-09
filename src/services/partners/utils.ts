
import { supabase } from "@/integrations/supabase/client";
import { PartnerInvite } from "./types";

// Calculate expiration date (7 days from now)
export const calculateExpirationDate = (): string => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  return expiresAt.toISOString();
};

// Generate a random token
export const generateToken = (): string => {
  return crypto.randomUUID().replace(/-/g, '').substring(0, 12);
};

// Get inviter's name to enhance partner invite display
export const getInviterName = async (inviterId: string): Promise<string | undefined> => {
  try {
    const { data: inviterProfile, error } = await supabase
      .from('user_profiles')
      .select('full_name')
      .eq('id', inviterId)
      .single();
      
    if (error || !inviterProfile) return undefined;
    return inviterProfile.full_name;
  } catch (error) {
    console.error('Error fetching inviter name:', error);
    return undefined;
  }
};

// Enhance invite with inviter name
export const enhanceInviteWithInviterName = async (invite: PartnerInvite): Promise<PartnerInvite> => {
  const inviterName = await getInviterName(invite.inviter_id);
  if (inviterName) {
    return { ...invite, inviter_name: inviterName };
  }
  return invite;
};
