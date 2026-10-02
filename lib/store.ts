import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';

export interface UserProfile {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    created_at: string;
    updated_at: string;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface UserStore {
    /** Profile of the signed-in user. Seeded from the session, then replaced by the `profiles` row. */
    user: UserProfile | null;
    /** Current Supabase session (written only by the single auth bootstrap in app/user-initializer.tsx). */
    session: Session | null;
    /** Auth state. Starts as 'loading' until the first INITIAL_SESSION event arrives. */
    status: AuthStatus;
    /** True while a profile read or update request is in flight. Not an auth state. */
    isLoading: boolean;
    error: string | null;
    setSession: (session: Session | null) => void;
    setStatus: (status: AuthStatus) => void;
    fetchUser: (userId: string, options?: { force?: boolean }) => Promise<void>;
    updateUser: (userId: string, data: Partial<UserProfile>) => Promise<void>;
    setUser: (user: UserProfile | null) => void;
    /** Clears local auth state only. Use signOut() to end the Supabase session. */
    logout: () => void;
    /** Ends the Supabase session and clears local auth state. */
    signOut: () => Promise<void>;
}

type ProfileRow = {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
};

const PROFILE_COLUMNS = 'id, email, full_name, avatar_url, created_at, updated_at';

// Module-level dedupe state: one profile request per user id per page session.
const inflight = new Map<string, Promise<void>>();
let loadedUserId: string | null = null;

const loadSupabase = () => import('./supabase').then((m) => m.supabase);

function mapProfile(row: ProfileRow): UserProfile {
    return {
        id: row.id,
        email: row.email,
        name: row.full_name || null,
        image: row.avatar_url || null,
        created_at: row.created_at,
        updated_at: row.updated_at,
    };
}

function metaString(meta: Record<string, unknown> | undefined, ...keys: string[]): string | null {
    for (const key of keys) {
        const value = meta?.[key];
        if (typeof value === 'string' && value.trim()) return value;
    }
    return null;
}

/** Provisional profile built from the auth user, so user.id is available without waiting for a request. */
function profileFromAuthUser(authUser: User): UserProfile {
    const email = authUser.email ?? '';
    const meta = authUser.user_metadata as Record<string, unknown> | undefined;
    return {
        id: authUser.id,
        email,
        name: metaString(meta, 'full_name', 'name') ?? (email ? email.split('@')[0] : null),
        image: metaString(meta, 'avatar_url', 'picture'),
        created_at: authUser.created_at,
        updated_at: authUser.updated_at ?? authUser.created_at,
    };
}

function errorMessage(err: unknown, fallback: string): string {
    if (err instanceof Error) return err.message;
    if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
        return (err as { message: string }).message;
    }
    return fallback;
}

export const useUserStore = create<UserStore>((set, get) => ({
    user: null,
    session: null,
    status: 'loading',
    isLoading: false,
    error: null,

    setSession: (session) => {
        const prev = get();
        const status: AuthStatus = session ? 'authenticated' : 'unauthenticated';

        if (!session) {
            if (prev.status === 'unauthenticated' && !prev.session && !prev.user) return;
            loadedUserId = null;
            inflight.clear();
            set({ session: null, status, user: null, error: null, isLoading: false });
            return;
        }

        const sameUser = prev.session?.user.id === session.user.id;
        if (
            prev.status === status &&
            sameUser &&
            prev.session?.access_token === session.access_token
        ) {
            return;
        }

        if (!sameUser) {
            loadedUserId = null;
        }

        set({
            session,
            status,
            user: prev.user?.id === session.user.id ? prev.user : profileFromAuthUser(session.user),
            error: sameUser ? prev.error : null,
        });
    },

    setStatus: (status) => {
        if (get().status !== status) set({ status });
    },

    fetchUser: (userId, options) => {
        if (!userId) return Promise.resolve();
        if (!options?.force && loadedUserId === userId) return Promise.resolve();
        const existing = inflight.get(userId);
        if (existing) return existing;

        const request = (async () => {
            set({ isLoading: true, error: null });
            try {
                const supabase = await loadSupabase();
                const { data, error } = await supabase
                    .from('profiles')
                    .select(PROFILE_COLUMNS)
                    .eq('id', userId)
                    .maybeSingle();

                if (error) throw error;

                let row = (data as ProfileRow | null) ?? null;

                // Ensure the profile row exists (once per user id per page session).
                // The database trigger normally creates it; this covers projects without the trigger.
                if (!row) {
                    const authUser = get().session?.user;
                    if (authUser && authUser.id === userId && authUser.email) {
                        const provisional = profileFromAuthUser(authUser);
                        const { data: inserted, error: insertError } = await supabase
                            .from('profiles')
                            .upsert(
                                {
                                    id: userId,
                                    email: authUser.email,
                                    full_name: provisional.name ?? null,
                                    avatar_url: provisional.image ?? null,
                                },
                                { onConflict: 'id', ignoreDuplicates: true },
                            )
                            .select(PROFILE_COLUMNS)
                            .maybeSingle();
                        if (!insertError && inserted) row = inserted as ProfileRow;
                    }
                }

                // Ignore the result when the user changed or signed out while the request ran.
                const current = get();
                if (current.status === 'unauthenticated') return;
                if (current.session && current.session.user.id !== userId) return;

                loadedUserId = userId;
                if (row) set({ user: mapProfile(row) });
            } catch (err) {
                set({ error: errorMessage(err, 'Failed to fetch user') });
            } finally {
                inflight.delete(userId);
                if (inflight.size === 0 && get().isLoading) set({ isLoading: false });
            }
        })();

        inflight.set(userId, request);
        return request;
    },

    updateUser: async (userId, data) => {
        set({ isLoading: true, error: null });
        try {
            // Map app interface to Supabase columns
            const updateData: { full_name?: string | null; avatar_url?: string | null; email?: string; updated_at: string } = {
                updated_at: new Date().toISOString(),
            };
            if (data.name !== undefined) updateData.full_name = data.name;
            if (data.image !== undefined) updateData.avatar_url = data.image;
            if (data.email !== undefined) updateData.email = data.email;

            const supabase = await loadSupabase();
            const { error } = await supabase
                .from('profiles')
                .update(updateData)
                .eq('id', userId);

            if (error) throw error;
            set((state) => ({
                user: state.user ? { ...state.user, ...data, updated_at: updateData.updated_at } : null,
                isLoading: false,
            }));
        } catch (err) {
            set({ error: errorMessage(err, 'Failed to update user'), isLoading: false });
        }
    },

    setUser: (user) => {
        set({ user, error: null });
    },

    logout: () => {
        loadedUserId = null;
        inflight.clear();
        set({ user: null, session: null, status: 'unauthenticated', error: null, isLoading: false });
    },

    signOut: async () => {
        try {
            const supabase = await loadSupabase();
            await supabase.auth.signOut();
        } finally {
            get().logout();
        }
    },
}));
