import React from 'react';
import Svg, { G, Path } from 'react-native-svg';

import { colors } from '../../theme';

/**
 * The marks on the My Reviews and Change Request screens (Figma nodes
 * 110:12201, 110:11895). Sources are kept alongside at
 * src/assets/icons/review-*.svg, filter-chevron.svg, accordion-chevron.svg and
 * row-chevron.svg.
 */

/** A rating star (Figma nodes 110:12290 – 110:12294). */
export const STAR_WIDTH = 12;
export const STAR_HEIGHT = 11;

export function RatingStarIcon({
  width = STAR_WIDTH,
  height = STAR_HEIGHT,
  filled = false,
}: {
  width?: number;
  height?: number;
  filled?: boolean;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 12 11" fill="none">
      <Path
        d="M2.28885 11L3.2733 6.93185L0 4.19678L4.31174 3.83691L6.0004 0L7.68905 3.83614L12 4.19602L8.72749 6.93109L9.71194 10.9992L6.0004 8.83997L2.28885 11Z"
        fill={filled ? colors.review.star : colors.review.starIdle}
      />
    </Svg>
  );
}

/** The flag that marks a review as disputed (Figma node 110:12304). */
export const FLAG_WIDTH = 13;
export const FLAG_HEIGHT = 15.5;

export function ReviewFlagIcon({
  width = FLAG_WIDTH,
  height = FLAG_HEIGHT,
  color = colors.review.flag,
}: {
  width?: number;
  height?: number;
  color?: string;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 13 15.5" fill="none">
      <Path
        d="M0 15.5V0H7.192L7.592 2H13V10H7.808L7.408 8H1V15.5H0Z"
        fill={color}
      />
    </Svg>
  );
}

/** The pin that keeps a review at the top (Figma node 110:12305). */
export const PIN_SIZE = 17;

export function ReviewPinIcon({
  size = PIN_SIZE,
  color = colors.review.pin,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 17 17" fill="none">
      <Path
        d="M11.0869 0L10.3478 2.21734L11.0869 2.9565L6.8784 7.165C6.28081 6.87332 5.62865 6.63808 4.9883 6.49042C4.46885 6.37064 3.96246 6.31169 3.50065 6.31643C2.88666 6.32273 2.35197 6.44185 1.97024 6.68005L10.3198 15.0297C10.7372 14.3608 10.7885 13.2215 10.5094 12.0116C10.3618 11.3713 10.1265 10.7191 9.83492 10.1215L14.0434 5.91292L14.7826 6.65212L17 5.91296L11.0869 0ZM4.97087 10.6089L0 17L6.39111 12.0291L4.97087 10.6089Z"
        fill={color}
      />
    </Svg>
  );
}

/** The chevron on a year / month filter (Figma node 110:12339). */
export const FILTER_CHEVRON_WIDTH = 26.7714;
export const FILTER_CHEVRON_HEIGHT = 24;

export function FilterChevronIcon({
  width = FILTER_CHEVRON_WIDTH,
  height = FILTER_CHEVRON_HEIGHT,
  color = colors.text.slateMuted,
}: {
  width?: number;
  height?: number;
  color?: string;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 26.7714 24" fill="none">
      <G opacity={0.5}>
        <Path
          d="M6.69238 9L13.3852 15L20.0781 9"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
}

/** The magnifier in the reviews search field (Figma node 110:12348). */
export const REVIEW_SEARCH_SIZE = 16.5;

export function ReviewSearchIcon({
  size = REVIEW_SEARCH_SIZE,
  color = colors.text.slateMuted,
}: {
  size?: number;
  color?: string;
}) {
  const line = {
    stroke: color,
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const;

  return (
    <Svg width={size} height={size} viewBox="0 0 16.5 16.5" fill="none">
      <G>
        <Path
          d="M7.41667 14.0833C11.0986 14.0833 14.0833 11.0986 14.0833 7.41667C14.0833 3.73477 11.0986 0.75 7.41667 0.75C3.73477 0.75 0.75 3.73477 0.75 7.41667C0.75 11.0986 3.73477 14.0833 7.41667 14.0833Z"
          {...line}
        />
        <Path d="M15.75 15.75L12.125 12.125" {...line} />
      </G>
    </Svg>
  );
}

/**
 * The chevron on an open service panel — exported pointing up, and rotated by
 * the caller when the panel is closed (Figma node 110:12008).
 */
export const ACCORDION_CHEVRON_WIDTH = 18;
export const ACCORDION_CHEVRON_HEIGHT = 9.81818;

export function AccordionChevronIcon({
  width = ACCORDION_CHEVRON_WIDTH,
  height = ACCORDION_CHEVRON_HEIGHT,
  color = colors.text.inverse,
}: {
  width?: number;
  height?: number;
  color?: string;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 18 9.81818" fill="none">
      <Path
        opacity={0.6}
        d="M17.7604 0.239618C17.4409 -0.0798545 16.9228 -0.0799091 16.6033 0.239673L9.00019 7.84293L1.39672 0.239618C1.07725 -0.0798545 0.559173 -0.0799091 0.239646 0.239673C-0.0798818 0.5592 -0.0798818 1.07722 0.239646 1.39675L8.42168 9.57857C8.57512 9.732 8.78321 9.81818 9.00019 9.81818C9.21718 9.81818 9.42532 9.73195 9.5787 9.57851L17.7603 1.39669C18.0799 1.07722 18.0799 0.559146 17.7604 0.239618Z"
        fill={color}
      />
    </Svg>
  );
}

/** The chevron on a closed service row (Figma node 110:12016). */
export const ROW_CHEVRON_WIDTH = 9.81827;
export const ROW_CHEVRON_HEIGHT = 18.0001;

export function RowChevronIcon({
  width = ROW_CHEVRON_WIDTH,
  height = ROW_CHEVRON_HEIGHT,
  color = colors.text.ink,
}: {
  width?: number;
  height?: number;
  color?: string;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 9.81827 18.0001" fill="none">
      <G>
        <Path
          opacity={0.6}
          d="M0.239706 0.239639C-0.0797673 0.559111 -0.0798219 1.07718 0.23976 1.39671L7.84302 8.99981L0.239706 16.6033C-0.0797673 16.9228 -0.0798219 17.4408 0.23976 17.7604C0.559287 18.0799 1.07731 18.0799 1.39683 17.7604L9.57865 9.57832C9.73209 9.42488 9.81827 9.21679 9.81827 8.99981C9.81827 8.78282 9.73204 8.57468 9.5786 8.4213L1.39678 0.239693C1.07731 -0.0798885 0.559233 -0.0798888 0.239706 0.239639Z"
          fill={color}
        />
      </G>
    </Svg>
  );
}
