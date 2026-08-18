import React from 'react';
import Svg, { G, Path } from 'react-native-svg';

/**
 * The marks on the Help & Support screen (Figma node 110:12355). Sources are
 * kept alongside at src/assets/icons/support-chat.svg and issue-*.svg.
 */

type IconProps = {
  size?: number;
  color?: string;
};

/**
 * The speech bubble on both Quick Help buttons — Figma draws the same glyph
 * twice, orange for Live Chat and green for Email Us (nodes 110:12367,
 * 110:12372).
 */
export const QUICK_HELP_ICON_SIZE = 24;

export const LIVE_CHAT_COLOR = '#FF7A00';
export const EMAIL_US_COLOR = '#00C48C';

export function SupportChatIcon({
  size = QUICK_HELP_ICON_SIZE,
  color = LIVE_CHAT_COLOR,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G>
        <Path
          d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
}

/** The four issue-type marks share a 20pt box on a 1.667pt stroke. */
export const ISSUE_ICON_SIZE = 20;

const ISSUE_STROKE = '#7E7EA9';

const issueLine = (color: string) =>
  ({
    stroke: color,
    strokeWidth: 1.66667,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const);

/** Astrologer Issue — a video camera (Figma node 110:12404). */
export function AstrologerIssueIcon({
  size = ISSUE_ICON_SIZE,
  color = ISSUE_STROKE,
}: IconProps) {
  const line = issueLine(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M13.333 10.8324L17.6855 13.7341C17.7483 13.7758 17.8211 13.7998 17.8964 13.8034C17.9717 13.807 18.0466 13.7901 18.113 13.7545C18.1795 13.719 18.235 13.666 18.2737 13.6014C18.3125 13.5367 18.333 13.4628 18.333 13.3874V6.55741C18.333 6.4841 18.3137 6.41208 18.277 6.34862C18.2403 6.28516 18.1875 6.23252 18.1239 6.196C18.0603 6.15948 17.9882 6.14038 17.9149 6.14063C17.8416 6.14088 17.7697 6.16046 17.7063 6.19742L13.333 8.74908"
        {...line}
      />
      <Path
        d="M11.667 5H3.33366C2.41318 5 1.66699 5.74619 1.66699 6.66667V13.3333C1.66699 14.2538 2.41318 15 3.33366 15H11.667C12.5875 15 13.3337 14.2538 13.3337 13.3333V6.66667C13.3337 5.74619 12.5875 5 11.667 5Z"
        {...line}
      />
    </Svg>
  );
}

/** Puja Service and Product Issue — a shopping bag (nodes 110:12410, 110:12417). */
export function BagIcon({
  size = ISSUE_ICON_SIZE,
  color = ISSUE_STROKE,
}: IconProps) {
  const line = issueLine(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M5 1.66602L2.5 4.99935V16.666C2.5 17.108 2.67559 17.532 2.98816 17.8445C3.30072 18.1571 3.72464 18.3327 4.16667 18.3327H15.8333C16.2754 18.3327 16.6993 18.1571 17.0118 17.8445C17.3244 17.532 17.5 17.108 17.5 16.666V4.99935L15 1.66602H5Z"
        {...line}
      />
      <Path d="M2.5 5H17.5" {...line} />
      <Path
        d="M13.3337 8.33398C13.3337 9.21804 12.9825 10.0659 12.3573 10.691C11.7322 11.3161 10.8844 11.6673 10.0003 11.6673C9.11627 11.6673 8.26842 11.3161 7.6433 10.691C7.01818 10.0659 6.66699 9.21804 6.66699 8.33398"
        {...line}
      />
    </Svg>
  );
}

/** Donation Query — a heart (Figma node 110:12424). */
export function HeartIcon({
  size = ISSUE_ICON_SIZE,
  color = ISSUE_STROKE,
}: IconProps) {
  const line = issueLine(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M15.8337 11.6667C17.0753 10.45 18.3337 8.99167 18.3337 7.08333C18.3337 5.86776 17.8508 4.70197 16.9912 3.84243C16.1317 2.98289 14.9659 2.5 13.7503 2.5C12.2837 2.5 11.2503 2.91667 10.0003 4.16667C8.75033 2.91667 7.71699 2.5 6.25033 2.5C5.03475 2.5 3.86896 2.98289 3.00942 3.84243C2.14988 4.70197 1.66699 5.86776 1.66699 7.08333C1.66699 9 2.91699 10.4583 4.16699 11.6667L10.0003 17.5L15.8337 11.6667Z"
        {...line}
      />
    </Svg>
  );
}
