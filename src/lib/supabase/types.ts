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
          payment_customer_id: string | null;
          payment_subscription_id: string | null;
          payment_portal_url: string | null;
          plan_period_start: string | null;
          plan_period_end: string | null;
          scan_count_this_period: number;
          is_disabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          plan?: "free" | "pro" | "team";
          payment_customer_id?: string | null;
          payment_subscription_id?: string | null;
          payment_portal_url?: string | null;
          plan_period_start?: string | null;
          plan_period_end?: string | null;
          scan_count_this_period?: number;
          is_disabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          plan?: "free" | "pro" | "team";
          payment_customer_id?: string | null;
          payment_subscription_id?: string | null;
          payment_portal_url?: string | null;
          plan_period_start?: string | null;
          plan_period_end?: string | null;
          scan_count_this_period?: number;
          is_disabled?: boolean;
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
          platform: string;
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
          platform?: string;
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
          platform?: string;
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
          platform: string;
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
          platform?: string;
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
          platform?: string;
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
      team_members: {
        Row: {
          id: string;
          team_owner_id: string;
          member_id: string | null;
          member_email: string;
          role: "admin" | "member";
          invite_status: "pending" | "accepted";
          invited_at: string;
          accepted_at: string | null;
        };
        Insert: {
          id?: string;
          team_owner_id: string;
          member_id?: string | null;
          member_email: string;
          role?: "admin" | "member";
          invite_status?: "pending" | "accepted";
          invited_at?: string;
          accepted_at?: string | null;
        };
        Update: {
          id?: string;
          team_owner_id?: string;
          member_id?: string | null;
          member_email?: string;
          role?: "admin" | "member";
          invite_status?: "pending" | "accepted";
          invited_at?: string;
          accepted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "team_members_team_owner_id_fkey";
            columns: ["team_owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_members_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      analytics_events: {
        Row: {
          id: string;
          user_id: string | null;
          event_name: string;
          event_data: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          event_name: string;
          event_data?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          event_name?: string;
          event_data?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
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
