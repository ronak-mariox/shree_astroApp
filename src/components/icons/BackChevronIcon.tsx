import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { colors } from '../../theme';

type BackChevronIconProps = {
  size?: number;
  color?: string;
};

/**
 * Chevron in the registration wizard's header (Figma node 105:6023).
 * Source vector kept alongside at src/assets/icons/back-chevron.svg.
 */
export function BackChevronIcon({
  size = 21.993,
  color = colors.text.inkSoft,
}: BackChevronIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 21.9933 21.9933" fill="none">
      <Path
        d="M13.7458 16.495L8.24749 10.9966L13.7458 5.49832"
        stroke={color}
        strokeWidth={1.83277}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
