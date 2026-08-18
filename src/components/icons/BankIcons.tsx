import React from 'react';
import Svg, { Ellipse, G, Path } from 'react-native-svg';

import { colors } from '../../theme';

/**
 * The marks on the bank-details flow (Figma nodes 110:6514, 110:6793,
 * 110:6992). Sources are kept alongside at src/assets/icons/bank-*.svg,
 * sheet-close.svg and upload-cloud.svg.
 */

/** The yellow disc behind the banking illustration (Figma node 110:6610). */
export const BANK_HALO_SIZE = 71.9001;

export function BankHalo({ size = BANK_HALO_SIZE }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 71.9001 71.9001" fill="none">
      <Ellipse cx="35.9501" cy="35.95" rx="35.9501" ry="35.95" fill="#FFDB5D" />
    </Svg>
  );
}

/** The eye beside the account's status (Figma node 110:6644). */
export const EYE_WIDTH = 16.5445;
export const EYE_HEIGHT = 10.7301;

export function EyeIcon({
  width = EYE_WIDTH,
  height = EYE_HEIGHT,
  color = colors.bank.accent,
}: {
  width?: number;
  height?: number;
  color?: string;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 16.5445 10.7301" fill="none">
      <G>
        <Path
          d="M8.27162 2.3845C6.48983 2.3845 5.04028 3.72158 5.04028 5.36507C5.04028 7.00856 6.48983 8.34565 8.27162 8.34565C10.0534 8.34565 11.503 7.00856 11.503 5.36507C11.503 3.72158 10.0534 2.3845 8.27162 2.3845ZM8.27162 7.15342C7.20256 7.15342 6.33282 6.35116 6.33282 5.36507C6.33282 4.37898 7.20256 3.57673 8.27162 3.57673C9.34068 3.57673 10.2104 4.37898 10.2104 5.36507C10.2104 6.35116 9.34068 7.15342 8.27162 7.15342Z"
          fill={color}
        />
        <Path
          d="M16.3315 5.04978C15.6977 4.11161 12.4726 0 8.27222 0C4.07278 0 0.846804 4.11155 0.212977 5.04978L0 5.36503L0.212977 5.68029C0.846739 6.61846 4.07184 10.7301 8.27222 10.7301C12.4717 10.7301 15.6976 6.61852 16.3315 5.68029L16.5444 5.36503L16.3315 5.04978ZM8.27222 9.53784C5.01387 9.53784 2.33102 6.38576 1.54755 5.36456C2.32957 4.34252 5.00553 1.19223 8.27222 1.19223C11.5303 1.19223 14.2131 4.34386 14.9969 5.36551C14.2149 6.38758 11.5389 9.53784 8.27222 9.53784Z"
          fill={color}
        />
      </G>
    </Svg>
  );
}

/** The dismiss mark on a sheet's yellow header (Figma nodes 110:6804, 110:6997). */
export const SHEET_CLOSE_SIZE = 24.8477;

export function SheetCloseIcon({
  size = SHEET_CLOSE_SIZE,
  color = colors.text.ink,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24.8477 24.8477" fill="none">
      <Path
        d="M12.4238 0C5.56238 0 0 5.56238 0 12.4238C0 19.2857 5.56238 24.8477 12.4238 24.8477C19.2857 24.8477 24.8477 19.2857 24.8477 12.4238C24.8477 5.56238 19.2857 0 12.4238 0ZM12.4238 23.3191C6.42972 23.3191 1.55298 18.4179 1.55298 12.4238C1.55298 6.42967 6.42972 1.55293 12.4238 1.55293C18.4179 1.55293 23.2947 6.4297 23.2947 12.4238C23.2947 18.4179 18.4179 23.3191 12.4238 23.3191ZM16.816 8.03162C16.5128 7.7284 16.0213 7.7284 15.7181 8.03162L12.4238 11.3259L9.12957 8.03162C8.82635 7.7284 8.33484 7.7284 8.03123 8.03162C7.72801 8.33484 7.72801 8.82635 8.03123 9.12957L11.3255 12.4238L8.03123 15.7181C7.72801 16.0209 7.72801 16.5132 8.03123 16.8161C8.33445 17.1193 8.82596 17.1193 9.12957 16.8161L12.4238 13.5218L15.7181 16.8161C16.0213 17.1193 16.5128 17.1193 16.816 16.8161C17.1193 16.5132 17.1193 16.0209 16.816 15.7181L13.5218 12.4238L16.816 9.12957C17.1196 8.82596 17.1196 8.33445 16.816 8.03162Z"
        fill={color}
      />
    </Svg>
  );
}

/** The cloud on the account-proof drop zone (Figma node 110:6831). */
export const UPLOAD_CLOUD_SIZE = 40;

export function UploadCloudIcon({
  size = UPLOAD_CLOUD_SIZE,
  color = colors.text.slateMuted,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Path
        d="M32.25 16.7333C31.1167 10.9833 26.0667 6.66667 20 6.66667C15.1833 6.66667 11 9.4 8.91667 13.4C3.9 13.9333 0 18.1833 0 23.3333C0 28.85 4.48333 33.3333 10 33.3333H31.6667C36.2667 33.3333 40 29.6 40 25C40 20.6 36.5833 17.0333 32.25 16.7333ZM31.6667 30H10C6.31667 30 3.33333 27.0167 3.33333 23.3333C3.33333 19.9167 5.88333 17.0667 9.26667 16.7167L11.05 16.5333L11.8833 14.95C13.4667 11.9 16.5667 10 20 10C24.3667 10 28.1333 13.1 28.9833 17.3833L29.4833 19.8833L32.0333 20.0667C34.6333 20.2333 36.6667 22.4167 36.6667 25C36.6667 27.75 34.4167 30 31.6667 30ZM13.3333 21.6667H17.5833V26.6667H22.4167V21.6667H26.6667L20 15L13.3333 21.6667Z"
        fill={color}
      />
    </Svg>
  );
}
