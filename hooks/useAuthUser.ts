import { useEffect, useState } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { useUserStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export function useAuthUser() {
    const { user, fetchUser, logout } = useUserStore();
    const [session, setSession] = useState<Session | null>(null);
    const [status, setStatus] = useState<AuthStatus>('loading');

    useEffect(() => {
        let isMounted = true;

        const initSession = async () => {
            const { data, error } = await supabase.auth.getSession();
            if (!isMounted) return;

            if (error) {
                console.error('[useAuthUser] getSession error:', error.message);
            }

            const session = data.session;
            console.log('[useAuthUser] Session detected:', {
                isAuthenticated: !!session,
                userId: session?.user?.id,
                email: session?.user?.email,
            });

            setSession(session ?? null);
            setStatus(session ? 'authenticated' : 'unauthenticated');

            if (session?.user?.id) {
              
                // Ensure profile exists
                try {
                    const response = await fetch('/api/user/init', {
                        method: 'POST',
                    });
                    const responseData = await response.json();
                } catch (error) {
                    console.error('[useAuthUser] Error initializing profile:', error);
                }
                // Then fetch user profile
                fetchUser(session.user.id);
            } else if (!session) {
                
                logout();
            }
        };

        initSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event: AuthChangeEvent, newSession: Session | null) => {
                setSession(newSession);
                setStatus(newSession ? 'authenticated' : 'unauthenticated');

                if (newSession?.user?.id) {
                    // Ensure profile exists
                    try {
                        const response = await fetch('/api/user/init', {
                            method: 'POST',
                        });
                        if (!response.ok) {
                            console.warn('Failed to initialize profile');
                        }
                    } catch (error) {
                        console.error('Error initializing profile:', error);
                    }
                    // Then fetch user profile
                    fetchUser(newSession.user.id);
                } else if (!newSession) {
                    logout();
                }
            }
        );

        return () => {
            isMounted = false;
            authListener.subscription.unsubscribe();
        };
    }, [fetchUser, logout]);

    return {
        user,
        session,
        isAuthenticated: status === 'authenticated',
        isLoading: status === 'loading',
        logout,
    };
}
