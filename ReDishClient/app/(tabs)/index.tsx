import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { sharedStyles as ss } from '@/constants/sharedStyles';
import { Colors, burntPeach, cream, navajoWhite } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Order, useApi } from '@/hooks/useApi';

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

function OrderCard({
  order,
  colors,
  onEdit,
  onDelete,
}: {
  order: Order;
  colors: (typeof Colors)['light'];
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
}) {
  const loc = order.locationId;
  const price = loc.priceLevel ? PRICE_LABELS[loc.priceLevel] : null;

  return (
    <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.secondary }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.locationName, { color: colors.text }]} numberOfLines={1}>
          {loc.name}
        </Text>
        <View style={ss.row}>
          <TouchableOpacity onPress={() => onEdit(order)} style={styles.iconBtn} hitSlop={8}>
            <Text style={[styles.iconBtnText, { color: colors.icon }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(order)} style={styles.iconBtn} hitSlop={8}>
            <Text style={[styles.iconBtnText, { color: burntPeach }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
      {loc.address ? (
        <Text style={[styles.locationAddress, { color: colors.icon }]} numberOfLines={1}>
          {loc.address}
        </Text>
      ) : null}
      <View style={[ss.row, { gap: 8, marginBottom: 8 }]}>
        {loc.rating !== undefined && <StarRating rating={loc.rating} color={colors.text} />}
        {price ? <Text style={[styles.chip, { color: colors.text }]}>{price}</Text> : null}
      </View>
      <View style={[styles.orderDescContainer, { backgroundColor: colors.secondary + '55', borderColor: colors.secondary }]}>
        <Text style={[styles.orderDesc, { color: colors.text }]}>{order.description}</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const api = useApi();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteOrder, setDeleteOrder] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const { orders: fetched } = await api.getOrders();
      setOrders(fetched);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders(true);
  };

  const handleEdit = (order: Order) => {
    setEditOrder(order);
    setEditDescription(order.description);
  };

  const handleSaveEdit = async () => {
    if (!editOrder || !editDescription.trim()) return;
    setSaving(true);
    try {
      const { order: updated } = await api.updateOrder(editOrder._id, editDescription.trim());
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
      setEditOrder(null);
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (order: Order) => {
    setDeleteOrder(order);
  };

  const handleConfirmDelete = async () => {
    if (!deleteOrder) return;
    setDeleting(true);
    try {
      await api.deleteOrder(deleteOrder._id);
      setOrders((prev) => prev.filter((o) => o._id !== deleteOrder._id));
      setDeleteOrder(null);
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to delete order');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = query.trim()
    ? orders.filter(
        (o) =>
          o.description.toLowerCase().includes(query.toLowerCase()) ||
          o.locationId.name.toLowerCase().includes(query.toLowerCase())
      )
    : orders;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Edit Modal */}
      <Modal
        visible={editOrder !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setEditOrder(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]} numberOfLines={1}>
              {editOrder?.locationId.name}
            </Text>
            <Text style={[styles.modalLabel, { color: colors.icon }]}>Edit your order</Text>
            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: navajoWhite }]}
              placeholder="Describe your order..."
              placeholderTextColor={colors.icon}
              value={editDescription}
              onChangeText={setEditDescription}
              multiline
              autoFocus
            />
            <View style={[ss.row, { gap: 12, marginTop: 12 }]}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: navajoWhite, borderWidth: 1 }]}
                onPress={() => setEditOrder(null)}>
                <Text style={{ color: colors.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: burntPeach, opacity: saving ? 0.6 : 1 }]}
                onPress={handleSaveEdit}
                disabled={saving || !editDescription.trim()}>
                {saving ? (
                  <ActivityIndicator size="small" color={cream} />
                ) : (
                  <Text style={{ color: cream, fontWeight: '600' }}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteOrder !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setDeleteOrder(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]} numberOfLines={1}>
              {deleteOrder?.locationId.name}
            </Text>
            <Text style={[styles.modalLabel, { color: colors.icon }]}>
              Remove your order from this restaurant?
            </Text>
            <View style={[ss.row, { gap: 12, marginTop: 12 }]}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: navajoWhite, borderWidth: 1 }]}
                onPress={() => setDeleteOrder(null)}>
                <Text style={{ color: colors.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: burntPeach, opacity: deleting ? 0.6 : 1 }]}
                onPress={handleConfirmDelete}
                disabled={deleting}>
                {deleting ? (
                  <ActivityIndicator size="small" color={cream} />
                ) : (
                  <Text style={{ color: cream, fontWeight: '600' }}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Search bar */}
      <View style={[ss.row, ss.fieldBorder, styles.searchRow, { borderColor: navajoWhite }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search orders or restaurants..."
          placeholderTextColor={colors.icon}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Text style={[styles.clearBtn, { color: colors.icon }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={burntPeach} />
        </View>
      )}

      {!loading && error && (
        <View style={styles.center}>
          <Text style={[styles.notice, { color: burntPeach }]}>{error}</Text>
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              colors={colors}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={burntPeach} />
          }
          ListHeaderComponent={
            orders.length > 0 ? (
              <Text style={[styles.sectionLabel, { color: colors.icon }]}>
                {query.trim()
                  ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`
                  : 'Your favorite orders'}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={[styles.notice, { color: colors.icon }]}>
                {orders.length === 0
                  ? 'No saved orders yet.\nSearch for a restaurant and add an order!'
                  : 'No orders match your search.'}
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
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
    marginBottom: 12,
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
  sectionLabel: {
    fontSize: 13,
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  notice: {
    fontSize: 15,
    textAlign: 'center',
    marginHorizontal: 24,
    lineHeight: 22,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
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
  iconBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  iconBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
});
