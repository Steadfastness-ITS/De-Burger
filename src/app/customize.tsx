import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BurgerImage from '../components/BurgerImage';
import SpicySlider from '../components/SpicySlider';
import ExtraCard from '../components/ExtraCard';
import { BURGERS } from '../data/burgers';
import { useRequireProfile } from '../data/useRequireProfile';
import { ADDONS, SIDES } from '../data/extras';

const NAVY = '#2B2F54';
const ORANGE = '#E56B00';
const INK = '#3B2F2F';
const RED = '#E5383B';
const SIDE = 19;
const MAX_PORTION = 20;

const first = (v?: string | string[]): string | undefined =>
  Array.isArray(v) ? v[0] : v;

const toNumber = (v: string | undefined, fallback: number): number => {
  if (v === undefined) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

// Customize screen: reached from the burger details screen.
// Route: /customize?id=1&spicy=0.6&portion=2
export default function CustomizeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const requireProfile = useRequireProfile();
  const params = useLocalSearchParams<{ id: string; spicy?: string; portion?: string }>();
  const burger = BURGERS.find((b) => b.id === first(params.id));

  const [spicy, setSpicy] = useState<number>(
    Math.min(1, Math.max(0, toNumber(first(params.spicy), burger?.spicy ?? 0.5)))
  );
  const [portion, setPortion] = useState<number>(
    Math.max(1, toNumber(first(params.portion), burger?.defaultPortion ?? 1))
  );
  const [toppings, setToppings] = useState<Record<string, boolean>>({});
  const [sides, setSides] = useState<Record<string, boolean>>({});

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

  const addon = ADDONS[burger.category];
  const canSpice = burger.category !== 'Drinks';
  const showSides = burger.category !== 'Drinks';

  const toppingsCost =
    addon.items.filter((t) => toppings[t.id]).reduce((sum, t) => sum + t.price, 0) * portion;
  const sidesCost = SIDES.filter((s) => sides[s.id]).reduce((sum, s) => sum + s.price, 0);
  const total = burger.unitPrice * portion + toppingsCost + sidesCost;
  const totalText = total.toFixed(2);

  const toggle = (
    setter: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
    id: string
  ) => setter((prev) => ({ ...prev, [id]: !prev[id] }));

  const onOrder = () => {
    if (!requireProfile()) return; // profile is needed for delivery
    router.push({ pathname: '/payment', params: { subtotal: totalText, name: burger.subtitle, emoji: burger.emoji } });
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

        {/* Burger image + customize controls */}
        <View style={styles.mainRow}>
          <View style={styles.leftCol}>
            <BurgerImage
              source={burger.image}
              resizeMode="cover"
              emojiSize={110}
              style={{ width: '100%', height: 320, borderRadius: 20 }}
            />
          </View>

          <View style={styles.rightCol}>
            <Text style={styles.blurb}>
              <Text style={styles.blurbBold}>Customize</Text> Your Burger to Your
              Tastes. Ultimate Experience
            </Text>

            {canSpice && (
              <>
                <Text style={[styles.optionLabel, { marginTop: 34 }]}>Spicy</Text>
                <View style={{ marginTop: 6 }}>
                  <SpicySlider value={spicy} onChange={setSpicy} />
                </View>
                <View style={styles.spicyLabels}>
                  <Text style={styles.mild}>Mild</Text>
                  <Text style={styles.hot}>Hot</Text>
                </View>
              </>
            )}

            <Text style={[styles.optionLabel, { marginTop: canSpice ? 36 : 60 }]}>Portion</Text>
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

        {/* Toppings */}
        <Text style={styles.heading}>{addon.title}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.rowScroll}
          contentContainerStyle={styles.rowContent}
        >
          {addon.items.map((t) => (
            <View key={t.id} style={styles.cardGap}>
              <ExtraCard
                name={t.name}
                emoji={t.emoji}
                image={t.image}
                selected={!!toppings[t.id]}
                onToggle={() => toggle(setToppings, t.id)}
              />
            </View>
          ))}
        </ScrollView>

        {showSides && (
          <>
            {/* Side options */}
            <Text style={[styles.heading, { marginTop: 14 }]}>Side options</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.rowScroll}
              contentContainerStyle={styles.rowContent}
            >
              {SIDES.map((s) => (
                <View key={s.id} style={styles.cardGap}>
                  <ExtraCard
                    name={s.name}
                    emoji={s.emoji}
                    image={s.image}
                    selected={!!sides[s.id]}
                    onToggle={() => toggle(setSides, s.id)}
                  />
                </View>
              ))}
            </ScrollView>
          </>
        )}
      </ScrollView>

      {/* Bottom bar: total + order button */}
      <View style={[styles.bottomBar, { paddingBottom: bottomPad }]}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.price}>
            <Text style={styles.dollar}>$</Text>
            {totalText}
          </Text>
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
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: SIDE,
    marginTop: 20,
  },
  leftCol: {
    flex: 1,
  },
  rightCol: {
    width: 162,
    marginLeft: 14,
  },
  blurb: {
    fontSize: 16,
    lineHeight: 28,
    color: '#555555',
    marginTop: 6,
  },
  blurbBold: {
    fontWeight: '700',
    color: INK,
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
  heading: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: INK,
    paddingHorizontal: SIDE,
    marginTop: 22,
  },
  rowScroll: {
    flexGrow: 0,
  },
  rowContent: {
    paddingHorizontal: SIDE,
    paddingTop: 12,
    paddingBottom: 16,
  },
  cardGap: {
    marginRight: 28,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIDE,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
  },
  totalLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: INK,
  },
  price: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 36,
    color: '#1A1A1A',
  },
  dollar: {
    color: RED,
  },
  orderBtn: {
    width: 200,
    height: 70,
    borderRadius: 20,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
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
