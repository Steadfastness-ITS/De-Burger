import { useCallback } from 'react';
import { useRouter } from 'expo-router';

import { useApp } from './AppState';
import { isProfileComplete } from './profile';

// Call before placing an order. Returns true if the profile is complete;
// otherwise opens the profile set-up screen and returns false.
export function useRequireProfile(): () => boolean {
  const router = useRouter();
  const { profile } = useApp();
  return useCallback((): boolean => {
    if (isProfileComplete(profile)) return true;
    router.push('/profile');
    return false;
  }, [profile, router]);
}
