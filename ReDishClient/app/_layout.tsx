import { ClerkLoaded, ClerkProvider, useAuth, useUser } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ServerStatusProvider, useServerStatus } from '../context/server-status';
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
  const { onServerReady } = useServerStatus();

  useEffect(() => {
    if (!isSignedIn || !user) {
      upsertedRef.current = false;
      return;
    }
    if (upsertedRef.current) return;
    upsertedRef.current = true;

    const email = user.primaryEmailAddress?.emailAddress ?? '';
    const username = user.username ?? undefined;

    const doUpsert = () =>
      api.upsertUser(email, username).catch((err) => console.error('User upsert failed:', err));

    onServerReady(doUpsert);
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
        <ServerStatusProvider>
          <RootLayoutNav />
        </ServerStatusProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
