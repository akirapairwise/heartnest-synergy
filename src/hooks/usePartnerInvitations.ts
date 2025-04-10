
import { usePartnerInvite } from './partner-invites/usePartnerInvite';
export type { PartnerInvite } from './partner-invites/types';

// This is just a compatibility wrapper to avoid breaking changes
// New code should use usePartnerInvite directly
export const usePartnerInvitations = usePartnerInvite;

export default usePartnerInvitations;
