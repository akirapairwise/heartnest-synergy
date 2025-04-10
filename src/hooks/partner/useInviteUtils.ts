
import { PartnerInvite } from '@/services/partners';
import { toast } from 'sonner';

/**
 * Generates the full invitation URL from a token
 */
export const generateInviteUrl = (token: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/invite?token=${token}`;
};

/**
 * Calculates the expiration text for an invitation
 */
export const getInviteExpirationText = (invite: PartnerInvite | null): string | null => {
  if (!invite?.expires_at) return null;
  
  const expiresAt = new Date(invite.expires_at);
  const now = new Date();
  const diffTime = Math.abs(expiresAt.getTime() - now.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays === 1 ? '1 day' : `${diffDays} days`;
};

/**
 * Handles error toast display with appropriate message
 */
export const displayErrorToast = (error: any, defaultMessage: string): void => {
  const errorMessage = error?.message || defaultMessage;
  toast.error(errorMessage);
  console.error(defaultMessage, error);
};
