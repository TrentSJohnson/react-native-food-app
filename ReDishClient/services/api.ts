import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL!;

const api = axios.create({ baseURL: API_URL });

export async function ping() {
  const { data } = await api.get('/ping');
  return data;
}

export async function upsertUser(clerkId: string, email: string) {
  const { data } = await api.post('/users/upsert', { clerkId, email });
  return data;
}
