import { useShallow } from 'zustand/react/shallow';
import { useUserStore } from '@/lib/store';

/**
 * Compatibility export. A pure read of the same auth store as useUser(); it no longer
 * subscribes to Supabase itself (the single bootstrap is app/user-initializer.tsx).
 * `logout` ends the Supabase session and clears the local auth state.
 */
export function useAuthUser() {
  const { user, session, status, signOut } = useUserStore(
    useShallow((s) => ({ user: s.user, session: s.session, status: s.status, signOut: s.signOut })),
  );

  return {
    user,
    session,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    logout: signOut,
  };
}
