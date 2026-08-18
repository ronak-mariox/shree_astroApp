import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { colors } from '../../theme';

type NoticeIconProps = {
  width?: number;
  height?: number;
  color?: string;
};

/**
 * The two advisory marks in the registration wizard. Both are drawn taller than
 * they are wide, so each edge is explicit. Sources are kept alongside at
 * src/assets/icons/info-circle.svg and src/assets/icons/padlock.svg.
 */

/** Leads the "upload clear, readable images" notice (Figma node 105:6323). */
export function InfoCircleIcon({
  width = 9.18,
  height = 13.994,
  color = colors.status.info,
}: NoticeIconProps) {
  const line = {
    stroke: color,
    strokeWidth: 0.68847,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const;

  return (
    <Svg width={width} height={height} viewBox="0 0 9.1796 13.9936" fill="none">
      <Path
        d="M4.5898 10.8216C6.7022 10.8216 8.41463 9.1092 8.41463 6.9968C8.41463 4.8844 6.7022 3.17197 4.5898 3.17197C2.4774 3.17197 0.764967 4.8844 0.764967 6.9968C0.764967 9.1092 2.4774 10.8216 4.5898 10.8216Z"
        {...line}
      />
      <Path d="M4.5898 5.46687V6.9968" {...line} />
      <Path d="M4.5898 8.52673H4.59362" {...line} />
    </Svg>
  );
}

/** Leads the bank-security notice (Figma node 105:6606). */
export function PadlockIcon({
  width = 8.153,
  height = 13.994,
  color = colors.text.ink,
}: NoticeIconProps) {
  const line = {
    stroke: color,
    strokeWidth: 0.611482,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const;

  return (
    <Svg width={width} height={height} viewBox="0 0 8.15309 13.9936" fill="none">
      <Path
        d="M6.45453 6.65709H1.69856C1.32332 6.65709 1.01914 6.96128 1.01914 7.33651V9.7145C1.01914 10.0897 1.32332 10.3939 1.69856 10.3939H6.45453C6.82977 10.3939 7.13395 10.0897 7.13395 9.7145V7.33651C7.13395 6.96128 6.82977 6.65709 6.45453 6.65709Z"
        {...line}
      />
      <Path
        d="M2.37798 6.65709V5.29824C2.37798 4.84775 2.55694 4.41572 2.87548 4.09718C3.19402 3.77863 3.62606 3.59968 4.07654 3.59968C4.52703 3.59968 4.95907 3.77863 5.27761 4.09718C5.59615 4.41572 5.77511 4.84775 5.77511 5.29824V6.65709"
        {...line}
      />
    </Svg>
  );
}
