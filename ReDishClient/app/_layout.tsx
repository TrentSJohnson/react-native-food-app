import { ClerkLoaded, ClerkProvider, useAuth, useUser } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useApi, useAuthInterceptor } from '../hooks/useApi';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file');
}

function RootLayoutNav() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const segments = useSegments();
  const router = useRouter();
  const upsertedRef = useRef(false);
  useAuthInterceptor();
  const api = useApi();

  useEffect(() => {
    api.ping()
      .then((data) => console.log('Server ping:', data))
      .catch((err) => console.error('Server ping failed:', err));
  }, []);

  useEffect(() => {
    if (!isSignedIn || !user) {
      upsertedRef.current = false;
      return;
    }
    if (upsertedRef.current) return;
    upsertedRef.current = true;

    const email = user.primaryEmailAddress?.emailAddress ?? '';
    api.upsertUser(email).catch((err) => console.error('User upsert failed:', err));
  }, [isSignedIn, user]);

  useEffect(() => {
    console.log('Auth state changed:', { isLoaded, isSignedIn, segments });
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isSignedIn && inAuthGroup) {
      router.replace('/');
    } else if (!isSignedIn && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    }
  }, [isSignedIn, isLoaded, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <RootLayoutNav />
      </ClerkLoaded>
    </ClerkProvider>
  );
}
