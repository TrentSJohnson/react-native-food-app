import { ClerkLoaded, ClerkProvider, useAuth, useUser } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
const API_URL = process.env.EXPO_PUBLIC_API_URL!;

if (!publishableKey) {
  throw new Error('Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file');
}

function RootLayoutNav() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const segments = useSegments();
  const router = useRouter();
  const upsertedRef = useRef(false);

  useEffect(() => {
    if (!isSignedIn || !user) {
      upsertedRef.current = false;
      return;
    }
    if (upsertedRef.current) return;
    upsertedRef.current = true;

    const email = user.primaryEmailAddress?.emailAddress ?? '';
    fetch(`${API_URL}/users/upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clerkId: user.id, email }),
    }).catch((err) => console.error('User upsert failed:', err));
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
