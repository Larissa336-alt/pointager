import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'employee' | 'manager';
          department: string;
          position: string;
          avatar_url: string | null;
          face_encoding: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          role: 'employee' | 'manager';
          department: string;
          position: string;
          avatar_url?: string | null;
          face_encoding?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: 'employee' | 'manager';
          department?: string;
          position?: string;
          avatar_url?: string | null;
          face_encoding?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      time_entries: {
        Row: {
          id: string;
          employee_id: string;
          type: 'clock-in' | 'clock-out';
          timestamp: string;
          location: string | null;
          latitude: number | null;
          longitude: number | null;
          notes: string | null;
          face_verified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          type: 'clock-in' | 'clock-out';
          timestamp?: string;
          location?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          notes?: string | null;
          face_verified?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          type?: 'clock-in' | 'clock-out';
          timestamp?: string;
          location?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          notes?: string | null;
          face_verified?: boolean;
        };
      };
      notifications: {
        Row: {
          id: string;
          employee_id: string;
          title: string;
          message: string;
          type: 'info' | 'warning' | 'success' | 'error';
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          title: string;
          message: string;
          type: 'info' | 'warning' | 'success' | 'error';
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          title?: string;
          message?: string;
          type?: 'info' | 'warning' | 'success' | 'error';
          read?: boolean;
        };
      };
    };
  };
};