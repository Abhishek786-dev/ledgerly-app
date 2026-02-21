import { useCallback } from 'react';
import { googleLogout } from '@react-oauth/google';

import { useRouter } from 'src/routes/hooks';

// ----------------------------------------------------------------------

export function useLogout() {
  const router = useRouter();

  const handleLogout = useCallback(() => {
    try {
      googleLogout();
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      router.replace('/sign-in');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [router]);

  return handleLogout;
}
