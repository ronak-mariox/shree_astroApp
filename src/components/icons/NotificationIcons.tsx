import React from 'react';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';

import { colors } from '../../theme';

/**
 * The three line icons the notifications feed adds to the dashboard set. They
 * are drawn on a 19.999 box at a 1.49995 stroke — the same 0.075 ratio as the
 * dashboard icons — so the feed's chat bubble and star come from
 * {@link ../icons/DashboardIcons} instead of being redrawn here.
 * Sources are kept alongside in src/assets/icons.
 */

type IconProps = {
  size?: number;
  color?: string;
};

const ICON_SIZE = 19.999;
const VIEW_BOX = '0 0 19.9993 19.9993';
const STROKE_WIDTH = 1.49995;

/** Wallet-credited notification (Figma node 112:1568). */
export function CurrencyIcon({
  size = ICON_SIZE,
  color = colors.status.success,
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
        <ClipPath id="notification-currency-clip">
          <Rect width="19.9993" height="19.9993" fill="#fff" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#notification-currency-clip)">
        <Path d="M9.99965 0.833304V19.166" {...line} />
        <Path
          d="M14.1662 4.16652H7.91639C7.14287 4.16652 6.40103 4.4738 5.85407 5.02076C5.30711 5.56772 4.99983 6.30956 4.99983 7.08308C4.99983 7.85661 5.30711 8.59845 5.85407 9.14541C6.40103 9.69237 7.14287 9.99965 7.91639 9.99965H12.0829C12.8564 9.99965 13.5983 10.3069 14.1452 10.8539C14.6922 11.4009 14.9995 12.1427 14.9995 12.9162C14.9995 13.6897 14.6922 14.4316 14.1452 14.9785C13.5983 15.5255 12.8564 15.8328 12.0829 15.8328H4.99983"
          {...line}
        />
      </G>
    </Svg>
  );
}

/** Withdrawal-approved notification — a bank's colonnade (Figma node 112:1605). */
export function LandmarkIcon({
  size = ICON_SIZE,
  color = colors.status.success,
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
        <ClipPath id="notification-landmark-clip">
          <Rect width="19.9993" height="19.9993" fill="#fff" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#notification-landmark-clip)">
        <Path d="M2.49991 18.3327H17.4994" {...line} />
        <Path d="M4.99983 14.9995V9.16635" {...line} />
        <Path d="M8.33304 14.9995V9.16635" {...line} />
        <Path d="M11.6663 14.9995V9.16635" {...line} />
        <Path d="M14.9995 14.9995V9.16635" {...line} />
        <Path d="M9.99965 1.66661L16.6661 5.83313H3.33322L9.99965 1.66661Z" {...line} />
      </G>
    </Svg>
  );
}

/** Platform-update notification (Figma node 112:1627). */
export function ZapIcon({
  size = ICON_SIZE,
  color = colors.status.accent,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={VIEW_BOX} fill="none">
      <Defs>
        <ClipPath id="notification-zap-clip">
          <Rect width="19.9993" height="19.9993" fill="#fff" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#notification-zap-clip)">
        <Path
          d="M10.833 1.66661L2.49991 11.6663H9.99965L9.16635 18.3327L17.4994 8.33304H9.99965L10.833 1.66661Z"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
}
