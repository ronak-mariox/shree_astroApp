import React from 'react';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';

import { colors } from '../../theme';

/**
 * The marks on the document-upload rows (Figma nodes 105:6332, 105:6350,
 * 105:6392, 105:6410). All four are 19.999pt squares on a 1.5pt stroke; the
 * sources are kept alongside at src/assets/icons/doc-*.svg.
 */
export const DOCUMENT_ICON_SIZE = 19.999;

const VIEW_BOX = '0 0 19.9993 19.9993';
const STROKE_WIDTH = 1.49995;

type IconProps = {
  size?: number;
  color?: string;
};

/** Profile photo — a person's silhouette. */
export function PhotoIcon({
  size = DOCUMENT_ICON_SIZE,
  color = colors.text.secondary,
}: IconProps) {
  const line = {
    stroke: color,
    strokeWidth: STROKE_WIDTH,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const;

  return (
    <Svg width={size} height={size} viewBox={VIEW_BOX} fill="none">
      <Path
        d="M16.6661 17.4994V15.8328C16.6661 14.9488 16.3149 14.1009 15.6898 13.4758C15.0647 12.8507 14.2169 12.4996 13.3329 12.4996H6.66643C5.78241 12.4996 4.93459 12.8507 4.30949 13.4758C3.68439 14.1009 3.33322 14.9488 3.33322 15.8328V17.4994"
        {...line}
      />
      <Path
        d="M9.99965 9.16635C11.8405 9.16635 13.3329 7.67401 13.3329 5.83313C13.3329 3.99224 11.8405 2.49991 9.99965 2.49991C8.15877 2.49991 6.66643 3.99224 6.66643 5.83313C6.66643 7.67401 8.15877 9.16635 9.99965 9.16635Z"
        {...line}
      />
    </Svg>
  );
}

/** Aadhar card, front and back — a lined document. */
export function FileIcon({
  size = DOCUMENT_ICON_SIZE,
  color = colors.text.secondary,
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
        <ClipPath id="file-icon-clip">
          <Rect width="19.9993" height="19.9993" fill="#fff" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#file-icon-clip)">
        <Path
          d="M11.6663 1.66661H4.99983C4.55781 1.66661 4.1339 1.8422 3.82135 2.15475C3.50881 2.4673 3.33322 2.8912 3.33322 3.33322V16.6661C3.33322 17.1081 3.50881 17.532 3.82135 17.8446C4.1339 18.1571 4.55781 18.3327 4.99983 18.3327H14.9995C15.4415 18.3327 15.8654 18.1571 16.1779 17.8446C16.4905 17.532 16.6661 17.1081 16.6661 16.6661V6.66643L11.6663 1.66661Z"
          {...line}
        />
        <Path d="M11.6663 1.66661V6.66643H16.6661" {...line} />
        <Path d="M13.3329 10.833H6.66643" {...line} />
        <Path d="M13.3329 14.1662H6.66643" {...line} />
        <Path d="M8.33304 7.49974H7.49974H6.66643" {...line} />
      </G>
    </Svg>
  );
}

/** PAN card — a padlock, for the most sensitive document. */
export function LockIcon({
  size = DOCUMENT_ICON_SIZE,
  color = colors.text.secondary,
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
        <ClipPath id="lock-icon-clip">
          <Rect width="19.9993" height="19.9993" fill="#fff" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#lock-icon-clip)">
        <Path
          d="M15.8328 9.16635H4.16652C3.24608 9.16635 2.49991 9.91251 2.49991 10.833V16.6661C2.49991 17.5865 3.24608 18.3327 4.16652 18.3327H15.8328C16.7532 18.3327 17.4994 17.5865 17.4994 16.6661V10.833C17.4994 9.91251 16.7532 9.16635 15.8328 9.16635Z"
          {...line}
        />
        <Path
          d="M5.83313 9.16635V5.83313C5.83313 4.7281 6.2721 3.66833 7.05347 2.88695C7.83485 2.10558 8.89462 1.66661 9.99965 1.66661C11.1047 1.66661 12.1645 2.10558 12.9458 2.88695C13.7272 3.66833 14.1662 4.7281 14.1662 5.83313V9.16635"
          {...line}
        />
      </G>
    </Svg>
  );
}

/** Astrology certificate — a graduation cap. */
export function CertificateIcon({
  size = DOCUMENT_ICON_SIZE,
  color = colors.text.secondary,
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
        <ClipPath id="certificate-icon-clip">
          <Rect width="19.9993" height="19.9993" fill="#fff" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#certificate-icon-clip)">
        <Path
          d="M18.3327 8.33304V13.3329M18.3327 8.33304L9.99965 4.16652L1.66661 8.33304L9.99965 12.4996L18.3327 8.33304Z"
          {...line}
        />
        <Path
          d="M4.99983 9.99965V14.1662C7.49974 16.6661 12.4996 16.6661 14.9995 14.1662V9.99965"
          {...line}
        />
      </G>
    </Svg>
  );
}

/** The yellow action tile that starts an upload (Figma node 105:6344). */
export function UploadArrowIcon({
  size = 14.997,
  color = colors.text.ink,
}: IconProps) {
  const line = {
    stroke: color,
    strokeWidth: 1.12474,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const;

  return (
    <Svg width={size} height={size} viewBox="0 0 14.9965 14.9965" fill="none">
      <Path
        d="M13.1219 9.37281V11.8722C13.1219 12.2037 12.9903 12.5215 12.7559 12.7559C12.5215 12.9903 12.2037 13.1219 11.8722 13.1219H3.12427C2.79283 13.1219 2.47496 12.9903 2.24059 12.7559C2.00623 12.5215 1.87456 12.2037 1.87456 11.8722V9.37281"
        {...line}
      />
      <Path d="M4.37398 6.24854L7.49825 9.37281L10.6225 6.24854" {...line} />
      <Path d="M7.49825 9.37281V1.87456" {...line} />
    </Svg>
  );
}
