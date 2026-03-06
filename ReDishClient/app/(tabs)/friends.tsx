import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { sharedStyles as ss } from '@/constants/sharedStyles';
import { Colors, burntPeach, cream, lightBlue, navajoWhite } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FriendRequest, useApi, User } from '@/hooks/useApi';

export default function FriendsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const api = useApi();

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);

  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const [myId, setMyId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const [received, sent] = await Promise.all([
        api.getReceivedRequests(),
        api.getSentRequests(),
      ]);
      setReceivedRequests(received.requests);
      setSentRequests(sent.requests);
    } catch {
      // silent
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    api.getMe().then(({ user }) => setMyId(user._id)).catch(() => {});
    loadRequests();
  }, [loadRequests]);

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!text.trim() || text.length < 2) {
      setSearchResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { users } = await api.searchUsers(text.trim());
        setSearchResults(users.filter((u) => u._id !== myId));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const handleSendRequest = async (targetUserId: string) => {
    setActionLoading(targetUserId);
    try {
      await api.sendFriendRequest(targetUserId);
      Alert.alert('Request sent!', 'Your friend request has been sent.');
      await loadRequests();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to send request';
      Alert.alert('Error', msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAccept = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      await api.acceptFriendRequest(requestId);
      await loadRequests();
    } catch {
      Alert.alert('Error', 'Failed to accept request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      await api.deleteFriendRequest(requestId);
      await loadRequests();
    } catch {
      Alert.alert('Error', 'Failed to remove request');
    } finally {
      setActionLoading(null);
    }
  };

  const alreadySent = (userId: string) =>
    sentRequests.some((r) => {
      const pub = r.publisherId as User;
      return pub._id === userId;
    });

  const renderSearchResult = ({ item }: { item: User }) => {
    const sent = alreadySent(item._id);
    const loading = actionLoading === item._id;
    return (
      <View style={[styles.row, { borderColor: colors.secondary }]}>
        <View style={styles.userInfo}>
          <Text style={[styles.username, { color: colors.text }]}>
            {item.username ? `@${item.username}` : item.email}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            { backgroundColor: sent ? colors.secondary : burntPeach },
          ]}
          disabled={sent || loading}
          onPress={() => handleSendRequest(item._id)}>
          {loading
            ? <ActivityIndicator size="small" color={cream} />
            : <Text style={[styles.actionBtnText, { color: sent ? colors.text : cream }]}>
                {sent ? 'Sent' : 'Add'}
              </Text>
          }
        </TouchableOpacity>
      </View>
    );
  };

  const renderReceivedRequest = ({ item }: { item: FriendRequest }) => {
    const sender = item.subscriberId as User;
    const loading = actionLoading === item._id;
    return (
      <View style={[styles.row, { borderColor: colors.secondary }]}>
        <View style={styles.userInfo}>
          <Text style={[styles.username, { color: colors.text }]}>
            {sender.username ? `@${sender.username}` : sender.email}
          </Text>
          <Text style={[styles.subLabel, { color: colors.icon }]}>wants to follow you</Text>
        </View>
        {loading
          ? <ActivityIndicator size="small" color={burntPeach} />
          : (
            <View style={ss.row}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: lightBlue, marginRight: 8 }]}
                onPress={() => handleAccept(item._id)}>
                <Text style={[styles.actionBtnText, { color: colors.text }]}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.secondary }]}
                onPress={() => handleDelete(item._id)}>
                <Text style={[styles.actionBtnText, { color: colors.text }]}>Reject</Text>
              </TouchableOpacity>
            </View>
          )
        }
      </View>
    );
  };

  const renderSentRequest = ({ item }: { item: FriendRequest }) => {
    const recipient = item.publisherId as User;
    const loading = actionLoading === item._id;
    return (
      <View style={[styles.row, { borderColor: colors.secondary }]}>
        <View style={styles.userInfo}>
          <Text style={[styles.username, { color: colors.text }]}>
            {recipient.username ? `@${recipient.username}` : recipient.email}
          </Text>
          <Text style={[styles.subLabel, { color: colors.icon }]}>pending</Text>
        </View>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.secondary }]}
          disabled={loading}
          onPress={() => handleDelete(item._id)}>
          {loading
            ? <ActivityIndicator size="small" color={colors.text} />
            : <Text style={[styles.actionBtnText, { color: colors.text }]}>Cancel</Text>
          }
        </TouchableOpacity>
      </View>
    );
  };

  const showSearch = query.length >= 2;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search bar */}
      <View style={[ss.row, ss.fieldBorder, styles.searchRow, { borderColor: navajoWhite }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search by username..."
          placeholderTextColor={colors.icon}
          value={query}
          onChangeText={handleQueryChange}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => handleQueryChange('')}>
            <Text style={[styles.clearBtn, { color: colors.icon }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search results */}
      {showSearch && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Search Results</Text>
          {searching
            ? <ActivityIndicator color={burntPeach} style={{ marginTop: 12 }} />
            : (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item._id}
                renderItem={renderSearchResult}
                scrollEnabled={false}
                ListEmptyComponent={
                  <Text style={[styles.emptyText, { color: colors.icon }]}>No users found.</Text>
                }
              />
            )
          }
        </View>
      )}

      {/* Requests sections */}
      {!showSearch && (
        <>
          {loadingRequests
            ? <ActivityIndicator color={burntPeach} style={{ marginTop: 32 }} />
            : (
              <SectionList
                contentContainerStyle={styles.listContent}
                sections={[
                  { title: 'Received Requests', data: receivedRequests, renderItem: renderReceivedRequest },
                  { title: 'Outgoing Requests', data: sentRequests, renderItem: renderSentRequest },
                ]}
                keyExtractor={(item) => item._id}
                renderSectionHeader={({ section: { title, data } }) =>
                  data.length > 0 ? (
                    <Text style={[styles.sectionTitle, { color: colors.text, backgroundColor: colors.background }]}>
                      {title}
                    </Text>
                  ) : null
                }
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Text style={[styles.emptyText, { color: colors.icon }]}>
                      No pending friend requests.{'\n'}Search for users to add them as friends.
                    </Text>
                  </View>
                }
              />
            )
          }
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchRow: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  clearBtn: {
    fontSize: 16,
    paddingLeft: 8,
  },
  section: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
  },
  listContent: {
    paddingBottom: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 4,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 15,
    fontWeight: '600',
  },
  subLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    minWidth: 60,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    paddingTop: 48,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
  },
});
