import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BurgerImage from '../components/BurgerImage';
import BottomNav, { type TabKey } from '../components/BottomNav';
import NotificationBell from '../components/NotificationBell';
import QuickOrderSheet from '../components/QuickOrderSheet';
import { useApp } from '../data/AppState';
import { BURGERS, CATEGORIES } from '../data/burgers';

const NAVY = '#2B2F54';
const ORANGE = '#E56B00';
const SIDE = 19; // screen side padding
const GAP = 22; // gap between the two cards

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [query, setQuery] = useState<string>('');
  const [category, setCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [orderOpen, setOrderOpen] = useState<boolean>(false);
  const { cartCount, favorites, toggleFavorite } = useApp();

  const cardWidth = (width - SIDE * 2 - GAP) / 2;
  const showFavorites = activeTab === 'favorites';

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BURGERS.filter((b) => {
      // Heart tab: only burgers the user has hearted.
      if (showFavorites && !favorites[b.id]) return false;
      const inCategory = category === 'All' || b.categories.includes(category);
      const matches =
        q === '' ||
        b.name.toLowerCase().includes(q) ||
        b.subtitle.toLowerCase().includes(q);
      return inCategory && matches;
    });
  }, [query, category, favorites, showFavorites]);


  const onTabChange = (tab: TabKey) => {
    if (tab === 'chat') {
      router.push('/support'); // customer support screen
      return;
    }
    if (tab === 'profile') {
      router.push('/profile'); // profile (set-up form if no profile yet)
      return;
    }
    setActiveTab(tab);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: 170 + insets.bottom,
        }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: SIDE }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>De-Burger</Text>
            <Text style={styles.subtitle}>
              {showFavorites ? 'Your favourite meals' : 'Order your favourite meal!'}
            </Text>
          </View>
          <NotificationBell />
        </View>

        {/* Search + filter */}
        <View style={[styles.searchRow, { paddingHorizontal: SIDE }]}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={26} color="#2B2B3A" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search"
              placeholderTextColor="#2B2B3A"
              style={styles.searchInput}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity activeOpacity={0.85} style={styles.filterBtn}>
            <Ionicons name="options-outline" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={{ paddingHorizontal: SIDE, paddingVertical: 14 }}
        >
          {CATEGORIES.map((c) => {
            const active = c === category;
            return (
              <TouchableOpacity
                key={c}
                activeOpacity={0.85}
                onPress={() => setCategory(c)}
                style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}
              >
                <Text style={[styles.chipText, active && { color: '#FFFFFF' }]}>
                  {c}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Burger grid */}
        <View style={[styles.grid, { paddingHorizontal: SIDE }]}>
          {data.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.92}
              style={[styles.card, { width: cardWidth }]}
              onPress={() =>
                router.push({ pathname: '/burger/[id]', params: { id: item.id } })
              }
            >
              {/* Photos fill the card body to the sides and top (cover). */}
              <View style={[styles.cardPhoto, { width: cardWidth }]}>
                <BurgerImage
                  source={item.image}
                  resizeMode="cover"
                  style={{ width: '100%', height: '100%' }}
                  fallback={item.emoji}
                  emojiSize={70}
                />
              </View>
              {/* Heading = the item's subtitle, sub heading = its name. */}
              <Text style={styles.cardName} numberOfLines={1}>
                {item.subtitle}
              </Text>
              <Text style={styles.cardSub} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.cardFooter}>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={18} color="#F58A2B" />
                  <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                </View>
                <TouchableOpacity
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  onPress={() => toggleFavorite(item.id)}
                >
                  <Ionicons
                    name={favorites[item.id] ? 'heart' : 'heart-outline'}
                    size={26}
                    color={favorites[item.id] ? '#E5383B' : '#2B2B3A'}
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {data.length === 0 && (
          <Text style={styles.empty}>
            {showFavorites
              ? 'No favourites yet. Tap the heart on any item to save it here.'
              : 'Nothing found'}
          </Text>
        )}
      </ScrollView>

      <BottomNav
        activeTab={activeTab}
        onChange={onTabChange}
        onAdd={() => setOrderOpen(true)}
        addBadge={cartCount}
      />

      <QuickOrderSheet visible={orderOpen} onClose={() => setOrderOpen(false)} />
    </View>
  );
}

const shadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.12,
  shadowRadius: 12,
  elevation: 5,
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: 'LobsterTwo_700Bold_Italic',
    fontSize: 52,
    color: NAVY,
    includeFontPadding: false,
    lineHeight: 64,
  },
  subtitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#6B6B75',
    marginTop: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 26,
  },
  searchBox: {
    flex: 1,
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    ...shadow,
  },
  searchInput: {
    flex: 1,
    marginLeft: 16,
    fontFamily: 'Poppins_500Medium',
    fontSize: 17,
    color: '#1F2037',
    paddingVertical: 0,
  },
  filterBtn: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  chipScroll: {
    marginTop: 18,
    flexGrow: 0,
  },
  chip: {
    height: 50,
    paddingHorizontal: 26,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  chipIdle: {
    backgroundColor: '#F2F3F5',
  },
  chipActive: {
    backgroundColor: ORANGE,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  chipText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#7A7A85',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 14,
    marginBottom: 31,
    ...shadow,
  },
  // Full-bleed photo: cancels the card's padding (12 sides, 14 top) so the
  // picture touches the card's left, right and top edges. Height = 118 + 14,
  // so the text underneath lines up with the other cards.
  cardPhoto: {
    height: 132,
    marginLeft: -12,
    marginTop: -14,
    marginBottom: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F2F3F5',
  },
  cardName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: '#1F2037',
    paddingHorizontal: 2,
  },
  cardSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: '#2B2B3A',
    paddingHorizontal: 2,
    marginTop: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: '#1F2037',
    marginLeft: 6,
  },
  empty: {
    textAlign: 'center',
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#7A7A85',
    marginTop: 30,
  },
});
