import React, { useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GREEN = '#0BAA5E';
const ORANGE = '#E56B00';
const HERO = 150;
const CONFETTI_COLORS = ['#0BAA5E', '#E56B00', '#E5383B', '#F5C518', '#4A6CF7', '#FF8FB1'];

// ---------------------------------------------------------------------------
// Confetti: 30 pieces that burst out of the check badge, spin, and fall.
// (Deterministic maths instead of random, so it looks the same every time.)
// ---------------------------------------------------------------------------
type Piece = {
  isEmoji: boolean;
  dx: number;
  dy: number;
  fall: number;
  rot: number;
  w: number;
  h: number;
  color: string;
  round: boolean;
};

const PIECES: Piece[] = Array.from({ length: 30 }, (_, i) => {
  const angle = (i / 30) * Math.PI * 2 + (i % 4) * 0.21;
  const dist = 80 + ((i * 37) % 70);
  const size = 7 + (i % 3) * 3;
  const round = i % 3 === 0;
  return {
    isEmoji: i % 4 === 1,
    dx: Math.cos(angle) * dist,
    dy: Math.sin(angle) * dist - 20,
    fall: 40 + ((i * 13) % 50),
    rot: ((i * 53) % 720) - 360,
    w: size,
    h: round ? size : size * 1.7,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    round,
  };
});

function ConfettiPiece({
  burst,
  piece,
  emoji,
}: {
  burst: Animated.Value;
  piece: Piece;
  emoji: string;
}) {
  const translateX = burst.interpolate({
    inputRange: [0, 1],
    outputRange: [0, piece.dx],
  });
  const translateY = burst.interpolate({
    inputRange: [0, 0.55, 1],
    outputRange: [0, piece.dy, piece.dy + piece.fall],
  });
  const opacity = burst.interpolate({
    inputRange: [0, 0.08, 0.75, 1],
    outputRange: [0, 1, 1, 0],
  });
  const rotate = burst.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${piece.rot}deg`],
  });
  const scale = burst.interpolate({
    inputRange: [0, 0.1, 1],
    outputRange: [0.2, 1, 0.9],
  });

  if (piece.isEmoji) {
    // A few pieces of confetti are the food you just ordered.
    return (
      <Animated.Text
        style={{
          position: 'absolute',
          left: HERO / 2 - 11,
          top: HERO / 2 - 13,
          fontSize: 20,
          opacity,
          transform: [{ translateX }, { translateY }, { rotate }, { scale }],
        }}
      >
        {emoji}
      </Animated.Text>
    );
  }

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: HERO / 2 - piece.w / 2,
        top: HERO / 2 - piece.h / 2,
        width: piece.w,
        height: piece.h,
        borderRadius: piece.round ? piece.w / 2 : 2,
        backgroundColor: piece.color,
        opacity,
        transform: [{ translateX }, { translateY }, { rotate }, { scale }],
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Delivery tracker step (Confirmed -> Cooking -> On the way)
// ---------------------------------------------------------------------------
function Step({
  label,
  state,
  pulse,
}: {
  label: string;
  state: 'done' | 'active' | 'todo';
  pulse: Animated.Value;
}) {
  const activeStyle = {
    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }),
    transform: [
      { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1.12] }) },
    ],
  };

  return (
    <View style={styles.step}>
      {state === 'done' && (
        <View style={[styles.dot, { backgroundColor: GREEN }]}>
          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
        </View>
      )}
      {state === 'active' && (
        <Animated.View style={[styles.dot, { backgroundColor: ORANGE }, activeStyle]}>
          <Ionicons name="flame" size={13} color="#FFFFFF" />
        </Animated.View>
      )}
      {state === 'todo' && <View style={[styles.dot, { backgroundColor: '#E3E5EA' }]} />}
      <Text style={[styles.stepLabel, state === 'todo' && { color: '#A0A3AD' }]}>
        {label}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// The popup
// ---------------------------------------------------------------------------
type Props = {
  visible: boolean;
  orderId: string;
  amount: string; // e.g. "$18.19"
  emoji: string; // emoji of the ordered food
  itemName: string; // e.g. "Chicken Shawarma"
  onClose: () => void;
  onTrack: () => void;
};

export default function PaymentSuccessModal({
  visible,
  orderId,
  amount,
  emoji,
  itemName,
  onClose,
  onTrack,
}: Props) {
  const { width } = useWindowDimensions();

  const [v] = useState(() => ({
    card: new Animated.Value(0),
    badge: new Animated.Value(0),
    check: new Animated.Value(0),
    burst: new Animated.Value(0),
    text: new Animated.Value(0),
    ring: new Animated.Value(0),
    pulse: new Animated.Value(0),
  }));

  useEffect(() => {
    if (!visible) return undefined;

    v.card.setValue(0);
    v.badge.setValue(0);
    v.check.setValue(0);
    v.burst.setValue(0);
    v.text.setValue(0);
    v.ring.setValue(0);
    v.pulse.setValue(0);

    const intro = Animated.parallel([
      Animated.spring(v.card, {
        toValue: 1,
        friction: 7,
        tension: 70,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(200),
        Animated.spring(v.badge, {
          toValue: 1,
          friction: 4,
          tension: 90,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(420),
        Animated.spring(v.check, {
          toValue: 1,
          friction: 3,
          tension: 120,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(450),
        Animated.timing(v.burst, {
          toValue: 1,
          duration: 1300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(650),
        Animated.timing(v.text, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]);

    const ringLoop = Animated.loop(
      Animated.timing(v.ring, {
        toValue: 1,
        duration: 1700,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    );

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(v.pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(v.pulse, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    );

    intro.start();
    ringLoop.start();
    pulseLoop.start();

    return () => {
      intro.stop();
      ringLoop.stop();
      pulseLoop.stop();
    };
  }, [visible, v]);

  const cardScale = v.card.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });
  const ringScale = v.ring.interpolate({ inputRange: [0, 1], outputRange: [1, 2.1] });
  const ringOpacity = v.ring.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });
  const checkRotate = v.check.interpolate({
    inputRange: [0, 1],
    outputRange: ['-30deg', '0deg'],
  });
  const textY = v.text.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Animated.View
          style={[
            styles.card,
            {
              width: Math.min(width - 56, 340),
              opacity: v.card,
              transform: [{ scale: cardScale }],
            },
          ]}
        >
          {/* Check badge + ripple ring + confetti */}
          <View style={styles.hero}>
            <View style={styles.halo} />
            <Animated.View
              style={[styles.ring, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]}
            />
            <Animated.View style={[styles.badge, { transform: [{ scale: v.badge }] }]}>
              <Animated.View
                style={{ transform: [{ scale: v.check }, { rotate: checkRotate }] }}
              >
                <Ionicons name="checkmark" size={58} color="#FFFFFF" />
              </Animated.View>
            </Animated.View>
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              {PIECES.map((p, i) => (
                <ConfettiPiece key={i} burst={v.burst} piece={p} emoji={emoji} />
              ))}
            </View>
          </View>

          <Animated.View
            style={{
              alignItems: 'center',
              opacity: v.text,
              transform: [{ translateY: textY }],
            }}
          >
            <Text style={styles.title}>Payment Successful!</Text>
            <Text style={styles.subtitle} numberOfLines={2}>
              Your {itemName} is on its way {emoji}🔥
            </Text>
            <Text style={styles.body}>
              {amount} paid. A receipt for this purchase has been sent to your email.
            </Text>

            <View style={styles.orderChip}>
              <Text style={styles.orderChipText}>Order {orderId}</Text>
            </View>

            {/* Mini delivery tracker */}
            <View style={styles.tracker}>
              <Step label="Confirmed" state="done" pulse={v.pulse} />
              <View style={[styles.line, { backgroundColor: GREEN }]} />
              <Step label="Cooking" state="active" pulse={v.pulse} />
              <View style={styles.line} />
              <Step label="On the way" state="todo" pulse={v.pulse} />
            </View>
          </Animated.View>

          <TouchableOpacity activeOpacity={0.9} style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} style={styles.trackLink} onPress={onTrack}>
            <Text style={styles.trackText}>Track my order</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 24, 40, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingTop: 22,
    paddingBottom: 24,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 28,
    elevation: 20,
  },
  hero: {
    width: HERO,
    height: HERO,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(11, 170, 94, 0.12)',
  },
  ring: {
    position: 'absolute',
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3,
    borderColor: GREEN,
  },
  badge: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  title: {
    marginTop: 4,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 25,
    color: GREEN,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 4,
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: '#2B2F54',
    textAlign: 'center',
  },
  body: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: '#7A7A85',
    textAlign: 'center',
  },
  orderChip: {
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F2F3F5',
  },
  orderChipText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: '#2B2F54',
  },
  tracker: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  step: {
    width: 66,
    alignItems: 'center',
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: '500',
    color: '#2B2F54',
    textAlign: 'center',
  },
  line: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    marginTop: 10,
    backgroundColor: '#E3E5EA',
  },
  button: {
    marginTop: 22,
    alignSelf: 'stretch',
    height: 56,
    borderRadius: 16,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
