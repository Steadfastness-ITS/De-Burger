import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  PanResponder,
  StyleSheet,
  type LayoutChangeEvent,
} from 'react-native';

const NAVY = '#2B2F54';
const THUMB = 18;
const TRACK_H = 8;

type Props = {
  value: number; // 0 to 1
  onChange: (value: number) => void;
};

const clamp = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Lightweight slider built with PanResponder (no extra packages needed).
 * Tap anywhere on the track or drag to change the value.
 */
export default function SpicySlider({ value, onChange }: Props) {
  const [trackWidth, setTrackWidth] = useState(0);
  const widthRef = useRef(0);
  const startX = useRef(0);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const [pan] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        startX.current = e.nativeEvent.locationX;
        if (widthRef.current > 0) {
          onChangeRef.current(clamp(startX.current / widthRef.current));
        }
      },
      onPanResponderMove: (_e, g) => {
        if (widthRef.current > 0) {
          onChangeRef.current(clamp((startX.current + g.dx) / widthRef.current));
        }
      },
    })
  );

  const handleLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    widthRef.current = w;
    setTrackWidth(w);
  };

  const x = trackWidth * clamp(value);

  return (
    <View style={styles.wrap} onLayout={handleLayout} {...pan.panHandlers}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.track} />
        <View style={[styles.fill, { width: x }]} />
        <View style={[styles.thumb, { left: x - THUMB / 2 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 30,
    justifyContent: 'center',
  },
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: (30 - TRACK_H) / 2,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    backgroundColor: '#F1F2F6',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: (30 - TRACK_H) / 2,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    backgroundColor: NAVY,
  },
  thumb: {
    position: 'absolute',
    top: (30 - THUMB) / 2,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: NAVY,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
});
