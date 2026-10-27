import React, { useMemo, useState } from 'react';
import {
  Image,
  View,
  Text,
  type ImageResizeMode,
  type ImageSourcePropType,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SvgXml } from 'react-native-svg';

import { getFoodSvg, type FoodArt } from '../data/foodArt';

type Props = {
  // A normal image, or { art: 'pepperoni' } for the built-in transparent food art.
  source?: ImageSourcePropType | FoodArt;
  style?: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
  emojiSize?: number;
  fallback?: string;
  // For your own transparent PNGs: adds a soft ground shadow underneath.
  // (The built-in food art already includes its shadow.)
  shadow?: boolean;
};

const isArt = (s: unknown): s is FoodArt =>
  typeof s === 'object' && s !== null && !Array.isArray(s) && 'art' in s;

/**
 * Food / avatar image with safe fallbacks:
 *  - { art } sources draw transparent vector food with a bottom shadow
 *  - photos that fail to load show an emoji instead of a blank space
 */
export default function BurgerImage({
  source,
  style,
  resizeMode = 'contain',
  emojiSize = 64,
  fallback = '🍔',
  shadow = false,
}: Props) {
  const [failed, setFailed] = useState(false);
  const xml = useMemo(() => (isArt(source) ? getFoodSvg(source.art) : null), [source]);

  if (xml) {
    return (
      <View style={style as StyleProp<ViewStyle>}>
        <SvgXml xml={xml} width="100%" height="100%" />
      </View>
    );
  }

  if (failed || !source || isArt(source)) {
    return (
      <View
        style={[
          { alignItems: 'center', justifyContent: 'center' },
          style as StyleProp<ViewStyle>,
        ]}
      >
        <Text style={{ fontSize: emojiSize }}>{fallback}</Text>
      </View>
    );
  }

  if (shadow) {
    return (
      <View style={style as StyleProp<ViewStyle>}>
        <Image
          source={source}
          style={{ flex: 1, width: '100%' }}
          resizeMode={resizeMode}
          onError={() => setFailed(true)}
        />
        <View
          pointerEvents="none"
          style={{
            alignSelf: 'center',
            width: '68%',
            height: 10,
            marginTop: -2,
            borderRadius: 5,
            backgroundColor: 'rgba(0,0,0,0.16)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}
        />
      </View>
    );
  }

  return (
    <Image
      source={source}
      style={style}
      resizeMode={resizeMode}
      onError={() => setFailed(true)}
    />
  );
}
