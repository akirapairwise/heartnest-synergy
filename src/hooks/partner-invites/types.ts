
export interface PartnerInvite {
  id: string;
  inviter_id: string;
  token: string;
  is_accepted: boolean;
  expires_at: string;
  created_at: string;
}

export interface InviteResult {
  success: boolean;
  error?: Error | null;
  invite?: PartnerInvite | null;
}
