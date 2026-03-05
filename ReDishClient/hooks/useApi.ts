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

type PlaceData = {
  googlePlaceId: string;
  name: string;
  address?: string;
  rating?: number;
  priceLevel?: string;
};

type User = {
  _id: string;
  clerkId: string;
  email: string;
  username?: string;
  createdAt: string;
};

export function useApi() {
  return {
    ping: () => api.get<{ message: string }>('/ping').then((r) => r.data),
    upsertUser: (email: string, username?: string) =>
      api.post('/users/upsert', { email, username }).then((r) => r.data),
    getMe: () => api.get<{ user: User }>('/users/me').then((r) => r.data),
    checkUsername: (username: string) =>
      api.get<{ available: boolean }>(`/users/check-username/${encodeURIComponent(username)}`).then((r) => r.data),
    updateUsername: (username: string) =>
      api.patch<{ user: User }>('/users/username', { username }).then((r) => r.data),
    upsertLocation: (place: PlaceData) =>
      api.post<{ location: { _id: string } }>('/locations/upsert', place).then((r) => r.data),
    createOrder: (description: string, locationId: string) =>
      api.post('/orders', { description, locationId }).then((r) => r.data),
    saveOrder: async (description: string, place: PlaceData) => {
      const { location } = await api
        .post<{ location: { _id: string } }>('/locations/upsert', place)
        .then((r) => r.data);
      return api.post('/orders', { description, locationId: location._id }).then((r) => r.data);
    },
  };
}
