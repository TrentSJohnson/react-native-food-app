import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL!;

export const api = axios.create({ baseURL: API_URL });

const authState: { getToken: (() => Promise<string | null>) | null; userId: string | null } = {
  getToken: null,
  userId: null,
};

export function setAuthState(getToken: () => Promise<string | null>, userId: string | null) {
  authState.getToken = getToken;
  authState.userId = userId;
}

api.interceptors.request.use(async (config) => {
  if (authState.getToken) {
    const token = await authState.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  if (authState.userId) {
    config.params = { ...config.params, clerkId: authState.userId };
  }
  return config;
});
