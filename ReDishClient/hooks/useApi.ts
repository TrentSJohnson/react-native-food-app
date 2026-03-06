import { useAuth } from '@clerk/expo';
import { api, setAuthState } from '../services/api';

export function useAuthInterceptor() {
  const { getToken, userId } = useAuth();
  setAuthState(getToken, userId ?? null);
}

type PlaceData = {
  googlePlaceId: string;
  name: string;
  address?: string;
  rating?: number;
  priceLevel?: string;
};

export type User = {
  _id: string;
  clerkId: string;
  email: string;
  username?: string;
  createdAt: string;
};

export type FriendRequest = {
  _id: string;
  publisherId: User | string;
  subscriberId: User | string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
};

export function useApi() {
  return {
    ping: () => api.get<{ message: string }>('/ping').then((r) => r.data),
    upsertUser: (email: string, username?: string) =>
      api.post('/users/upsert', { email, username }).then((r) => r.data),
    getMe: () => api.get<{ user: User }>('/users/me').then((r) => r.data),
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
    searchUsers: (q: string) =>
      api.get<{ users: User[] }>(`/users/search?q=${encodeURIComponent(q)}`).then((r) => r.data),
    sendFriendRequest: (targetUserId: string) =>
      api.post<{ request: FriendRequest }>(`/subscribers/request/${targetUserId}`).then((r) => r.data),
    getReceivedRequests: () =>
      api.get<{ requests: FriendRequest[] }>('/subscribers/requests/received').then((r) => r.data),
    getSentRequests: () =>
      api.get<{ requests: FriendRequest[] }>('/subscribers/requests/sent').then((r) => r.data),
    acceptFriendRequest: (requestId: string) =>
      api.patch<{ request: FriendRequest }>(`/subscribers/requests/${requestId}/accept`).then((r) => r.data),
    deleteFriendRequest: (requestId: string) =>
      api.delete<{ success: boolean }>(`/subscribers/requests/${requestId}`).then((r) => r.data),
    getFriends: () =>
      api.get<{ friends: User[] }>('/subscribers/friends').then((r) => r.data),
  };
}
