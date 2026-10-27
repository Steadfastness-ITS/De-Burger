import React, { useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp, type AppNotification } from '../data/AppState';

const NAVY = '#2B2F54';
const ORANGE = '#E56B00';
const GREEN = '#0BAA5E';
const RED = '#E5383B';

const timeAgo = (ms: number): string => {
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return 'Just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  return `${Math.floor(m / 60)} hr ago`;
};

function Item({ n }: { n: AppNotification }) {
  const delivered = n.kind === 'delivered';
  const color = delivered ? ORANGE : GREEN;
  return (
    <View style={[styles.item, !n.read && styles.itemUnread]}>
      <View style={[styles.itemIcon, { backgroundColor: color }]}>
        <Ionicons name={delivered ? 'bag-check' : 'checkmark'} size={22} color="#FFFFFF" />
      </View>
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={styles.itemTitle}>{n.title}</Text>
        <Text style={styles.itemBody}>{n.body}</Text>
        <Text style={styles.itemTime}>{timeAgo(n.time)}</Text>
      </View>
      {!n.read && <View style={styles.unreadDot} />}
    </View>
  );
}

// Bell button for the Home header. Shows an unread badge and opens a panel
// listing order updates ("Order confirmed", "Order delivered").
export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useApp();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const close = () => {
    setOpen(false);
    markAllRead(); // unread dots stay visible while the panel is open
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.bell}
        onPress={() => setOpen(true)}
        accessibilityLabel="Notifications"
      >
        <Ionicons
          name={unreadCount > 0 ? 'notifications' : 'notifications-outline'}
          size={28}
          color={NAVY}
        />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={close}
      >
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} />
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Notifications</Text>
              <TouchableOpacity
                onPress={close}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={26} color={NAVY} />
              </TouchableOpacity>
            </View>

            {notifications.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="notifications-off-outline" size={44} color="#B5B7C0" />
                <Text style={styles.emptyTitle}>No notifications yet</Text>
                <Text style={styles.emptyText}>
                  Order updates, like confirmed and delivered, will show up here.
                </Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {notifications.map((n) => (
                  <Item key={n.id} n={n} />
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bell: {
    width: 60,
    height: 60,
    borderRadius: 16,
    marginTop: 4,
    backgroundColor: '#F2F3F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: RED,
    borderWidth: 2,
    borderColor: '#F2F3F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    lineHeight: 14,
    color: '#FFFFFF',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(20, 24, 40, 0.5)',
  },
  sheet: {
    maxHeight: '70%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 19,
    paddingTop: 22,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sheetTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 21,
    color: '#3B2F2F',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#F7F8FA',
    marginBottom: 12,
  },
  itemUnread: {
    backgroundColor: '#FFF3E8',
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: '#1F2037',
  },
  itemBody: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13.5,
    lineHeight: 19,
    color: '#5C5C68',
    marginTop: 2,
  },
  itemTime: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#9A9BA5',
    marginTop: 4,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ORANGE,
    marginLeft: 8,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
    color: '#1F2037',
    marginTop: 12,
  },
  emptyText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: '#7A7A85',
    textAlign: 'center',
    marginTop: 6,
  },
});
