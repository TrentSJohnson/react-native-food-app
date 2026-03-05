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

export function useApi() {
  return {
    ping: () => api.get<{ message: string }>('/ping').then((r) => r.data),
    upsertUser: (email: string) => api.post('/users/upsert', { email }).then((r) => r.data),
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
