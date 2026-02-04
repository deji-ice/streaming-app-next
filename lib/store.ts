import { create } from 'zustand';
import { supabase } from './supabase';

export interface UserProfile {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    created_at: string;
    updated_at: string;
}

interface SupabaseProfile {
    id: string;
    email: string;
    full_name?: string | null;
    avatar_url?: string | null;
    username?: string | null;
    created_at: string;
    updated_at: string;
}

interface UserStore {
    user: UserProfile | null;
    isLoading: boolean;
    error: string | null;
    fetchUser: (userId: string) => Promise<void>;
    updateUser: (userId: string, data: Partial<UserProfile>) => Promise<void>;
    setUser: (user: UserProfile | null) => void;
    logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
    user: null,
    isLoading: false,
    error: null,

    fetchUser: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
            console.log('[fetchUser] Fetching profile for user:', userId);
            const { data, error } = await supabase
                .from('profiles')
                .select('id, email, full_name, avatar_url, created_at, updated_at')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('[fetchUser] Query error:', error);
                throw error;
            }

            console.log('[fetchUser] Profile fetched successfully:', {
                id: data.id,
                email: data.email,
                name: data.full_name,
            });

            // Map Supabase columns to app interface
            const profile: UserProfile = {
                id: data.id,
                email: data.email,
                name: data.full_name || null,
                image: data.avatar_url || null,
                created_at: data.created_at,
                updated_at: data.updated_at,
            };

            set({ user: profile, isLoading: false });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user';
            console.error('[fetchUser] Error:', errorMessage);
            set({ error: errorMessage, isLoading: false });
        }
    },

    updateUser: async (userId: string, data: Partial<UserProfile>) => {
        set({ isLoading: true, error: null });
        try {
            // Map app interface to Supabase columns
            const updateData: Record<string, any> = {};
            if (data.name !== undefined) updateData.full_name = data.name;
            if (data.image !== undefined) updateData.avatar_url = data.image;
            if (data.email !== undefined) updateData.email = data.email;
            updateData.updated_at = new Date().toISOString();

            const { error } = await supabase
                .from('profiles')
                .update(updateData)
                .eq('id', userId);

            if (error) throw error;
            set((state) => ({
                user: state.user ? { ...state.user, ...data } : null,
                isLoading: false,
            }));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
            console.error('updateUser error:', errorMessage);
            set({ error: errorMessage, isLoading: false });
        }
    },

    setUser: (user) => {
        set({ user, error: null });
    },

    logout: () => {
        set({ user: null, error: null, isLoading: false });
    },
}));
