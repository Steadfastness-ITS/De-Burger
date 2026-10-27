import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Profile } from './profile';
import { resetSupportChat } from './supportChat';

const STORAGE_KEY = 'deburger:v1';

// For the demo, an order is "delivered" this long after it is confirmed.
// (Payment screen promises 15 - 30 mins; use e.g. 20 * 60 * 1000 with a real backend.)
export const DELIVERY_DEMO_MS = 30_000;
const MAX_QTY = 20;

export type OrderStatus = 'confirmed' | 'delivered';

export type Order = {
  id: string;
  name: string;
  total: string;
  status: OrderStatus;
  createdAt: number;
  // Snapshot of who/where the order is for at the time it was placed.
  customer: string;
  phone: string;
  address: string;
};

export type AppNotification = {
  id: string;
  kind: OrderStatus;
  title: string;
  body: string;
  time: number;
  read: boolean;
};

type AppState = {
  profile: Profile | null;
  saveProfile: (p: Profile) => void;
  logout: () => void;

  favorites: Record<string, boolean>;
  toggleFavorite: (id: string) => void;

  cart: Record<string, number>; // burger id -> quantity
  cartCount: number;
  addToCart: (id: string) => void;
  decFromCart: (id: string) => void;
  clearCart: () => void;

  orders: Order[]; // newest first
  placeOrder: (o: { id: string; name: string; total: string }) => void;

  notifications: AppNotification[]; // newest first
  unreadCount: number;
  markAllRead: () => void;
};

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [cart, setCart] = useState<Record<string, number>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const counter = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  const push = useCallback((kind: OrderStatus, title: string, body: string) => {
    counter.current += 1;
    const n: AppNotification = {
      id: `n${Date.now()}-${counter.current}`,
      kind,
      title,
      body,
      time: Date.now(),
      read: false,
    };
    setNotifications((prev) => [n, ...prev]);
  }, []);

  const scheduleDelivery = useCallback(
    (order: Order, delay: number) => {
      const t = setTimeout(() => {
        setOrders((prev) =>
          prev.map((x) => (x.id === order.id ? { ...x, status: 'delivered' } : x))
        );
        push(
          'delivered',
          'Order delivered',
          `Your order ${order.id} (${order.name}) has been delivered. Enjoy your meal!`
        );
      }, Math.max(0, delay));
      timers.current.push(t);
    },
    [push]
  );

  // Load everything saved on this device, once, before showing the app.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && alive) {
          const d = JSON.parse(raw);
          const saved: Order[] = Array.isArray(d.orders) ? d.orders : [];
          setProfile(d.profile ?? null);
          setFavorites(d.favorites ?? {});
          setCart(d.cart ?? {});
          setOrders(saved);
          setNotifications(Array.isArray(d.notifications) ? d.notifications : []);
          // Orders still "confirmed" when the app was closed keep progressing.
          saved
            .filter((o) => o.status === 'confirmed')
            .forEach((o) => scheduleDelivery(o, o.createdAt + DELIVERY_DEMO_MS - Date.now()));
        }
      } catch {
        // Corrupt or unavailable storage: start fresh.
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [scheduleDelivery]);

  // Save whenever something changes (after the first load).
  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        profile,
        favorites,
        cart,
        orders: orders.slice(0, 100),
        notifications: notifications.slice(0, 50),
      })
    ).catch(() => {});
  }, [ready, profile, favorites, cart, orders, notifications]);

  const saveProfile = useCallback((p: Profile) => setProfile(p), []);

  const logout = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setProfile(null);
    setFavorites({});
    setCart({});
    setOrders([]);
    setNotifications([]);
    resetSupportChat(); // next login starts with a blank support chat
  }, []);

  const toggleFavorite = useCallback(
    (id: string) => setFavorites((p) => ({ ...p, [id]: !p[id] })),
    []
  );

  const addToCart = useCallback(
    (id: string) =>
      setCart((p) => ({ ...p, [id]: Math.min(MAX_QTY, (p[id] ?? 0) + 1) })),
    []
  );
  const decFromCart = useCallback(
    (id: string) =>
      setCart((p) => {
        const q = (p[id] ?? 0) - 1;
        const next = { ...p };
        if (q <= 0) delete next[id];
        else next[id] = q;
        return next;
      }),
    []
  );
  const clearCart = useCallback(() => setCart({}), []);

  const placeOrder = useCallback(
    (o: { id: string; name: string; total: string }) => {
      const order: Order = {
        ...o,
        status: 'confirmed',
        createdAt: Date.now(),
        customer: profile?.name ?? '',
        phone: profile?.phone ?? '',
        address: profile?.address ?? '',
      };
      setOrders((prev) => [order, ...prev]);
      push(
        'confirmed',
        'Order confirmed',
        `Your order ${o.id} (${o.name}) is confirmed and being prepared.`
      );
      scheduleDelivery(order, DELIVERY_DEMO_MS);
    },
    [profile, push, scheduleDelivery]
  );

  const markAllRead = useCallback(
    () => setNotifications((prev) => prev.map((n) => (n.read ? n : { ...n, read: true }))),
    []
  );

  const value = useMemo<AppState>(
    () => ({
      profile,
      saveProfile,
      logout,
      favorites,
      toggleFavorite,
      cart,
      cartCount: Object.values(cart).reduce<number>((a, q) => a + Number(q), 0),
      addToCart,
      decFromCart,
      clearCart,
      orders,
      placeOrder,
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
      markAllRead,
    }),
    [
      profile, saveProfile, logout, favorites, toggleFavorite, cart, addToCart,
      decFromCart, clearCart, orders, placeOrder, notifications, markAllRead,
    ]
  );

  // Same blue as the splash while saved data loads (a few milliseconds).
  if (!ready) return <View style={{ flex: 1, backgroundColor: '#2B56EE' }} />;

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside <AppProvider>');
  return v;
}
