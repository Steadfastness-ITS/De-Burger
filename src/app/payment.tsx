import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  type ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PaymentSuccessModal from '../components/PaymentSuccessModal';
import { getCharges, money } from '../data/pricing';
import { useApp } from '../data/AppState';
import { useRequireProfile } from '../data/useRequireProfile';

const NAVY = '#2B2F54';
const ORANGE = '#E56B00';
const INK = '#3B2F2F';
const RED = '#E5383B';
const SIDE = 19;

// ---------------------------------------------------------------------------
// Payment methods.
// To show your own card-brand logo, save the image in assets/images and set
//   logo: require('../../assets/images/your-logo.png')
// (path is relative to this file: src/app -> project root is ../../)
// Without a logo, a generic card icon is shown.
// ---------------------------------------------------------------------------
type Method = {
  id: 'credit' | 'debit';
  title: string;
  number: string;
  logo?: ImageSourcePropType;
};

const METHODS: Method[] = [
  { id: 'credit', title: 'Credit card', number: '5105 **** **** 0505' },
  { id: 'debit', title: 'Debit card', number: '3566 **** **** 0505' },
];

function MethodCard({
  method,
  selected,
  onPress,
}: {
  method: Method;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={[styles.method, selected ? styles.methodOn : styles.methodOff]}
    >
      <View
        style={[
          styles.logoBox,
          { backgroundColor: selected ? 'rgba(255,255,255,0.14)' : '#E6E8EE' },
        ]}
      >
        {method.logo ? (
          <Image source={method.logo} style={styles.logoImg} resizeMode="contain" />
        ) : (
          <Ionicons name="card" size={30} color={selected ? '#FFFFFF' : NAVY} />
        )}
      </View>

      <View style={{ flex: 1, marginLeft: 28 }}>
        <Text style={[styles.methodTitle, { color: selected ? '#FFFFFF' : INK }]}>
          {method.title}
        </Text>
        <Text style={styles.methodNumber}>{method.number}</Text>
      </View>

      <View style={[styles.radio, selected ? styles.radioOn : styles.radioOff]}>
        {selected && <View style={styles.radioDot} />}
      </View>
    </TouchableOpacity>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function PaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { placeOrder, clearCart, profile } = useApp();
  const requireProfile = useRequireProfile();
  const params = useLocalSearchParams<{ subtotal?: string; name?: string; emoji?: string; fromCart?: string }>();
  const itemName =
    (Array.isArray(params.name) ? params.name[0] : params.name) ?? 'food order';
  const fromCart =
    (Array.isArray(params.fromCart) ? params.fromCart[0] : params.fromCart) === '1';
  const emoji = (Array.isArray(params.emoji) ? params.emoji[0] : params.emoji) ?? '🍽️';
  const raw = Array.isArray(params.subtotal) ? params.subtotal[0] : params.subtotal;
  const parsed = Number(raw);
  const subtotal = Number.isFinite(parsed) ? parsed : 0;
  const charges = getCharges(subtotal);

  const [method, setMethod] = useState<Method['id']>('credit');
  const [saveCard, setSaveCard] = useState<boolean>(true);
  const [paying, setPaying] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [orderId] = useState<string>(() => `#DB-${1000 + (Date.now() % 9000)}`);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const bottomPad = Math.max(insets.bottom, 24);

  const onPay = () => {
    if (paying) return;
    if (!requireProfile()) return; // delivery needs a complete profile
    setPaying(true);
    // Short "processing" pause, then the success popup.
    timerRef.current = setTimeout(() => {
      setPaying(false);
      // Creates the "Order confirmed" notification (and later "Order delivered").
      placeOrder({ id: orderId, name: itemName, total: money(charges.total) });
      if (fromCart) clearCart(); // order came from the + quick-order cart
      setShowSuccess(true);
    }, 1400);
  };

  const onCloseSuccess = () => {
    setShowSuccess(false);
    router.dismissAll(); // back to the Home screen
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 14,
          paddingBottom: 140 + bottomPad,
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

        {/* Order summary */}
        <Text style={[styles.heading, { marginTop: 22 }]}>Order summary</Text>

        <View style={styles.summary}>
          <Row label="Order" value={money(charges.subtotal)} />
          <Row label="Taxes" value={money(charges.taxes)} />
          <Row label="Delivery fees" value={money(charges.delivery)} />

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{money(charges.total)}</Text>
          </View>
          <View style={[styles.row, { marginTop: 14 }]}>
            <Text style={styles.etaLabel}>Estimated delivery time:</Text>
            <Text style={styles.etaValue}>15 - 30mins</Text>
          </View>
        </View>

        {/* Payment methods */}
        <Text style={[styles.heading, { marginTop: 36 }]}>Delivering to</Text>
        <View style={styles.deliver}>
          <View style={styles.deliverIcon}>
            <Ionicons name="location" size={22} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            {profile ? (
              <>
                <Text style={styles.deliverName}>{profile.name}</Text>
                <Text style={styles.deliverText}>{profile.address}</Text>
                <Text style={styles.deliverText}>{profile.phone}</Text>
              </>
            ) : (
              <Text style={styles.deliverText}>Add your delivery details to continue</Text>
            )}
          </View>
          <TouchableOpacity
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.deliverChange}>{profile ? 'Change' : 'Add'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.heading, { marginTop: 36 }]}>Payment methods</Text>

        <View style={styles.methods}>
          {METHODS.map((m) => (
            <MethodCard
              key={m.id}
              method={m}
              selected={method === m.id}
              onPress={() => setMethod(m.id)}
            />
          ))}
        </View>

        {/* Save card */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.saveRow}
          onPress={() => setSaveCard((s) => !s)}
        >
          <View style={[styles.checkbox, !saveCard && styles.checkboxOff]}>
            {saveCard && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
          </View>
          <Text style={styles.saveText}>Save card details for future payments</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom bar: total price + Pay Now */}
      <View style={[styles.bottomBar, { paddingBottom: bottomPad }]}>
        <View>
          <Text style={styles.priceLabel}>Total price</Text>
          <Text style={styles.price}>
            <Text style={styles.dollar}>$</Text>
            {charges.total.toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.9}
          disabled={paying}
          style={styles.payBtn}
          onPress={onPay}
        >
          {paying ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.payText}>Pay Now</Text>
          )}
        </TouchableOpacity>
      </View>

      <PaymentSuccessModal
        visible={showSuccess}
        orderId={orderId}
        amount={money(charges.total)}
        emoji={emoji}
        itemName={itemName}
        onClose={onCloseSuccess}
        onTrack={onCloseSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIDE,
  },
  heading: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 21,
    color: INK,
    paddingHorizontal: SIDE,
  },
  summary: {
    paddingHorizontal: SIDE + 17,
    marginTop: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  rowLabel: {
    fontSize: 18,
    color: '#7A7A85',
  },
  rowValue: {
    fontSize: 18,
    color: '#7A7A85',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E8',
    marginTop: 6,
    marginBottom: 22,
  },
  totalLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
    color: '#1F2037',
  },
  totalValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
    color: '#1F2037',
  },
  etaLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13.5,
    color: '#1F2037',
  },
  etaValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13.5,
    color: '#1F2037',
  },
  deliver: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SIDE,
    marginTop: 14,
    padding: 14,
    borderRadius: 20,
    backgroundColor: '#F2F3F6',
  },
  deliverIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliverName: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#1F2037' },
  deliverText: { fontFamily: 'Poppins_400Regular', fontSize: 13, lineHeight: 19, color: '#5C5C68' },
  deliverChange: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: ORANGE },
  methods: {
    paddingHorizontal: SIDE,
    marginTop: 18,
  },
  method: {
    height: 92,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 5,
  },
  methodOn: {
    backgroundColor: INK,
  },
  methodOff: {
    backgroundColor: '#F2F3F6',
  },
  logoBox: {
    width: 70,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImg: {
    width: 56,
    height: 34,
  },
  methodTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14.5,
  },
  methodNumber: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14.5,
    color: '#8E8E98',
    marginTop: 8,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  radioOff: {
    borderWidth: 1.5,
    borderColor: '#D5D7DD',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  saveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIDE,
    marginTop: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    backgroundColor: RED,
    borderWidth: 1.5,
    borderColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOff: {
    backgroundColor: '#FFFFFF',
  },
  saveText: {
    fontSize: 16,
    color: '#7A7A85',
    marginLeft: 8,
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
  priceLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7A7A85',
  },
  price: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 34,
    color: '#111111',
  },
  dollar: {
    color: RED,
  },
  payBtn: {
    width: 209,
    height: 70,
    borderRadius: 20,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
