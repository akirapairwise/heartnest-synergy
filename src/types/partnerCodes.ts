
export interface PartnerCode {
  code: string;
  inviter_id: string;
  is_used: boolean;
  created_at: string;
  expires_at: string;
}

export interface PartnerCodeInsert {
  code: string;
  inviter_id: string;
  is_used?: boolean;
}

export interface PartnerCodeUpdate {
  code?: string;
  inviter_id?: string;
  is_used?: boolean;
}
