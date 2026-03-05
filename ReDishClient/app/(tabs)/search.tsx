import * as Location from 'expo-location';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { sharedStyles as ss } from '@/constants/sharedStyles';
import { Colors, burntPeach, cream, lightBlue, navajoWhite } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useApi } from '@/hooks/useApi';

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
const PLACES_BASE = 'https://places.googleapis.com/v1/places';
const FIELD_MASK = 'places.id,places.displayName,places.formattedAddress,places.rating,places.priceLevel,places.currentOpeningHours,places.businessStatus,places.photos';

type Place = {
  id: string;
  displayName: { text: string };
  formattedAddress?: string;
  rating?: number;
  priceLevel?: string;
  currentOpeningHours?: { openNow?: boolean };
  businessStatus?: string;
  photos?: { name: string }[];
};

const PRICE_LABELS: Record<string, string> = {
  PRICE_LEVEL_FREE: 'Free',
  PRICE_LEVEL_INEXPENSIVE: '$',
  PRICE_LEVEL_MODERATE: '$$',
  PRICE_LEVEL_EXPENSIVE: '$$$',
  PRICE_LEVEL_VERY_EXPENSIVE: '$$$$',
};

async function fetchNearby(lat: number, lng: number): Promise<Place[]> {
  const res = await fetch(`${PLACES_BASE}:searchNearby`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY!,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify({
      includedTypes: ['restaurant'],
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: 1500,
        },
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? 'Nearby search failed');
  return data.places ?? [];
}

async function fetchTextSearch(query: string, lat?: number, lng?: number): Promise<Place[]> {
  const body: Record<string, unknown> = {
    textQuery: query,
    includedType: 'restaurant',
    maxResultCount: 20,
  };
  if (lat !== undefined && lng !== undefined) {
    body.locationBias = {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: 5000,
      },
    };
  }
  const res = await fetch(`${PLACES_BASE}:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY!,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? 'Text search failed');
  return data.places ?? [];
}

function StarRating({ rating, color }: { rating: number; color: string }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);
  return (
    <Text style={{...styles.stars, color}}>
      {'★'.repeat(full)}
      {hasHalf ? '½' : ''}
      {'☆'.repeat(empty)}
      {` ${rating.toFixed(1)}`}
    </Text>
  );
}

function PlaceCard({
  place,
  colors,
  onAddOrder,
}: {
  place: Place;
  colors: (typeof Colors)['light'];
  onAddOrder: (place: Place) => void;
}) {
  const isOpen = place.currentOpeningHours?.openNow;
  const price = place.priceLevel ? PRICE_LABELS[place.priceLevel] : null;
  const photoName = place.photos?.[0]?.name;
  const photoUri = photoName
    ? `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=400&key=${API_KEY}`
    : null;

  return (
    <View style={{...styles.card, backgroundColor: colors.background, borderColor: colors.secondary}}>
      <View style={ss.row}>
        {photoUri && (
          <Image source={{ uri: photoUri }} style={styles.cardPhoto} resizeMode="cover" />
        )}
        <View style={styles.cardBody}>
          <Text style={{...styles.cardName, color: colors.text}} numberOfLines={1}>
            {place.displayName.text}
          </Text>
          {place.formattedAddress && (
            <Text style={{...styles.cardAddress, color: colors.icon}} numberOfLines={2}>
              {place.formattedAddress}
            </Text>
          )}
          <View style={{...ss.row, gap: 8}}>
            {place.rating !== undefined && <StarRating rating={place.rating} color={colors.text} />}
            {price && <Text style={{...styles.metaChip, color: colors.text}}>{price}</Text>}
            {isOpen !== undefined && (
              <Text style={{...styles.metaChip, color: isOpen ? lightBlue : burntPeach}}>
                {isOpen ? 'Open' : 'Closed'}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={{...styles.addOrderBtn, backgroundColor: burntPeach}}
            onPress={() => onAddOrder(place)}>
            <Text style={{...styles.addOrderBtnText, color: cream}}>+ Add Order</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const api = useApi();

  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

  const [orderModalPlace, setOrderModalPlace] = useState<Place | null>(null);
  const [orderDescription, setOrderDescription] = useState('');
  const [savingOrder, setSavingOrder] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Request location and load nearby on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationDenied(true);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
      setLocationCoords(coords);
      loadNearby(coords.lat, coords.lng);
    })();
  }, []);

  const loadNearby = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    try {
      const results = await fetchNearby(lat, lng);
      setPlaces(results);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!text.trim()) {
      // Return to nearby if query cleared
      if (locationCoords) loadNearby(locationCoords.lat, locationCoords.lng);
      else setPlaces([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await fetchTextSearch(
          text,
          locationCoords?.lat,
          locationCoords?.lng
        );
        setPlaces(results);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Search failed');
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const handleRefreshNearby = () => {
    if (locationCoords) {
      setQuery('');
      loadNearby(locationCoords.lat, locationCoords.lng);
    }
  };

  const handleAddOrder = (place: Place) => {
    setOrderModalPlace(place);
    setOrderDescription('');
  };

  const handleSaveOrder = async () => {
    if (!orderModalPlace || !orderDescription.trim()) return;
    setSavingOrder(true);
    try {
      await api.saveOrder(orderDescription.trim(), {
        googlePlaceId: orderModalPlace.id,
        name: orderModalPlace.displayName.text,
        address: orderModalPlace.formattedAddress,
        rating: orderModalPlace.rating,
        priceLevel: orderModalPlace.priceLevel,
      });
      setOrderModalPlace(null);
      Alert.alert('Saved!', 'Your order has been saved.');
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to save order');
    } finally {
      setSavingOrder(false);
    }
  };

  const listHeader = (
    <View style={styles.listHeader}>
      <Text style={{...styles.metaChip, color: colors.icon}}>
        {query.trim() ? `Results for "${query}"` : 'Restaurants near you'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{...styles.container, backgroundColor: colors.background}}>
      <Modal
        visible={orderModalPlace !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setOrderModalPlace(null)}>
        <View style={styles.modalOverlay}>
          <View style={{...styles.modalCard, backgroundColor: colors.background}}>
            <Text style={{...styles.modalTitle, color: colors.text}} numberOfLines={1}>
              {orderModalPlace?.displayName.text}
            </Text>
            <Text style={{...styles.modalLabel, color: colors.icon}}>Describe your order</Text>
            <TextInput
              style={{...styles.modalInput, color: colors.text, borderColor: navajoWhite}}
              placeholder="e.g. Spicy chicken sandwich, no pickles..."
              placeholderTextColor={colors.icon}
              value={orderDescription}
              onChangeText={setOrderDescription}
              multiline
              autoFocus
            />
            <View style={{...ss.row, gap: 12, marginTop: 12}}>
              <TouchableOpacity
                style={{...styles.modalBtn, borderColor: navajoWhite, borderWidth: 1}}
                onPress={() => setOrderModalPlace(null)}>
                <Text style={{color: colors.text}}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{...styles.modalBtn, backgroundColor: burntPeach, opacity: savingOrder ? 0.6 : 1}}
                onPress={handleSaveOrder}
                disabled={savingOrder || !orderDescription.trim()}>
                {savingOrder
                  ? <ActivityIndicator size="small" color={cream} />
                  : <Text style={{color: cream, fontWeight: '600'}}>Save Order</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Search bar */}
      <View style={{...ss.row, ...ss.fieldBorder, ...styles.searchRow, borderColor: navajoWhite}}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={{...styles.searchInput, color: colors.text}}
          placeholder="Search restaurants..."
          placeholderTextColor={colors.icon}
          value={query}
          onChangeText={handleQueryChange}
          returnKeyType="search"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => handleQueryChange('')}>
            <Text style={{...styles.clearBtn, color: colors.icon}}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Near me button */}
      {!locationDenied && (
        <TouchableOpacity
          style={{...styles.nearMeBtn, backgroundColor: burntPeach}}
          onPress={handleRefreshNearby}>
          <Text style={{...styles.nearMeBtnText, color: cream}}>📍 Near me</Text>
        </TouchableOpacity>
      )}

      {locationDenied && (
        <Text style={{...styles.notice, color: colors.icon}}>
          Enable location permissions to find nearby restaurants.
        </Text>
      )}

      {/* Results */}
      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={burntPeach} />
        </View>
      )}

      {!loading && error && (
        <View style={styles.center}>
          <Text style={{...styles.errorText, color: burntPeach}}>{error}</Text>
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={places}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PlaceCard place={item} colors={colors} onAddOrder={handleAddOrder} />}
          ListHeaderComponent={places.length > 0 ? listHeader : null}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{...styles.errorText, color: colors.icon}}>No restaurants found.</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
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
  nearMeBtn: {
    alignSelf: 'flex-start',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  nearMeBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  notice: {
    marginHorizontal: 16,
    marginBottom: 8,
    fontSize: 13,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    marginHorizontal: 24,
  },
  listContent: {
    paddingBottom: 24,
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardPhoto: {
    width: 90,
    height: 90,
  },
  cardBody: {
    flex: 1,
    padding: 12,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardAddress: {
    fontSize: 13,
    marginBottom: 6,
  },
  stars: {
    fontSize: 13,
  },
  metaChip: {
    fontSize: 13,
    fontWeight: '500',
  },
  addOrderBtn: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  addOrderBtnText: {
    fontSize: 12,
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
