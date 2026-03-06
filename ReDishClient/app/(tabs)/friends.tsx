import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
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
import { FriendRequest, Order, OrderLocation, useApi, User } from '@/hooks/useApi';

const PRICE_LABELS: Record<string, string> = {
  PRICE_LEVEL_FREE: 'Free',
  PRICE_LEVEL_INEXPENSIVE: '$',
  PRICE_LEVEL_MODERATE: '$$',
  PRICE_LEVEL_EXPENSIVE: '$$$',
  PRICE_LEVEL_VERY_EXPENSIVE: '$$$$',
};

function StarRating({ rating, color }: { rating: number; color: string }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);
  return (
    <Text style={{ fontSize: 13, color }}>
      {'★'.repeat(full)}
      {hasHalf ? '½' : ''}
      {'☆'.repeat(empty)}
      {` ${rating.toFixed(1)}`}
    </Text>
  );
}

function FriendOrderCard({ order, colors }: { order: Order; colors: (typeof Colors)['light'] }) {
  const loc = order.locationId as OrderLocation;
  const price = loc.priceLevel ? PRICE_LABELS[loc.priceLevel] : null;
  return (
    <View style={[friendStyles.card, { backgroundColor: colors.background, borderColor: colors.secondary }]}>
      <Text style={[friendStyles.locationName, { color: colors.text }]} numberOfLines={1}>
        {loc.name}
      </Text>
      {loc.address ? (
        <Text style={[friendStyles.locationAddress, { color: colors.icon }]} numberOfLines={1}>
          {loc.address}
        </Text>
      ) : null}
      <View style={[ss.row, { gap: 8, marginBottom: 8 }]}>
        {loc.rating !== undefined && <StarRating rating={loc.rating} color={colors.text} />}
        {price ? <Text style={[friendStyles.chip, { color: colors.text }]}>{price}</Text> : null}
      </View>
      <View style={[friendStyles.orderDescContainer, { backgroundColor: colors.secondary + '55', borderColor: colors.secondary }]}>
        <Text style={[friendStyles.orderDesc, { color: colors.text }]}>{order.description}</Text>
      </View>
    </View>
  );
}

export default function FriendsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const api = useApi();

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);

  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const [myId, setMyId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [friendOrders, setFriendOrders] = useState<Order[]>([]);
  const [loadingFriendOrders, setLoadingFriendOrders] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const [received, sent, friendsRes] = await Promise.all([
        api.getReceivedRequests(),
        api.getSentRequests(),
        api.getFriends(),
      ]);
      setReceivedRequests(received.requests);
      setSentRequests(sent.requests);
      setFriends(friendsRes.friends);
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

  const handleFriendPress = async (friend: User) => {
    setSelectedFriend(friend);
    setFriendOrders([]);
    setLoadingFriendOrders(true);
    try {
      const { orders } = await api.getFriendOrders(friend._id);
      setFriendOrders(orders);
    } catch {
      Alert.alert('Error', 'Could not load orders');
    } finally {
      setLoadingFriendOrders(false);
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

  const renderFriend = ({ item }: { item: User }) => (
    <TouchableOpacity style={[styles.row, { borderColor: colors.secondary }]} onPress={() => handleFriendPress(item)}>
      <View style={styles.userInfo}>
        <Text style={[styles.username, { color: colors.text }]}>
          {item.username ? `@${item.username}` : item.email}
        </Text>
        <Text style={[styles.subLabel, { color: colors.icon }]}>friend · tap to see favorites</Text>
      </View>
      <Text style={{ color: colors.icon, fontSize: 18 }}>›</Text>
    </TouchableOpacity>
  );

  const showSearch = query.length >= 2;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Friend Orders Modal */}
      <Modal
        visible={selectedFriend !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedFriend(null)}>
        <View style={friendStyles.overlay}>
          <View style={[friendStyles.sheet, { backgroundColor: colors.background }]}>
            <View style={[ss.row, { marginBottom: 16 }]}>
              <Text style={[friendStyles.sheetTitle, { color: colors.text, flex: 1 }]} numberOfLines={1}>
                {selectedFriend?.username ? `@${selectedFriend.username}` : selectedFriend?.email}
              </Text>
              <TouchableOpacity onPress={() => setSelectedFriend(null)} hitSlop={8}>
                <Text style={{ fontSize: 20, color: colors.icon }}>✕</Text>
              </TouchableOpacity>
            </View>
            {loadingFriendOrders ? (
              <ActivityIndicator color={burntPeach} style={{ marginTop: 16 }} />
            ) : (
              <FlatList
                data={friendOrders}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => <FriendOrderCard order={item} colors={colors} />}
                ListEmptyComponent={
                  <Text style={[friendStyles.emptyText, { color: colors.icon }]}>No saved orders yet.</Text>
                }
                contentContainerStyle={{ paddingBottom: 24 }}
              />
            )}
          </View>
        </View>
      </Modal>
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
              <>
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
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Friends</Text>
                <FlatList
                  data={friends}
                  keyExtractor={(item) => item._id}
                  renderItem={renderFriend}
                  contentContainerStyle={styles.listContent}
                  ListEmptyComponent={
                    <Text style={[styles.emptyText, { color: colors.icon, marginHorizontal: 16 }]}>
                      No friends yet.
                    </Text>
                  }
                />
              </>
            )
          }
        </>
      )}
    </View>
  );
}

const friendStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  card: {
    marginHorizontal: 0,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 13,
    marginBottom: 6,
  },
  chip: {
    fontSize: 13,
    fontWeight: '500',
  },
  orderDescContainer: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
  },
  orderDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 32,
  },
});

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
