import { useAuth, useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AccountModal() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/sign-in');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.heading}>Account</ThemedText>
      {user?.username && <ThemedText style={styles.username}>@{user.username}</ThemedText>}
      <ThemedText style={styles.email}>{user?.primaryEmailAddress?.emailAddress}</ThemedText>
      <Pressable
        onPress={handleSignOut}
        style={[styles.signOutButton, { backgroundColor: colors.tint }]}>
        <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  heading: {
    marginBottom: 8,
  },
  username: {
    opacity: 0.9,
    fontWeight: '600',
  },
  email: {
    opacity: 0.7,
    marginBottom: 24,
  },
  signOutButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  signOutText: {
    color: '#fff',
    fontWeight: '600',
  },
});
