import { useUserStore } from '@/lib/store';
import { useAuthUser } from '@/hooks/useAuthUser';

export function useUser() {
  const { user, isLoading, error, updateUser } = useUserStore();
  const { session, isAuthenticated, isLoading: authLoading } = useAuthUser();

  return {
    user,
    session,
    isAuthenticated,
    isLoading: isLoading || authLoading,
    error,
    updateProfile: (data: any) => {
      if (user?.id) {
        return updateUser(user.id, data);
      }
    },
  };
}
