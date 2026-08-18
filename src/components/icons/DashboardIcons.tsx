import React from 'react';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';

import { colors } from '../../theme';

/**
 * The dashboard's line icons. Figma exports several of them more than once at
 * different scales — the chat bubble at 9.994 / 17.993 / 21.993 and the wallet
 * card at 17.993 / 21.993 — but each set is one vector uniformly scaled (the
 * stroke stays at 0.075 of the box), so one source and a `size` prop cover all
 * the uses. Sources are kept alongside in src/assets/icons.
 */

type IconProps = {
  size?: number;
  color?: string;
};

/** Statistic well, Consult tab and chat tag (Figma nodes 104:5820, 104:5708, 104:5925). */
export function ChatBubbleIcon({
  size = 17.993,
  color = colors.status.info,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 17.9934 17.9934" fill="none">
      <Path
        d="M15.7442 11.2459C15.7442 11.6436 15.5862 12.0249 15.305 12.3061C15.0238 12.5873 14.6425 12.7453 14.2448 12.7453H5.24808L2.24918 15.7442V3.74863C2.24918 3.35095 2.40715 2.96956 2.68835 2.68835C2.96956 2.40715 3.35095 2.24918 3.74863 2.24918H14.2448C14.6425 2.24918 15.0238 2.40715 15.305 2.68835C15.5862 2.96956 15.7442 3.35095 15.7442 3.74863V11.2459Z"
        stroke={color}
        strokeWidth={1.3495}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Wallet stat card and the Wallet tab (Figma nodes 104:5790, 104:5715). */
export function WalletCardIcon({
  size = 17.993,
  color = colors.text.ink,
}: IconProps) {
  const line = {
    stroke: color,
    strokeWidth: 1.3495,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const;

  return (
    <Svg width={size} height={size} viewBox="0 0 17.9934 17.9934" fill="none">
      <Defs>
        <ClipPath id="wallet-card-clip">
          <Rect width="17.9934" height="17.9934" fill="#fff" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#wallet-card-clip)">
        <Path
          d="M14.9945 3.74863H2.9989C2.17078 3.74863 1.49945 4.41995 1.49945 5.24808V12.7453C1.49945 13.5734 2.17078 14.2448 2.9989 14.2448H14.9945C15.8226 14.2448 16.4939 13.5734 16.4939 12.7453V5.24808C16.4939 4.41995 15.8226 3.74863 14.9945 3.74863Z"
          {...line}
        />
        <Path d="M11.9956 8.9967H12.0031" {...line} />
        <Path d="M1.49945 7.49725H16.4939" {...line} />
      </G>
    </Svg>
  );
}

/** Today's-earnings card (Figma node 104:5769). */
export function TrendingUpIcon({
  size = 17.993,
  color = colors.status.success,
}: IconProps) {
  const line = {
    stroke: color,
    strokeWidth: 1.3495,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const;

  return (
    <Svg width={size} height={size} viewBox="0 0 17.9934 17.9934" fill="none">
      <Defs>
        <ClipPath id="trending-up-clip">
          <Rect width="17.9934" height="17.9934" fill="#fff" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#trending-up-clip)">
        <Path
          d="M17.2437 4.49835L10.1213 11.6207L6.37266 7.87211L0.749725 13.4951"
          {...line}
        />
        <Path d="M12.7453 4.49835H17.2437V8.9967" {...line} />
      </G>
    </Svg>
  );
}

/** The rating statistic (Figma node 104:5831). */
export function StarOutlineIcon({
  size = 17.993,
  color = colors.status.warning,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 17.9934 17.9934" fill="none">
      <Defs>
        <ClipPath id="star-outline-clip">
          <Rect width="17.9934" height="17.9934" fill="#fff" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#star-outline-clip)">
        <Path
          d="M8.9967 1.49945L11.3134 6.19273L16.4939 6.94995L12.7453 10.6011L13.63 15.7592L8.9967 13.3226L4.3634 15.7592L5.24808 10.6011L1.49945 6.94995L6.68005 6.19273L8.9967 1.49945Z"
          stroke={color}
          strokeWidth={1.3495}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
}

/** Voice tag on a request (Figma node 104:5961). */
export function PhoneIcon({
  size = 9.994,
  color = colors.status.success,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 9.99373 9.99373" fill="none">
      <Defs>
        <ClipPath id="phone-icon-clip">
          <Rect width="9.99373" height="9.99373" fill="#fff" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#phone-icon-clip)">
        <Path
          d="M6.2669 2.08203C6.67362 2.16138 7.04741 2.36029 7.34042 2.65331C7.63344 2.94632 7.83235 3.32011 7.9117 3.72683M6.2669 0.416405C7.1119 0.510278 7.89987 0.888682 8.50143 1.48949C9.10299 2.09029 9.48239 2.87778 9.57733 3.72266M9.16092 7.04558V8.2948C9.16139 8.41077 9.13764 8.52555 9.09118 8.63181C9.04472 8.73807 8.97658 8.83345 8.89112 8.91185C8.80567 8.99025 8.70478 9.04994 8.59492 9.08709C8.48506 9.12425 8.36866 9.13804 8.25316 9.12761C6.95026 8.9895 5.69907 8.54272 4.60338 7.82433C3.50769 7.10594 2.59909 6.13665 1.95294 4.99687C1.21888 4.03496 0.70565 2.9232 0.449718 1.74057C0.439342 1.62577 0.45291 1.51007 0.489565 1.40078C0.526219 1.29149 0.585162 1.19101 0.662662 1.10568C0.740161 1.02035 0.834531 0.952041 0.939797 0.905071C1.04506 0.858102 1.15893 0.833496 1.2742 0.832811H2.52342C2.7255 0.830822 2.92141 0.902383 3.07464 1.03416C3.22786 1.16593 3.32794 1.34892 3.35623 1.54903C3.40911 1.94878 3.50655 2.34145 3.64771 2.71913C3.70374 2.86817 3.71586 3.03015 3.68265 3.18587C3.64944 3.34159 3.57229 3.48453 3.46033 3.59774L3.29377 3.58109C3.89681 4.62849 4.77341 5.49214 5.82968 6.07952L6.22943 5.67977C6.34264 5.56781 6.48558 5.49066 6.6413 5.45745C6.79702 5.42424 6.959 5.43636 7.10804 5.49239C7.48572 5.63355 7.87839 5.73099 8.27814 5.78387C8.43913 5.74797 8.60716 5.76067 8.76092 5.82039C8.91467 5.8801 9.04724 5.98413 9.1418 6.11928C9.23636 6.25443 9.28866 6.41461 9.29206 6.57952C9.29547 6.74443 9.24982 6.90664 9.16092 7.04558Z"
          stroke={color}
          strokeWidth={0.74953}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
}

/** The Decline button's cross (Figma node 104:5939). */
export function CloseIcon({
  size = 12,
  color = colors.status.danger,
}: IconProps) {
  const line = {
    stroke: color,
    strokeWidth: 1.24996,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const;

  return (
    <Svg width={size} height={size} viewBox="0 0 11.9996 11.9996" fill="none">
      <Path d="M8.9997 2.9999L2.9999 8.9997" {...line} />
      <Path d="M2.9999 2.9999L8.9997 8.9997" {...line} />
    </Svg>
  );
}

/** Home tab (Figma node 104:5700). */
export function HomeIcon({
  size = 21.993,
  color = colors.status.success,
}: IconProps) {
  const line = {
    stroke: color,
    strokeWidth: 1.6495,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const;

  return (
    <Svg width={size} height={size} viewBox="0 0 21.9933 21.9933" fill="none">
      <Path
        d="M2.74916 8.24749L10.9966 1.83277L19.2441 8.24749V18.3277C19.2441 18.8138 19.051 19.28 18.7073 19.6237C18.3636 19.9674 17.8974 20.1605 17.4114 20.1605H4.58194C4.09586 20.1605 3.62968 19.9674 3.28597 19.6237C2.94226 19.28 2.74916 18.8138 2.74916 18.3277V8.24749Z"
        {...line}
      />
      <Path d="M8.24749 20.1605V10.9966H13.7458V20.1605" {...line} />
    </Svg>
  );
}

/** Alerts tab (Figma node 104:5724). */
export function BellIcon({
  size = 21.993,
  color = colors.text.muted,
}: IconProps) {
  const line = {
    stroke: color,
    strokeWidth: 1.6495,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const;

  return (
    <Svg width={size} height={size} viewBox="0 0 21.9933 21.9933" fill="none">
      <Path
        d="M16.495 7.3311C16.495 5.87285 15.9157 4.47433 14.8846 3.4432C13.8534 2.41206 12.4549 1.83277 10.9966 1.83277C9.5384 1.83277 8.13988 2.41206 7.10875 3.4432C6.07761 4.47433 5.49832 5.87285 5.49832 7.3311C5.49832 13.7458 2.74916 15.5786 2.74916 15.5786H19.2441C19.2441 15.5786 16.495 13.7458 16.495 7.3311Z"
        {...line}
      />
      <Path
        d="M12.582 19.2441C12.4209 19.5219 12.1896 19.7524 11.9114 19.9127C11.6332 20.0729 11.3177 20.1573 10.9966 20.1573C10.6756 20.1573 10.3601 20.0729 10.0819 19.9127C9.80366 19.7524 9.57241 19.5219 9.4113 19.2441"
        {...line}
      />
    </Svg>
  );
}

/** Menu tab — three rules, wider than they are tall (Figma node 112:2241). */
export function MenuIcon({
  width = 20,
  height = 12,
  color = colors.text.muted,
}: {
  width?: number;
  height?: number;
  color?: string;
}) {
  const line = {
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round',
  } as const;

  return (
    <Svg width={width} height={height} viewBox="0 0 22 14" fill="none">
      <Path d="M1 1H21" {...line} />
      <Path d="M1 7H21" {...line} />
      <Path d="M1 13H21" {...line} />
    </Svg>
  );
}
