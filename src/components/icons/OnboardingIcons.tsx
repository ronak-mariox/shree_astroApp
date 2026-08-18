import React from 'react';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';

import { colors } from '../../theme';

/**
 * The four line icons at the top of the onboarding slides (Figma nodes
 * 104:4980, 104:5074, 104:5169, 104:5263). Every one is drawn on a
 * 63.9976pt square with a 4.8pt yellow stroke; the source vectors are kept
 * alongside at src/assets/icons/onboarding-*.svg.
 */
export const ONBOARDING_ICON_SIZE = 63.998;

const VIEW_BOX = '0 0 63.9976 63.9976';
const STROKE_WIDTH = 4.79982;

type IconProps = {
  size?: number;
  color?: string;
};

/** Slide 1 — "Become a Professional Astrologer". */
export function ProfessionalAstrologerIcon({
  size = ONBOARDING_ICON_SIZE,
  color = colors.brandYellow,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={VIEW_BOX} fill="none">
      <Path
        d="M31.9988 5.33313L40.2385 22.0258L58.6645 24.7191L45.3316 37.7053L48.4782 56.0512L31.9988 47.3849L15.5194 56.0512L18.666 37.7053L5.33313 24.7191L23.7591 22.0258L31.9988 5.33313Z"
        fill={color}
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Slide 2 — "Earn Online, Anytime". */
export function EarnOnlineIcon({
  size = ONBOARDING_ICON_SIZE,
  color = colors.brandYellow,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={VIEW_BOX} fill="none">
      <Defs>
        <ClipPath id="earn-online-clip">
          <Rect width="63.9976" height="63.9976" fill="#fff" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#earn-online-clip)">
        <Path
          d="M31.9988 2.66657V61.331"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M45.3316 13.3328H25.3324C22.8571 13.3328 20.4832 14.3161 18.733 16.0664C16.9827 17.8167 15.9994 20.1906 15.9994 22.6658C15.9994 25.1411 16.9827 27.515 18.733 29.2652C20.4832 31.0155 22.8571 31.9988 25.3324 31.9988H38.6652C41.1405 31.9988 43.5144 32.9821 45.2646 34.7324C47.0149 36.4826 47.9982 38.8565 47.9982 41.3318C47.9982 43.807 47.0149 46.1809 45.2646 47.9312C43.5144 49.6815 41.1405 50.6648 38.6652 50.6648H15.9994"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
}

/** Slide 3 — "Chat & Voice Consultations". */
export function ChatVoiceIcon({
  size = ONBOARDING_ICON_SIZE,
  color = colors.brandYellow,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={VIEW_BOX} fill="none">
      <Path
        d="M55.9979 39.9985C55.9979 41.4129 55.436 42.7694 54.4359 43.7696C53.4357 44.7697 52.0792 45.3316 50.6648 45.3316H18.666L7.9997 55.9979V13.3328C7.9997 11.9184 8.56158 10.5619 9.56174 9.56174C10.5619 8.56158 11.9184 7.9997 13.3328 7.9997H50.6648C52.0792 7.9997 53.4357 8.56158 54.4359 9.56174C55.436 10.5619 55.9979 11.9184 55.9979 13.3328V39.9985Z"
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Slide 4 — "AI Astrology Assistant". */
export function AiAssistantIcon({
  size = ONBOARDING_ICON_SIZE,
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
        <ClipPath id="ai-assistant-clip">
          <Rect width="63.9976" height="63.9976" fill="#fff" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#ai-assistant-clip)">
        <Path
          d="M47.9982 10.6663H15.9994C13.054 10.6663 10.6663 13.054 10.6663 15.9994V47.9982C10.6663 50.9436 13.054 53.3313 15.9994 53.3313H47.9982C50.9436 53.3313 53.3313 50.9436 53.3313 47.9982V15.9994C53.3313 13.054 50.9436 10.6663 47.9982 10.6663Z"
          {...line}
        />
        <Path
          d="M39.9985 23.9991H23.9991V39.9985H39.9985V23.9991Z"
          {...line}
        />
        <Path d="M23.9991 2.66657V10.6663" {...line} />
        <Path d="M39.9985 2.66657V10.6663" {...line} />
        <Path d="M23.9991 53.3313V61.331" {...line} />
        <Path d="M39.9985 53.3313V61.331" {...line} />
        <Path d="M53.3313 23.9991H61.331" {...line} />
        <Path d="M53.3313 37.3319H61.331" {...line} />
        <Path d="M2.66657 23.9991H10.6663" {...line} />
        <Path d="M2.66657 37.3319H10.6663" {...line} />
      </G>
    </Svg>
  );
}
