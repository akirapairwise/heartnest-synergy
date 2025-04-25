export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_recommendations: {
        Row: {
          category: string
          context: string | null
          created_at: string
          id: string
          is_liked: boolean | null
          suggestion: string
          user_id: string
        }
        Insert: {
          category?: string
          context?: string | null
          created_at?: string
          id?: string
          is_liked?: boolean | null
          suggestion: string
          user_id: string
        }
        Update: {
          category?: string
          context?: string | null
          created_at?: string
          id?: string
          is_liked?: boolean | null
          suggestion?: string
          user_id?: string
        }
        Relationships: []
      }
      check_ins: {
        Row: {
          id: string
          mood: string
          reflection: string | null
          satisfaction_rating: number
          timestamp: string
          user_id: string
        }
        Insert: {
          id?: string
          mood: string
          reflection?: string | null
          satisfaction_rating: number
          timestamp?: string
          user_id: string
        }
        Update: {
          id?: string
          mood?: string
          reflection?: string | null
          satisfaction_rating?: number
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      conflicts: {
        Row: {
          ai_reflection: string | null
          ai_resolution_plan: string | null
          ai_summary: string | null
          created_at: string
          id: string
          initiator_id: string
          initiator_statement: string
          resolved_at: string | null
          responder_id: string
          responder_statement: string | null
          topic: string | null
        }
        Insert: {
          ai_reflection?: string | null
          ai_resolution_plan?: string | null
          ai_summary?: string | null
          created_at?: string
          id?: string
          initiator_id: string
          initiator_statement: string
          resolved_at?: string | null
          responder_id: string
          responder_statement?: string | null
          topic?: string | null
        }
        Update: {
          ai_reflection?: string | null
          ai_resolution_plan?: string | null
          ai_summary?: string | null
          created_at?: string
          id?: string
          initiator_id?: string
          initiator_statement?: string
          resolved_at?: string | null
          responder_id?: string
          responder_statement?: string | null
          topic?: string | null
        }
        Relationships: []
      }
      daily_moods: {
        Row: {
          created_at: string
          id: string
          is_visible_to_partner: boolean | null
          mood_date: string
          mood_value: number
          note: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_visible_to_partner?: boolean | null
          mood_date?: string
          mood_value: number
          note?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_visible_to_partner?: boolean | null
          mood_date?: string
          mood_value?: number
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      event_feedback: {
        Row: {
          created_at: string
          event_id: string
          feedback: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at: string
          event_id: string
          feedback: string
          id?: string
          updated_at: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          feedback?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_feedback_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "partner_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_feedback_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "partner_events_with_countdown"
            referencedColumns: ["id"]
          },
        ]
      }
      event_notifications: {
        Row: {
          created_at: string
          event_id: string
          id: string
          is_sent: boolean
          notification_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          is_sent?: boolean
          notification_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          is_sent?: boolean
          notification_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_notifications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "partner_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_notifications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "partner_events_with_countdown"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          category: string | null
          completed_milestones: string[] | null
          created_at: string
          deadline: string | null
          description: string | null
          goal_type: string | null
          id: string
          is_shared: boolean
          milestones: string[] | null
          owner_id: string
          partner_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          completed_milestones?: string[] | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          goal_type?: string | null
          id?: string
          is_shared?: boolean
          milestones?: string[] | null
          owner_id: string
          partner_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          completed_milestones?: string[] | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          goal_type?: string | null
          id?: string
          is_shared?: boolean
          milestones?: string[] | null
          owner_id?: string
          partner_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      partner_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          inviter_id: string
          is_used: boolean
        }
        Insert: {
          code: string
          created_at?: string
          expires_at?: string
          inviter_id: string
          is_used?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          inviter_id?: string
          is_used?: boolean
        }
        Relationships: []
      }
      partner_events: {
        Row: {
          created_at: string
          creator_id: string
          description: string | null
          event_date: string
          id: string
          is_archived: boolean | null
          location: string | null
          shared_with_partner: boolean
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          description?: string | null
          event_date: string
          id?: string
          is_archived?: boolean | null
          location?: string | null
          shared_with_partner?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          description?: string | null
          event_date?: string
          id?: string
          is_archived?: boolean | null
          location?: string | null
          shared_with_partner?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      partner_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: string
          invitation_code: string
          recipient_email: string
          sender_id: string
          status: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invitation_code: string
          recipient_email: string
          sender_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invitation_code?: string
          recipient_email?: string
          sender_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      partner_invites: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          inviter_id: string
          is_accepted: boolean
          token: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          inviter_id: string
          is_accepted?: boolean
          token: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          inviter_id?: string
          is_accepted?: boolean
          token?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          partner_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          partner_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          partner_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      relationships: {
        Row: {
          connected_at: string | null
          id: string
          status: string | null
          user_id_1: string
          user_id_2: string
        }
        Insert: {
          connected_at?: string | null
          id?: string
          status?: string | null
          user_id_1: string
          user_id_2: string
        }
        Update: {
          connected_at?: string | null
          id?: string
          status?: string | null
          user_id_1?: string
          user_id_2?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          areas_to_improve: string[] | null
          avatar_url: string | null
          bio: string | null
          communication_style: string | null
          conflict_resolution_style: string | null
          created_at: string
          emotional_needs: string | null
          financial_attitude: string | null
          full_name: string | null
          id: string
          interaction_frequency: string | null
          is_onboarding_complete: boolean
          living_together: string | null
          location: string | null
          love_language: string | null
          love_language_preference: string | null
          mood_settings: Json | null
          nickname: string | null
          partner_id: string | null
          preferred_communication: string | null
          profile_complete_stage: string | null
          pronouns: string | null
          relationship_goals: string | null
          relationship_start_date: string | null
          relationship_status: string | null
          shared_goals: string[] | null
          updated_at: string
        }
        Insert: {
          areas_to_improve?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          communication_style?: string | null
          conflict_resolution_style?: string | null
          created_at?: string
          emotional_needs?: string | null
          financial_attitude?: string | null
          full_name?: string | null
          id: string
          interaction_frequency?: string | null
          is_onboarding_complete?: boolean
          living_together?: string | null
          location?: string | null
          love_language?: string | null
          love_language_preference?: string | null
          mood_settings?: Json | null
          nickname?: string | null
          partner_id?: string | null
          preferred_communication?: string | null
          profile_complete_stage?: string | null
          pronouns?: string | null
          relationship_goals?: string | null
          relationship_start_date?: string | null
          relationship_status?: string | null
          shared_goals?: string[] | null
          updated_at?: string
        }
        Update: {
          areas_to_improve?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          communication_style?: string | null
          conflict_resolution_style?: string | null
          created_at?: string
          emotional_needs?: string | null
          financial_attitude?: string | null
          full_name?: string | null
          id?: string
          interaction_frequency?: string | null
          is_onboarding_complete?: boolean
          living_together?: string | null
          location?: string | null
          love_language?: string | null
          love_language_preference?: string | null
          mood_settings?: Json | null
          nickname?: string | null
          partner_id?: string | null
          preferred_communication?: string | null
          profile_complete_stage?: string | null
          pronouns?: string | null
          relationship_goals?: string | null
          relationship_start_date?: string | null
          relationship_status?: string | null
          shared_goals?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      weekly_check_ins: {
        Row: {
          checkin_date: string | null
          communication_rating: number | null
          connection_level: number | null
          created_at: string | null
          id: string
          is_visible_to_partner: boolean | null
          mood: string | null
          reflection_note: string | null
          user_id: string | null
        }
        Insert: {
          checkin_date?: string | null
          communication_rating?: number | null
          connection_level?: number | null
          created_at?: string | null
          id?: string
          is_visible_to_partner?: boolean | null
          mood?: string | null
          reflection_note?: string | null
          user_id?: string | null
        }
        Update: {
          checkin_date?: string | null
          communication_rating?: number | null
          connection_level?: number | null
          created_at?: string | null
          id?: string
          is_visible_to_partner?: boolean | null
          mood?: string | null
          reflection_note?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      partner_events_with_countdown: {
        Row: {
          created_at: string | null
          creator_id: string | null
          days_to_event: number | null
          description: string | null
          event_date: string | null
          id: string | null
          is_archived: boolean | null
          location: string | null
          shared_with_partner: boolean | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id?: string | null
          days_to_event?: never
          description?: string | null
          event_date?: string | null
          id?: string | null
          is_archived?: boolean | null
          location?: string | null
          shared_with_partner?: boolean | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string | null
          days_to_event?: never
          description?: string | null
          event_date?: string | null
          id?: string | null
          is_archived?: boolean | null
          location?: string | null
          shared_with_partner?: boolean | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      partner_links: {
        Row: {
          partner_id: string | null
          user_id: string | null
        }
        Insert: {
          partner_id?: string | null
          user_id?: string | null
        }
        Update: {
          partner_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      connect_partners_with_code: {
        Args: { invite_code: string; current_user_id: string }
        Returns: string
      }
      connect_users_by_code: {
        Args: { current_user_id: string; entered_code: string }
        Returns: string
      }
      generate_invitation_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_partner_code: {
        Args: { length?: number }
        Returns: string
      }
      get_partner_profile: {
        Args: { user_id: string }
        Returns: {
          areas_to_improve: string[] | null
          avatar_url: string | null
          bio: string | null
          communication_style: string | null
          conflict_resolution_style: string | null
          created_at: string
          emotional_needs: string | null
          financial_attitude: string | null
          full_name: string | null
          id: string
          interaction_frequency: string | null
          is_onboarding_complete: boolean
          living_together: string | null
          location: string | null
          love_language: string | null
          love_language_preference: string | null
          mood_settings: Json | null
          nickname: string | null
          partner_id: string | null
          preferred_communication: string | null
          profile_complete_stage: string | null
          pronouns: string | null
          relationship_goals: string | null
          relationship_start_date: string | null
          relationship_status: string | null
          shared_goals: string[] | null
          updated_at: string
        }[]
      }
      get_profile_by_user_id: {
        Args: { user_id: string }
        Returns: {
          areas_to_improve: string[] | null
          avatar_url: string | null
          bio: string | null
          communication_style: string | null
          conflict_resolution_style: string | null
          created_at: string
          emotional_needs: string | null
          financial_attitude: string | null
          full_name: string | null
          id: string
          interaction_frequency: string | null
          is_onboarding_complete: boolean
          living_together: string | null
          location: string | null
          love_language: string | null
          love_language_preference: string | null
          mood_settings: Json | null
          nickname: string | null
          partner_id: string | null
          preferred_communication: string | null
          profile_complete_stage: string | null
          pronouns: string | null
          relationship_goals: string | null
          relationship_start_date: string | null
          relationship_status: string | null
          shared_goals: string[] | null
          updated_at: string
        }[]
      }
      link_partners: {
        Args: { user_id_1: string; user_id_2: string }
        Returns: undefined
      }
      unlink_partners: {
        Args: { user_id_1: string; user_id_2: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
