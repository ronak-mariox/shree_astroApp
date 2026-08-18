import React, { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { colors } from '../theme';

/**
 * Figma paints the brand gradient at ~262deg on the full-width CTAs and at
 * ~265deg on the onboarding "Next" button — both run from the right edge
 * (#F55102) to the left (#FFBC01) with a slight downward drift.
 */
const direction = {
  diagonal: { x1: '100%', y1: '1%', x2: '0%', y2: '99%' },
  shallow: { x1: '100%', y1: '4%', x2: '0%', y2: '96%' },
} as const;

type BrandGradientProps = {
  /** Corner radius of the painted rectangle. */
  radius: number;
  angle?: keyof typeof direction;
};

/** Absolutely-filled brand gradient — drop it into any positioned parent. */
export function BrandGradient({
  radius,
  angle = 'diagonal',
}: BrandGradientProps) {
  // Scoped so several gradients can coexist without their <Defs> colliding.
  const gradientId = `brand-gradient-${useId()}`;
  const { x1, y1, x2, y2 } = direction[angle];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={gradientId} x1={x1} y1={y1} x2={x2} y2={y2}>
            <Stop offset="0" stopColor={colors.gradient.from} />
            <Stop offset="1" stopColor={colors.gradient.to} />
          </LinearGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          rx={radius}
          fill={`url(#${gradientId})`}
        />
      </Svg>
    </View>
  );
}
