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
        }
        Relationships: []
      }
      goals: {
        Row: {
          category: string | null
          created_at: string
          deadline: string | null
          description: string | null
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
          created_at?: string
          deadline?: string | null
          description?: string | null
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
          created_at?: string
          deadline?: string | null
          description?: string | null
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
      user_profiles: {
        Row: {
          bio: string | null
          communication_style: string | null
          created_at: string
          emotional_needs: string | null
          financial_attitude: string | null
          full_name: string | null
          id: string
          is_onboarding_complete: boolean
          location: string | null
          love_language: string | null
          mood_settings: Json | null
          relationship_goals: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          communication_style?: string | null
          created_at?: string
          emotional_needs?: string | null
          financial_attitude?: string | null
          full_name?: string | null
          id: string
          is_onboarding_complete?: boolean
          location?: string | null
          love_language?: string | null
          mood_settings?: Json | null
          relationship_goals?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          communication_style?: string | null
          created_at?: string
          emotional_needs?: string | null
          financial_attitude?: string | null
          full_name?: string | null
          id?: string
          is_onboarding_complete?: boolean
          location?: string | null
          love_language?: string | null
          mood_settings?: Json | null
          relationship_goals?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
