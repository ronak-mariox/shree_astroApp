import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { colors } from '../../theme';

type SmsBoltIconProps = {
  width?: number;
  height?: number;
  color?: string;
};

/**
 * Lightning bolt leading the SMS auto-read advisory (Figma node 104:5617).
 * It is the one icon in the flow that is not square, so both edges are
 * explicit. Source vector kept alongside at src/assets/icons/sms-bolt.svg.
 */
export function SmsBoltIcon({
  width = 12.318,
  height = 12.991,
  color = colors.text.ink,
}: SmsBoltIconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 12.3181 12.9907" fill="none">
      <Path
        d="M6.6723 1.36281L1.53976 7.52186H6.15905L5.6458 11.6279L10.7783 5.46884H6.15905L6.6723 1.36281Z"
        stroke={color}
        strokeWidth={0.923857}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
