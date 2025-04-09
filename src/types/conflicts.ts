
export type Conflict = {
  id: string;
  initiator_id: string;
  responder_id: string;
  initiator_statement: string;
  responder_statement: string | null;
  ai_summary: string | null;
  ai_reflection: string | null;
  ai_resolution_plan: string | null;
  resolved_at: string | null;
  created_at: string;
};

export type ConflictStatus = 'pending_response' | 'pending_ai' | 'resolved' | 'active';

export type ConflictFormData = {
  topic: string;
  description: string;
  partner_id: string;
};
