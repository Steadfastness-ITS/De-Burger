import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp, type Order } from '../data/AppState';

const NAVY = '#2B2F54';
const ORANGE = '#E56B00';
const INK = '#3B2F2F';
const GREEN = '#0BAA5E';
const SIDE = 19;

const formatDate = (ms: number): string => {
  const d = new Date(ms);
  const day = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${day}, ${time}`;
};

function OrderCard({ order, onHelp }: { order: Order; onHelp: () => void }) {
  const delivered = order.status === 'delivered';
  const color = delivered ? GREEN : ORANGE;
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.orderId}>{order.id}</Text>
        <View style={[styles.chip, { backgroundColor: color }]}>
          <Text style={styles.chipText}>{delivered ? 'Delivered' : 'Confirmed'}</Text>
        </View>
      </View>

      <View style={styles.midRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>
            {order.name}
          </Text>
          <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
        </View>
        <Text style={styles.total}>{order.total}</Text>
      </View>

      {!!order.address && (
        <View style={styles.addrRow}>
          <Ionicons name="location-outline" size={18} color="#7A7A85" />
          <Text style={styles.addr} numberOfLines={2}>
            {order.address}
          </Text>
        </View>
      )}

      {!delivered && (
        <TouchableOpacity onPress={onHelp} style={styles.help}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={ORANGE} />
          <Text style={styles.helpText}>Ask support about this order</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orders } = useApp();

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <View style={[styles.topBar, { paddingTop: insets.top + 14 }]}>
        <TouchableOpacity
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          onPress={() => router.back()}
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={28} color={INK} />
        </TouchableOpacity>
        <Text style={styles.title}>Order history</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: SIDE,
          paddingTop: 10,
          paddingBottom: Math.max(insets.bottom, 24) + 20,
          flexGrow: 1,
        }}
      >
        {orders.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={56} color="#B5B7C0" />
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptyText}>
              Your confirmed and delivered orders will show up here.
            </Text>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.cta}
              onPress={() => router.dismissAll()}
            >
              <Text style={styles.ctaText}>Browse the menu</Text>
            </TouchableOpacity>
          </View>
        ) : (
          orders.map((o) => (
            <OrderCard key={o.id} order={o} onHelp={() => router.push('/support')} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIDE,
    paddingBottom: 10,
  },
  title: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, color: INK },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderId: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#7A7A85' },
  chip: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  chipText: { fontFamily: 'Poppins_500Medium', fontSize: 12, color: '#FFFFFF' },
  midRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  name: { fontFamily: 'Poppins_600SemiBold', fontSize: 17, color: '#1F2037' },
  date: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#7A7A85', marginTop: 2 },
  total: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, color: NAVY, marginLeft: 12 },
  addrRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 12 },
  addr: {
    flex: 1,
    marginLeft: 6,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    lineHeight: 19,
    color: '#5C5C68',
  },
  help: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  helpText: { fontFamily: 'Poppins_500Medium', fontSize: 13.5, color: ORANGE, marginLeft: 8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, color: INK, marginTop: 14 },
  emptyText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: '#7A7A85',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 30,
  },
  cta: {
    marginTop: 24,
    height: 56,
    paddingHorizontal: 32,
    borderRadius: 18,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { fontFamily: 'Poppins_500Medium', fontSize: 16, color: '#FFFFFF' },
});
