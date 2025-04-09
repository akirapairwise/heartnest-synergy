
export interface PartnerInvitation {
  id: string;
  sender_id: string;
  recipient_email: string;
  status: 'pending' | 'accepted' | 'rejected';
  invitation_code: string;
  created_at: string;
  updated_at: string;
  accepted_at?: string;
}
