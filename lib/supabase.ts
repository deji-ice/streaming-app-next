import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create dummy client if credentials are missing (for development without auth)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
        },
    })
    : ({
        auth: {
            signUp: async () => ({ data: null, error: new Error('Supabase not configured') }),
            signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') }),
            signInWithOAuth: async () => ({ data: null, error: new Error('Supabase not configured') }),
            signOut: async () => ({ error: null }),
            getSession: async () => ({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({
                data: { subscription: { unsubscribe: () => {} } },
            }),
        },
    } as any);

// Server-side client with service role (bypasses RLS)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseAdmin = supabaseUrl && serviceRoleKey
    ? createClient<Database>(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
    : ({} as any);
