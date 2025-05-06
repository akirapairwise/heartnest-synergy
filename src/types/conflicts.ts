
export type Conflict = {
  id: string;
  initiator_id: string;
  responder_id: string;
  topic: string;
  initiator_statement: string;
  responder_statement: string | null;
  ai_summary: string | null;
  ai_reflection: string | null;
  ai_resolution_plan: string | null;
  resolved_at: string | null;
  created_at: string;
  // Local property for archiving in UI (not persisted)
  archived?: boolean;
};

export type ConflictStatus = 'pending_response' | 'pending_ai' | 'resolved' | 'active';

export type ConflictFormData = {
  topic: string;
  description: string;
  partner_id: string;
};

// Properly define the AIResolutionPlan type for JSON structure
export type AIResolutionPlan = {
  summary: string;
  resolution_tips: string;
  empathy_prompts: {
    partner_a?: string; // Initiator's empathy message
    partner_b?: string; // Responder's empathy message
  };
};
