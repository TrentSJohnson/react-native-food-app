import { useAuth, useUser } from '@clerk/expo';
import { Redirect, Tabs, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const { isSignedIn, isLoaded, signOut } = useAuth();
  const { user } = useUser();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

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
          tabBarInactiveTintColor: colors.icon,
          tabBarStyle: { backgroundColor: colors.background },
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
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
          }}
        />
        <Tabs.Screen
          name="friends"
          options={{
            title: 'Friends',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.2.fill" color={color} />,
          }}
        />
      </Tabs>

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
          <ThemedText style={styles.email}>
            {`@${user?.username}`}
          </ThemedText>
          <Pressable
            onPress={handleSignOut}
            style={[styles.signOutButton, { backgroundColor: colors.tint }]}>
            <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
          </Pressable>
        </ThemedView>
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
});
