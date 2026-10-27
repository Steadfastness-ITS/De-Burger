import React, { useEffect, useRef } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BurgerImage from './BurgerImage';
import { BURGERS } from '../data/burgers';
import { useApp } from '../data/AppState';
import { isProfileComplete } from '../data/profile';
import { useRequireProfile } from '../data/useRequireProfile';

const NAVY = '#2B2F54';
const ORANGE = '#E56B00';
const INK = '#3B2F2F';
const RED = '#E5383B';

// Cart card sizes. The food photo is a fixed-size box on the LEFT of the card,
// so it can never grow over the text (name, details, price) or the buttons.
const CARD_H = 96; // height of each cart card
const PHOTO_W = 100; // width of the photo (raise it for a wider photo)
const BORDER = 1.5; // the card's border width
const PHOTO_H = CARD_H - BORDER * 2; // photo is as tall as the inside of the card

type Props = {
  visible: boolean;
  onClose: () => void;
};

// Opened by the orange + button on Home. Lets the user build an order from
// several burgers at once (the cart), then check out in one payment.
export default function QuickOrderSheet({ visible, onClose }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cart, cartCount, addToCart, decFromCart, clearCart, profile } = useApp();
  const requireProfile = useRequireProfile();
  const profileReady = isProfileComplete(profile);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const subtotal = BURGERS.reduce((sum, b) => sum + b.unitPrice * (cart[b.id] ?? 0), 0);
  const single = BURGERS.filter((b) => (cart[b.id] ?? 0) > 0);
  const orderName =
    single.length === 1 && cartCount === 1 ? single[0].subtitle : `${cartCount}-item order`;
  const orderEmoji = single.length === 1 ? single[0].emoji : '🍽️';

  const onCheckout = () => {
    if (cartCount === 0) return;
    onClose();
    // Wait for the sheet to finish closing before navigating (avoids an iOS glitch).
    timer.current = setTimeout(() => {
      if (!requireProfile()) return; // opens profile set-up first
      router.push({
        pathname: '/payment',
        params: { subtotal: subtotal.toFixed(2), name: orderName, emoji: orderEmoji, fromCart: '1' },
      });
    }, 280);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <View style={styles.grabber} />

          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Quick order</Text>
              <Text style={styles.sub}>
                {cartCount === 0
                  ? 'Tap + to add items to your order'
                  : `${cartCount} item${cartCount > 1 ? 's' : ''} in your order`}
              </Text>
            </View>
            <View style={styles.headerRight}>
              {cartCount > 0 && (
                <TouchableOpacity
                  onPress={clearCart}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.clear}>Clear</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={onClose}
                style={{ marginLeft: 18 }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={28} color={NAVY} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {BURGERS.map((b) => {
              const qty = cart[b.id] ?? 0;
              return (
                <View key={b.id} style={[styles.row, qty > 0 && styles.rowOn]}>
                  <View style={styles.thumb}>
                    <BurgerImage
                      source={b.image}
                      resizeMode="cover"
                      fallback={b.emoji}
                      emojiSize={34}
                      style={{ width: PHOTO_W, height: PHOTO_H }}
                    />
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.name} numberOfLines={1}>
                      {b.subtitle}
                    </Text>
                    <Text style={styles.meta} numberOfLines={1}>
                      {b.name} · {b.time} min
                    </Text>
                    <Text style={styles.price}>${b.unitPrice.toFixed(2)}</Text>
                  </View>

                  {qty === 0 ? (
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.addBtn}
                      onPress={() => addToCart(b.id)}
                      accessibilityLabel={`Add ${b.subtitle}`}
                    >
                      <Ionicons name="add" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.stepper}>
                      <TouchableOpacity
                        style={styles.stepBtnLight}
                        onPress={() => decFromCart(b.id)}
                        accessibilityLabel={`Remove one ${b.subtitle}`}
                      >
                        <Ionicons name="remove" size={20} color={NAVY} />
                      </TouchableOpacity>
                      <Text style={styles.qty}>{qty}</Text>
                      <TouchableOpacity
                        style={styles.stepBtn}
                        onPress={() => addToCart(b.id)}
                        accessibilityLabel={`Add one more ${b.subtitle}`}
                      >
                        <Ionicons name="add" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            <View>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.total}>
                <Text style={{ color: RED }}>$</Text>
                {subtotal.toFixed(2)}
              </Text>
              <Text style={[styles.note, !profileReady && { color: ORANGE }]}>
                {profileReady
                  ? 'Taxes and delivery added at payment'
                  : 'Set up your profile to check out'}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.9}
              disabled={cartCount === 0}
              style={[styles.checkout, cartCount === 0 && styles.checkoutOff]}
              onPress={onCheckout}
            >
              <Text style={styles.checkoutText}>CHECKOUT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(20, 24, 40, 0.5)',
  },
  sheet: {
    height: '78%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 19,
    paddingTop: 10,
  },
  grabber: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E1E2E7',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 22,
    color: INK,
  },
  sub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#7A7A85',
    marginTop: 2,
  },
  clear: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: RED,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: CARD_H,
    paddingRight: 12, // no left/top/bottom padding, so the photo reaches those edges
    overflow: 'hidden', // clips the photo to the card's rounded corners
    borderRadius: 20,
    backgroundColor: '#F7F8FA',
    marginBottom: 12,
    borderWidth: BORDER,
    borderColor: 'transparent',
  },
  rowOn: {
    backgroundColor: '#FFF6EE',
    borderColor: '#F7D3B0',
  },
  thumb: {
    width: PHOTO_W,
    height: PHOTO_H,
    overflow: 'hidden',
    backgroundColor: '#F2F3F5',
  },
  name: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: '#1F2037',
  },
  meta: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12.5,
    color: '#7A7A85',
    marginTop: 1,
  },
  price: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: ORANGE,
    marginTop: 4,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnLight: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#E6E8EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: {
    minWidth: 30,
    textAlign: 'center',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
    color: NAVY,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEFF3',
  },
  totalLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#7A7A85',
  },
  total: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 30,
    color: '#111111',
  },
  note: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#9A9BA5',
  },
  checkout: {
    width: 170,
    height: 62,
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
  checkoutOff: {
    backgroundColor: '#D5D7DD',
    shadowOpacity: 0,
    elevation: 0,
  },
  checkoutText: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: '#FFFFFF',
  },
});
