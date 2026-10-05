import React from 'react';
import Svg, { G, Path } from 'react-native-svg';

import { colors } from '../../theme';

/**
 * The voice-call panel's control marks — plain 24pt line icons drawn inline,
 * so a call needs no new binary assets.
 */

type IconProps = {
  size?: number;
  color?: string;
};

const lineProps = (color: string) =>
  ({
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    fill: 'none',
  }) as const;

/** Microphone open — the Mute control while the astrologer can be heard. */
export function MicOnIcon({ size = 24, color = colors.text.ink }: IconProps) {
  const line = lineProps(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" {...line} />
      <Path d="M19 10v2a7 7 0 0 1-14 0v-2" {...line} />
      <Path d="M12 19v4" {...line} />
      <Path d="M8 23h8" {...line} />
    </Svg>
  );
}

/** Microphone struck through — the Mute control while muted. */
export function MicOffIcon({ size = 24, color = colors.text.inverse }: IconProps) {
  const line = lineProps(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M1 1l22 22" {...line} />
      <Path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" {...line} />
      <Path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" {...line} />
      <Path d="M12 19v4" {...line} />
      <Path d="M8 23h8" {...line} />
    </Svg>
  );
}

/** Loudspeaker — the Speaker control. */
export function SpeakerIcon({ size = 24, color = colors.text.ink }: IconProps) {
  const line = lineProps(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M11 5L6 9H2v6h4l5 4V5z" {...line} />
      <Path d="M15.54 8.46a5 5 0 0 1 0 7.07" {...line} />
      <Path d="M19.07 4.93a10 10 0 0 1 0 14.14" {...line} />
    </Svg>
  );
}

/** A handset turned down — the red End control. */
export function EndCallIcon({ size = 26, color = colors.text.inverse }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G transform="rotate(135 12 12)">
        <Path
          d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
          fill={color}
        />
      </G>
    </Svg>
  );
}
