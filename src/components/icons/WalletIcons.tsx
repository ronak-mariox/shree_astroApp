import React from 'react';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';

import { colors } from '../../theme';

/**
 * The wallet flow's two remaining marks. Sources are kept alongside at
 * src/assets/icons/bank.svg and src/assets/icons/info-circle-square.svg.
 */

const VIEW_BOX = '0 0 17.9934 17.9934';
const STROKE_WIDTH = 1.3495;

type IconProps = {
  size?: number;
  color?: string;
};

/**
 * Bank building — the "Request Withdraw Money" button and the withdrawal row in
 * the transaction list (Figma nodes 112:1231, 112:1282). Figma exports it twice,
 * once in brand yellow and once in red, from the one vector.
 */
export function BankIcon({
  size = 17.993,
  color = colors.brandYellow,
}: IconProps) {
  const line = {
    stroke: color,
    strokeWidth: STROKE_WIDTH,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const;

  return (
    <Svg width={size} height={size} viewBox={VIEW_BOX} fill="none">
      <Defs>
        <ClipPath id="bank-icon-clip">
          <Rect width="17.9934" height="17.9934" fill="#fff" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#bank-icon-clip)">
        <Path d="M2.24918 16.4939H15.7442" {...line} />
        <Path d="M4.49835 13.495V8.24697" {...line} />
        <Path d="M7.49725 13.495V8.24697" {...line} />
        <Path d="M10.4962 13.495V8.24697" {...line} />
        <Path d="M13.495 13.495V8.24697" {...line} />
        <Path d="M8.9967 1.49945L14.9945 5.24808H2.9989L8.9967 1.49945Z" {...line} />
      </G>
    </Svg>
  );
}

/**
 * Info circle. Figma exports the same vector at three boxes — 17.993 square on a
 * platform-fee row (node 112:1318) and taller, narrower crops for the advisory
 * notes — so this square viewBox serves them all through `size`.
 */
export function InfoCircleSquareIcon({
  size = 17.993,
  color = colors.status.warning,
}: IconProps) {
  const line = {
    stroke: color,
    strokeWidth: STROKE_WIDTH,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const;

  return (
    <Svg width={size} height={size} viewBox={VIEW_BOX} fill="none">
      <Defs>
        <ClipPath id="info-square-clip">
          <Rect width="17.9934" height="17.9934" fill="#fff" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#info-square-clip)">
        <Path
          d="M8.99676 16.4935C13.1374 16.4935 16.494 13.1369 16.494 8.99627C16.494 4.85566 13.1374 1.49902 8.99676 1.49902C4.85614 1.49902 1.49951 4.85566 1.49951 8.99627C1.49951 13.1369 4.85614 16.4935 8.99676 16.4935Z"
          {...line}
        />
        <Path d="M8.99658 5.99805V8.99695" {...line} />
        <Path d="M8.99658 11.9951H9.00408" {...line} />
      </G>
    </Svg>
  );
}
