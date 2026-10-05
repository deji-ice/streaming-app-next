import { useShallow } from 'zustand/react/shallow';
import { useUserStore, type AuthStatus, type UserProfile } from '@/lib/store';

/**
 * Pure read of the auth store. No effects and no Supabase calls: the single auth
 * bootstrap lives in app/user-initializer.tsx. Consumers re-render only when one of
 * the selected fields changes.
 */
export function useUser() {
  const { user, session, status, error } = useUserStore(
    useShallow((s) => ({ user: s.user, session: s.session, status: s.status, error: s.error })),
  );

  return {
    user,
    session,
    isAuthenticated: status === 'authenticated',
    /** True only until the initial auth state is known. Profile requests do not flip it. */
    isLoading: status === 'loading',
    error,
    updateProfile,
  };
}

/** Stable function: updates the signed-in user's profile, no-op when signed out. */
function updateProfile(data: Partial<UserProfile>): Promise<void> | undefined {
  const { user, updateUser } = useUserStore.getState();
  if (user?.id) {
    return updateUser(user.id, data);
  }
  return undefined;
}

/** Boolean selector: re-renders only when the signed-in state flips. Prefer this in cards and lists. */
export function useIsAuthenticated(): boolean {
  return useUserStore((s) => s.status === 'authenticated');
}

/** Auth status selector: 'loading' | 'authenticated' | 'unauthenticated'. */
export function useAuthStatus(): AuthStatus {
  return useUserStore((s) => s.status);
}
