import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NAVY = '#2B2F54';
const ORANGE = '#E56B00';

// Height of the navy bar. Lower = shorter bar (was 80). Keep it at 56 or more,
// because the tab icons are 48 tall.
const BAR_H = 50;
const OVERHANG = 46; // space above the bar for the floating button (keep at 45+ so the + button isn't cut off)
const NOTCH_DEPTH = 42;
const CORNER = 30;
const FAB = 70;

type IconName = React.ComponentProps<typeof Ionicons>['name'];
export type TabKey = 'home' | 'profile' | 'chat' | 'favorites';

const TABS: { key: TabKey; icon: IconName; pos: number }[] = [
  { key: 'home', icon: 'home-outline', pos: 0.1 },
  { key: 'favorites', icon: 'heart', pos: 0.29 },
  { key: 'chat', icon: 'chatbubble-outline', pos: 0.71 },
  { key: 'profile', icon: 'person-outline', pos: 0.9 },
];

type Props = {
  activeTab: TabKey;
  onChange?: (tab: TabKey) => void;
  onAdd?: () => void;
  addBadge?: number; // item count shown on the + button
};

export default function BottomNav({ activeTab, onChange, onAdd, addBadge = 0 }: Props) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const cx = width / 2;

  const path = [
    `M0,${CORNER}`,
    `Q0,0 ${CORNER},0`,
    `L${cx - 105},0`,
    `C${cx - 60},0 ${cx - 62},${NOTCH_DEPTH} ${cx},${NOTCH_DEPTH}`,
    `C${cx + 62},${NOTCH_DEPTH} ${cx + 60},0 ${cx + 105},0`,
    `L${width - CORNER},0`,
    `Q${width},0 ${width},${CORNER}`,
    `L${width},${BAR_H}`,
    `L0,${BAR_H}`,
    'Z',
  ].join(' ');

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { height: OVERHANG + BAR_H + insets.bottom }]}
    >
      {/* Navy bar with the curved notch */}
      <Svg
        width={width}
        height={BAR_H}
        style={{ position: 'absolute', top: OVERHANG, left: 0 }}
      >
        <Path d={path} fill={NAVY} />
      </Svg>

      {/* Fill under the bar for devices with a bottom safe area */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: insets.bottom,
          backgroundColor: NAVY,
        }}
      />

      {/* Tab icons */}
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          activeOpacity={0.7}
          onPress={() => onChange?.(tab.key)}
          style={[styles.tab, { left: width * tab.pos - 24, top: OVERHANG + (BAR_H - 48) / 2 + 10 }]}
        >
          <Ionicons name={tab.icon} size={28} color="#FFFFFF" />
          {activeTab === tab.key && <View style={styles.dot} />}
        </TouchableOpacity>
      ))}

      {/* Floating orange + button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onAdd}
        style={[styles.fab, { left: cx - FAB / 2, top: OVERHANG - 45 }]}
      >
        <Ionicons name="add" size={40} color="#FFFFFF" />
        {addBadge > 0 && (
          <View style={styles.addBadge}>
            <Text style={styles.addBadgeText}>{addBadge > 99 ? '99+' : addBadge}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  tab: {
    position: 'absolute',
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  addBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 6,
    backgroundColor: '#E5383B',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fab: {
    position: 'absolute',
    width: FAB,
    height: FAB,
    borderRadius: FAB / 2,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
});
