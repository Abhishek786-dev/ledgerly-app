
import { useCallback } from 'react';

import { useRouter } from 'src/routes/hooks';

import axiosInstance from 'src/utils/axios';

// ----------------------------------------------------------------------

interface LogoutPayload {
  refresh: string;
}

export function useLogout() {
  const router = useRouter();
  
  const handleLogout = useCallback(async () => {
  
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return;
    const payload: LogoutPayload = {
      refresh: refreshToken,
    };
    try {
      await axiosInstance.post('accounts/logout/', payload);
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      router.replace('/sign-in');
    }
  }, [router]);

  return handleLogout;
}
