import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { colors } from '../../theme';

type SunStarIconProps = {
  size?: number;
  color?: string;
};

/**
 * Radiating sun with a star at its centre — the brand mark on the yellow tile
 * of the welcome (Figma node 104:5383), login (104:5440) and OTP (104:5582)
 * screens. Figma exports it three times at 59.998 / 31.999 / 27.999; all three
 * are the same vector uniformly scaled (stroke stays at 1/32 of the box), so
 * one source is kept at src/assets/icons/sun-star.svg and `size` does the rest.
 */
export function SunStarIcon({
  size = 59.998,
  color = colors.text.ink,
}: SunStarIconProps) {
  const ray = {
    stroke: color,
    strokeWidth: 1.87493,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const;

  return (
    <Svg width={size} height={size} viewBox="0 0 59.9978 59.9978" fill="none">
      <Path
        d="M29.9989 42.4984C36.9022 42.4984 42.4984 36.9022 42.4984 29.9989C42.4984 23.0956 36.9022 17.4994 29.9989 17.4994C23.0956 17.4994 17.4994 23.0956 17.4994 29.9989C17.4994 36.9022 23.0956 42.4984 29.9989 42.4984Z"
        {...ray}
      />
      <Path
        d="M29.9989 34.9987C32.7602 34.9987 34.9987 32.7602 34.9987 29.9989C34.9987 27.2376 32.7602 24.9991 29.9989 24.9991C27.2376 24.9991 24.9991 27.2376 24.9991 29.9989C24.9991 32.7602 27.2376 34.9987 29.9989 34.9987Z"
        fill={color}
      />
      <Path d="M29.9989 2.49991V12.4995" {...ray} />
      <Path d="M29.9989 47.4983V57.4979" {...ray} />
      <Path d="M2.49991 29.9989H12.4995" {...ray} />
      <Path d="M47.4983 29.9989H57.4979" {...ray} />
      <Path d="M9.74964 9.74964L16.8744 16.8744" {...ray} />
      <Path d="M43.1234 43.1234L50.2482 50.2482" {...ray} />
      <Path d="M50.2482 9.74964L43.1234 16.8744" {...ray} />
      <Path d="M16.8744 43.1234L9.74964 50.2482" {...ray} />
      <Path
        d="M29.9989 17.4994L33.1238 24.9991H41.2485L34.3737 29.9989L36.8736 38.7486L29.9989 33.7488L23.1242 38.7486L25.6241 29.9989L18.7493 24.9991H26.874L29.9989 17.4994Z"
        fill={color}
      />
    </Svg>
  );
}
