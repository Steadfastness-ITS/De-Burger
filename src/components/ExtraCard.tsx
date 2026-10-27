import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  type ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BurgerImage from './BurgerImage';

const DARK = '#3B2F2F';
const RED = '#E5383B';
const GREEN = '#17B26A';

export const EXTRA_CARD_WIDTH = 86;

type Props = {
  name: string;
  emoji: string;
  image?: ImageSourcePropType;
  selected: boolean;
  onToggle: () => void;
};

// Topping / side-option card: white photo area on top, dark label bar below.
export default function ExtraCard({ name, emoji, image, selected, onToggle }: Props) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onToggle} style={styles.card}>
      <View style={styles.imageBox}>
        <BurgerImage
          source={image}
          fallback={emoji}
          emojiSize={40}
          style={{ width: 62, height: 56 }}
        />
      </View>
      <View style={styles.footer}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <View style={[styles.badge, selected && styles.badgeOn]}>
          <Ionicons name={selected ? 'checkmark' : 'add'} size={14} color="#FFFFFF" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: EXTRA_CARD_WIDTH,
    height: 110,
    borderRadius: 18,
    backgroundColor: DARK,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },
  imageBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 74,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  name: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: '500',
    color: '#FFFFFF',
    marginRight: 4,
  },
  badge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeOn: {
    backgroundColor: GREEN,
  },
});
