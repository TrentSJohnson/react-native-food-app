import { useAuth, useUser } from '@clerk/expo';
import { Redirect, Tabs, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useApi } from '@/hooks/useApi';

export default function TabLayout() {
  const { isSignedIn, isLoaded, signOut } = useAuth();
  const { user } = useUser();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const api = useApi();
  const [modalVisible, setModalVisible] = useState(false);
  const [usernameModalVisible, setUsernameModalVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkUsername = () => {
    if (!isSignedIn) return;
      api.getMe().then(({ user: me }) => {
        if (!me.username) setUsernameModalVisible(true);
      }).catch(() => {});
  }

  useEffect(() => {
    checkUsername();
  }, []);

  useEffect(() => {
    checkUsername();
  }, [isSignedIn]);

  const handleUsernameChange = useCallback((value: string) => {
    setUsername(value);
    setUsernameAvailable(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 3) return;
    setCheckingUsername(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const { available } = await api.checkUsername(value);
        setUsernameAvailable(available);
      } catch {
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);
  }, [api]);

  const handleSetUsername = async () => {
    if (!usernameAvailable || username.length < 3) return;
    setSubmitting(true);
    try {
      await api.updateUsername(username);
      setUsernameModalVisible(false);
    } catch {

    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  const colors = Colors[colorScheme ?? 'light'];

  const handleSignOut = async () => {
    setModalVisible(false);
    await signOut();
    router.replace('/(auth)/sign-in');
  };

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.tint,
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerRight: () => (
            <Pressable
              onPress={() => setModalVisible(true)}
              style={{ marginRight: 16 }}
              hitSlop={8}>
              <IconSymbol size={26} name="person.circle" color={colors.text} />
            </Pressable>
          ),
          tabBarButton: HapticTab,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
          }}
        />
      </Tabs>

      {/* Account sheet */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setModalVisible(false)} />
        <ThemedView style={[styles.sheet, { borderColor: colors.secondary }]}>
          <View style={[styles.handle, { backgroundColor: colors.secondary }]} />
          <ThemedText type="title" style={styles.heading}>Account</ThemedText>
          <ThemedText style={styles.email}>
            {user?.primaryEmailAddress?.emailAddress}
          </ThemedText>
          <Pressable
            onPress={handleSignOut}
            style={[styles.signOutButton, { backgroundColor: colors.tint }]}>
            <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
          </Pressable>
        </ThemedView>
      </Modal>

      {/* Username setup modal */}
      <Modal
        visible={usernameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {}}>
        <View style={styles.usernameBackdrop}>
          <ThemedView style={[styles.usernameCard, { borderColor: colors.secondary }]}>
            <ThemedText type="title" style={styles.heading}>Choose a Username</ThemedText>
            <ThemedText style={styles.usernameSubtitle}>
              Pick a unique username to get started.
            </ThemedText>
            <TextInput
              style={[
                styles.usernameInput,
                { borderColor: usernameAvailable === false ? colors.tint : colors.secondary, color: colors.text },
              ]}
              placeholder="username"
              placeholderTextColor={`${colors.text}60`}
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={handleUsernameChange}
            />
            {checkingUsername && (
              <ThemedText style={styles.statusText}>Checking…</ThemedText>
            )}
            {!checkingUsername && usernameAvailable === true && (
              <ThemedText style={[styles.statusText, { color: '#4caf50' }]}>Available!</ThemedText>
            )}
            {!checkingUsername && usernameAvailable === false && (
              <ThemedText style={[styles.statusText, { color: colors.tint }]}>Username taken</ThemedText>
            )}
            <Pressable
              onPress={handleSetUsername}
              disabled={!usernameAvailable || submitting}
              style={[
                styles.signOutButton,
                { backgroundColor: colors.tint, opacity: !usernameAvailable || submitting ? 0.5 : 1, marginTop: 8 },
              ]}>
              <ThemedText style={styles.signOutText}>
                {submitting ? 'Saving…' : 'Set Username'}
              </ThemedText>
            </Pressable>
          </ThemedView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    padding: 24,
    paddingBottom: 48,
    alignItems: 'center',
    gap: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  heading: {
    marginBottom: 4,
  },
  email: {
    opacity: 0.7,
    marginBottom: 16,
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
  usernameBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  usernameCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
    gap: 12,
  },
  usernameSubtitle: {
    opacity: 0.65,
    textAlign: 'center',
    marginBottom: 4,
  },
  usernameInput: {
    width: '100%',
    height: 50,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  statusText: {
    fontSize: 12,
    opacity: 0.8,
  },
});
