import { useAuth } from '@clerk/expo';
import { useEffect } from 'react';
import { api } from '../services/api';

export function useAuthInterceptor() {
  const { getToken } = useAuth();

  useEffect(() => {
    const id = api.interceptors.request.use(async (config) => {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return () => api.interceptors.request.eject(id);
  }, [getToken]);
}

export function useApi() {
  return {
    ping: () => api.get<{ message: string }>('/ping').then((r) => r.data),
    upsertUser: (email: string) => api.post('/users/upsert', { email }).then((r) => r.data),
  };
}
