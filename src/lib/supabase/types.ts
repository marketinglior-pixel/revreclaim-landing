export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          plan: "free" | "pro" | "team";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          plan?: "free" | "pro" | "team";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          plan?: "free" | "pro" | "team";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      reports: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          summary: Json;
          categories: Json;
          leaks: Json;
          stripe_account_id: string | null;
          is_test_mode: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
          summary: Json;
          categories: Json;
          leaks: Json;
          stripe_account_id?: string | null;
          is_test_mode?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
          summary?: Json;
          categories?: Json;
          leaks?: Json;
          stripe_account_id?: string | null;
          is_test_mode?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "reports_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      scan_configs: {
        Row: {
          id: string;
          user_id: string;
          encrypted_api_key: string;
          scan_frequency: "weekly" | "daily" | "monthly";
          is_active: boolean;
          last_scan_at: string | null;
          next_scan_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          encrypted_api_key: string;
          scan_frequency?: "weekly" | "daily" | "monthly";
          is_active?: boolean;
          last_scan_at?: string | null;
          next_scan_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          encrypted_api_key?: string;
          scan_frequency?: "weekly" | "daily" | "monthly";
          is_active?: boolean;
          last_scan_at?: string | null;
          next_scan_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scan_configs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
