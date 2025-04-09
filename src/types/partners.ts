
export type PartnerInvitation = {
  id: string;
  sender_id: string;
  recipient_email: string;
  invitation_code: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  accepted_at: string | null;
};
