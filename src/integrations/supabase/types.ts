export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      barbers: {
        Row: {
          availability: string
          avatar: string
          bio: string
          city: string
          contract_types: string[]
          cover: string
          created_at: string
          education: Json
          email: string
          experience_years: number
          gallery: Json
          headline: string
          id: string
          instagram: string | null
          name: string
          salary_max: number
          salary_min: number
          specialties: string[]
          user_id: string
          whatsapp: string
        }
        Insert: {
          availability?: string
          avatar?: string
          bio?: string
          city?: string
          contract_types?: string[]
          cover?: string
          created_at?: string
          education?: Json
          email?: string
          experience_years?: number
          gallery?: Json
          headline?: string
          id?: string
          instagram?: string | null
          name: string
          salary_max?: number
          salary_min?: number
          specialties?: string[]
          user_id: string
          whatsapp?: string
        }
        Update: {
          availability?: string
          avatar?: string
          bio?: string
          city?: string
          contract_types?: string[]
          cover?: string
          created_at?: string
          education?: Json
          email?: string
          experience_years?: number
          gallery?: Json
          headline?: string
          id?: string
          instagram?: string | null
          name?: string
          salary_max?: number
          salary_min?: number
          specialties?: string[]
          user_id?: string
          whatsapp?: string
        }
        Relationships: []
      }
      draft_tracking: {
        Row: {
          created_at: string
          device_id: string
          kind: string
          published: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          device_id: string
          kind: string
          published?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          device_id?: string
          kind?: string
          published?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      profile_views: {
        Row: {
          barber_id: string
          created_at: string
          id: string
          owner_id: string
          viewer_id: string
          viewer_name: string
        }
        Insert: {
          barber_id: string
          created_at?: string
          id?: string
          owner_id?: string
          viewer_id?: string
          viewer_name?: string
        }
        Update: {
          barber_id?: string
          created_at?: string
          id?: string
          owner_id?: string
          viewer_id?: string
          viewer_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_views_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string
          id: string
          last_name: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string
          id: string
          last_name?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          details: string
          id: string
          reason: string
          reporter_email: string
          reporter_id: string
          reporter_name: string
          target_email: string | null
          target_id: string
          target_name: string
          target_type: string
          target_whatsapp: string | null
        }
        Insert: {
          created_at?: string
          details?: string
          id?: string
          reason: string
          reporter_email: string
          reporter_id: string
          reporter_name: string
          target_email?: string | null
          target_id: string
          target_name: string
          target_type: string
          target_whatsapp?: string | null
        }
        Update: {
          created_at?: string
          details?: string
          id?: string
          reason?: string
          reporter_email?: string
          reporter_id?: string
          reporter_name?: string
          target_email?: string | null
          target_id?: string
          target_name?: string
          target_type?: string
          target_whatsapp?: string | null
        }
        Relationships: []
      }
      shop_offers: {
        Row: {
          city: string
          conditions: string[]
          contract_type: string
          cover: string
          created_at: string
          description: string
          email: string
          id: string
          logo: string
          looking_for: string
          salary_max: number
          salary_min: number
          shop_name: string
          specialties: string[]
          urgent: boolean
          user_id: string
          whatsapp: string
        }
        Insert: {
          city?: string
          conditions?: string[]
          contract_type?: string
          cover?: string
          created_at?: string
          description?: string
          email?: string
          id?: string
          logo?: string
          looking_for?: string
          salary_max?: number
          salary_min?: number
          shop_name: string
          specialties?: string[]
          urgent?: boolean
          user_id: string
          whatsapp?: string
        }
        Update: {
          city?: string
          conditions?: string[]
          contract_type?: string
          cover?: string
          created_at?: string
          description?: string
          email?: string
          id?: string
          logo?: string
          looking_for?: string
          salary_max?: number
          salary_min?: number
          shop_name?: string
          specialties?: string[]
          urgent?: boolean
          user_id?: string
          whatsapp?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      draft_stats: {
        Args: never
        Returns: {
          kind: string
          pending: number
          published: number
          started: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      track_draft: {
        Args: { _device: string; _kind: string; _published: boolean }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
