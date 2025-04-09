
import { User } from '@supabase/supabase-js';

export interface PartnerInvite {
  id: string;
  inviter_id: string;
  token: string;
  is_accepted: boolean;
  created_at: string;
  expires_at: string;
  inviter_name?: string; // Optional field for frontend display
}

export interface InvitationResult {
  data: PartnerInvite | null;
  error: any;
}

export interface InvitationsResult {
  data: PartnerInvite[] | null;
  error: any;
}

export interface OperationResult {
  error: any;
}
