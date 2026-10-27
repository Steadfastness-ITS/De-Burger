import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

// The two burger pictures (copy them into your project's assets folder).
const BIG_BURGER = require('../../assets/images/splash-burger-big.png'); // 204 x 251
const SMALL_BURGER = require('../../assets/images/splash-burger-small.png'); // 202 x 174

// The splash was designed on a 430 px wide screen. Positions and sizes below are
// measured from that design and scale with the screen width, so the burgers keep
// the same arrangement (and are never stretched) on every phone.
const DESIGN_W = 430;
const BIG = { x: 0, w: 204, h: 251 };
const SMALL = { x: 134, w: 202, h: 174 };

const SPLASH_DURATION = 5000; // 5 seconds

// Splash screen: shows for 3 seconds, then replaces itself with /home.
export default function SplashScreen() {
  const { width, height } = useWindowDimensions();
  const k = width / DESIGN_W; // scale from the design to this screen
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/home');
    }, SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <LinearGradient
        colors={['#FA9A9A', '#A778BE', '#6B6FD6', '#2B56EE']}
        locations={[0, 0.4, 0.68, 1]}
        start={{ x: 0.35, y: 0 }}
        end={{ x: 0.65, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* App name */}
      <View
        style={[styles.titleWrap, { top: height * 0.4 - 45 }]}
        pointerEvents="none"
      >
        <Text style={styles.title}>De-Burger</Text>
      </View>

      {/* Big burger (left, sitting on the bottom edge) */}
      <Image
        source={BIG_BURGER}
        resizeMode="contain"
        style={{
          position: 'absolute',
          left: BIG.x * k,
          bottom: 0,
          width: BIG.w * k,
          height: BIG.h * k,
        }}
      />

      {/* Small burger (in front, overlapping the big one's right side) */}
      <Image
        source={SMALL_BURGER}
        resizeMode="contain"
        style={{
          position: 'absolute',
          left: SMALL.x * k,
          bottom: 0,
          width: SMALL.w * k,
          height: SMALL.h * k,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#2B56EE',
    overflow: 'hidden',
  },
  titleWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'LobsterTwo_700Bold_Italic',
    fontSize: 58,
    color: '#FFFFFF',
    textAlign: 'center',
    includeFontPadding: false,
    paddingHorizontal: 10,
  },
});
