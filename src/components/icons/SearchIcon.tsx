import React from 'react';
import Svg, { G, Path } from 'react-native-svg';

import { colors } from '../../theme';

type SearchIconProps = {
  size?: number;
  color?: string;
};

/**
 * Magnifier in the history screens' search pill (Figma node 110:8936).
 * Source vector kept alongside at src/assets/icons/search.svg.
 */
export function SearchIcon({
  size = 13.005,
  color = colors.border.strong,
}: SearchIconProps) {
  const line = {
    stroke: color,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const;

  return (
    <Svg width={size} height={size} viewBox="0 0 13.0049 13.0048" fill="none">
      <G>
        <Path
          d="M5.83548 11.171C8.78218 11.171 11.171 8.78218 11.171 5.83548C11.171 2.88877 8.78218 0.5 5.83548 0.5C2.88877 0.5 0.5 2.88877 0.5 5.83548C0.5 8.78218 2.88877 11.171 5.83548 11.171Z"
          {...line}
        />
        <Path d="M12.5049 12.5048L9.60369 9.60366" {...line} />
      </G>
    </Svg>
  );
}
