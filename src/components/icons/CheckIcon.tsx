import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { colors } from '../../theme';

type CheckIconProps = {
  size?: number;
  color?: string;
};

/**
 * Tick mark. Figma exports it three times — 19.999 on an uploaded document
 * row (105:6484), 43.998 in the submitted badge (105:6688) and 15.999 in a
 * timeline bullet (105:6698) — all the same vector uniformly scaled (the stroke
 * stays at 0.104 of the box), so one source is kept at
 * src/assets/icons/check.svg and `size` does the rest.
 */
export function CheckIcon({
  size = 19.999,
  color = colors.status.success,
}: CheckIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 19.9993 19.9993" fill="none">
      <Path
        d="M16.6661 4.99983L7.49974 14.1662L3.33322 9.99965"
        stroke={color}
        strokeWidth={2.08326}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
