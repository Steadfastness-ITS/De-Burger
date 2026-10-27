import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BurgerImage from '../../components/BurgerImage';
import SpicySlider from '../../components/SpicySlider';
import { BURGERS } from '../../data/burgers';

const NAVY = '#2B2F54';
const ORANGE = '#E56B00';
const INK = '#3B2F2F';
const SIDE = 19;
const MAX_PORTION = 20;

// Third & fourth screens: one details screen that shows whichever burger
// was tapped on the Home screen (route: /burger/[id]).
export default function BurgerDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const burger = BURGERS.find((b) => b.id === id);

  const [spicy, setSpicy] = useState<number>(burger?.spicy ?? 0.5);
  const [portion, setPortion] = useState<number>(burger?.defaultPortion ?? 1);

  const imageHeight = Math.min(height * 0.38, 380);
  const bottomPad = Math.max(insets.bottom, 24);

  if (!burger) {
    return (
      <View style={[styles.root, styles.center]}>
        <StatusBar style="dark" />
        <Text style={styles.notFound}>Burger not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const total = (burger.unitPrice * portion).toFixed(2);

  // Order Now -> Payment screen
  const onOrder = () => {
    router.push({ pathname: '/payment', params: { subtotal: total } });
  };

  // Customize -> Customize screen (carries over the current spice level + portion)
  const onCustomize = () => {
    router.push({
      pathname: '/customize',
      params: { id: burger.id, spicy: String(spicy), portion: String(portion) },
    });
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 14,
          paddingBottom: 130 + bottomPad,
        }}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={28} color={INK} />
          </TouchableOpacity>
          <TouchableOpacity hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="search" size={26} color={INK} />
          </TouchableOpacity>
        </View>

        {/* Burger image */}
        <BurgerImage
          source={burger.image}
          resizeMode="cover"
          emojiSize={120}
          style={{ width: '100%', height: imageHeight, marginTop: 6 }}
        />

        {/* Title, rating, description */}
        <View style={styles.content}>
          <Text style={styles.title}>
            {burger.name} {burger.subtitle}
          </Text>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={18} color="#F58A2B" />
            <Text style={styles.ratingText}>{burger.rating.toFixed(1)}</Text>
            <Text style={styles.dash}>—</Text>
            <Text style={styles.ratingText}>{burger.time} mins</Text>
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.customizeBtn}
              onPress={onCustomize}
            >
              <Ionicons name="options-outline" size={16} color={ORANGE} />
              <Text style={styles.customizeText}>Customize</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>{burger.description}</Text>
        </View>

        {/* Spicy slider + portion stepper */}
        <View style={styles.optionsRow}>
          <View style={styles.spicyBox}>
            <Text style={styles.optionLabel}>Spicy</Text>
            <View style={{ marginTop: 6 }}>
              <SpicySlider value={spicy} onChange={setSpicy} />
            </View>
            <View style={styles.spicyLabels}>
              <Text style={styles.mild}>Mild</Text>
              <Text style={styles.hot}>Hot</Text>
            </View>
          </View>

          <View>
            <Text style={styles.optionLabel}>Portion</Text>
            <View style={styles.stepper}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.stepBtn}
                onPress={() => setPortion((p) => Math.max(1, p - 1))}
              >
                <Ionicons name="remove" size={26} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.portionText}>{portion}</Text>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.stepBtn}
                onPress={() => setPortion((p) => Math.min(MAX_PORTION, p + 1))}
              >
                <Ionicons name="add" size={26} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom bar: price + order button */}
      <View style={[styles.bottomBar, { paddingBottom: bottomPad }]}>
        <View style={styles.priceBtn}>
          <Text style={styles.priceText}>${total}</Text>
        </View>
        <TouchableOpacity activeOpacity={0.9} style={styles.orderBtn} onPress={onOrder}>
          <Text style={styles.orderText}>ORDER NOW</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFound: {
    fontSize: 18,
    color: INK,
  },
  backLink: {
    marginTop: 14,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: NAVY,
  },
  backLinkText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIDE,
  },
  content: {
    paddingHorizontal: SIDE,
    marginTop: 18,
  },
  title: {
    fontSize: 25,
    fontWeight: '600',
    color: INK,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7A7A7A',
    marginLeft: 6,
  },
  dash: {
    fontSize: 15,
    color: '#BDBDBD',
    marginLeft: 8,
  },
  customizeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: ORANGE,
  },
  customizeText: {
    fontSize: 13,
    fontWeight: '600',
    color: ORANGE,
    marginLeft: 5,
  },
  description: {
    fontSize: 16,
    lineHeight: 28,
    color: '#6B6B6B',
    marginTop: 18,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: SIDE,
    marginTop: 34,
  },
  spicyBox: {
    width: 171,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: NAVY,
  },
  spicyLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  mild: {
    fontSize: 12,
    fontWeight: '600',
    color: '#17B717',
  },
  hot: {
    fontSize: 12,
    fontWeight: '600',
    color: NAVY,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  portionText: {
    width: 41,
    textAlign: 'center',
    fontSize: 20,
    color: NAVY,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIDE,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
  },
  priceBtn: {
    width: 104,
    height: 70,
    borderRadius: 20,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  priceText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  orderBtn: {
    flex: 1,
    height: 70,
    marginLeft: 36,
    borderRadius: 20,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  orderText: {
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: '#FFFFFF',
  },
});
