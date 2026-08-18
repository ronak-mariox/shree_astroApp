import React from 'react';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { colors } from '../../theme';

/**
 * The marks on the documents flow (Figma nodes 110:6999, 110:7414). Sources are
 * kept alongside at src/assets/icons/document-bin-*.svg, radio-*.svg and
 * upload-cloud-small.svg.
 */

/**
 * The bin on a document's delete button (Figma node 110:7116). Figma draws it
 * as four separate strokes — a body, a lid and three ribs — so they are
 * reassembled here at the offsets it lays them out on.
 */
export const BIN_WIDTH = 12.2;
export const BIN_HEIGHT = 16.9392;

export function DocumentBinIcon({
  width = BIN_WIDTH,
  height = BIN_HEIGHT,
  color = colors.text.inverse,
}: {
  width?: number;
  height?: number;
  color?: string;
}) {
  const stroke = {
    stroke: color,
    strokeMiterlimit: 10,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const;

  return (
    <Svg width={width} height={height} viewBox="0 0 12.2 16.9392" fill="none">
      <Path
        d="M11.7 4.18333V2.90833C11.7 2.4125 11.3 1.9875 10.8333 1.9875H8.36667L8.1 0.925C7.96667 0.641667 7.76667 0.5 7.43333 0.5H4.76667C4.5 0.5 4.23333 0.641667 4.1 0.925L3.83333 1.91667H1.36667C0.9 1.91667 0.5 2.34167 0.5 2.8375V4.18333C0.5 4.39583 0.7 4.60833 0.9 4.60833H11.3C11.5667 4.60833 11.7 4.39583 11.7 4.18333Z"
        {...stroke}
      />
      <G transform="translate(0.67, 4.11)">
        <Path
          d="M9.23333 12.3292H1.63333C0.966667 12.3292 0.5 11.7625 0.5 11.125V0.5H10.3667V11.0542C10.3667 11.7625 9.83333 12.3292 9.23333 12.3292Z"
          {...stroke}
        />
      </G>
      {[3.47, 5.6, 7.74].map(x => (
        <G key={x} transform={`translate(${x}, 6.66)`}>
          <Path d="M0.5 0.5V7.22917" {...stroke} />
        </G>
      ))}
    </Svg>
  );
}

/** A document-type option's radio (Figma nodes 110:7455, 110:7456, 110:7462). */
export const RADIO_SIZE = 12.2153;

export function RadioMark({
  size = RADIO_SIZE,
  selected = false,
}: {
  size?: number;
  selected?: boolean;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 12.2153 12.2153" fill="none">
      {selected ? (
        <>
          <Circle cx="6.10767" cy="6.10767" r="6.10767" fill={colors.surface} />
          <G transform="translate(2.355, 3.697)">
            <Path
              d="M0.295281 2.43044L3.0863 4.47292L7.20566 0.353553"
              stroke={colors.text.ink}
            />
          </G>
        </>
      ) : (
        <Circle
          cx="6.10767"
          cy="6.10767"
          r="5.60767"
          stroke={colors.border.radio}
        />
      )}
    </Svg>
  );
}

/**
 * The smaller cloud on the upload sheet's drop zone (Figma node 110:7431).
 * Figma clips it to a 28pt square, of which the glyph fills the middle two
 * thirds, so the outer box and the leaf are kept apart here.
 */
export const UPLOAD_SMALL_WIDTH = 28;
export const UPLOAD_SMALL_HEIGHT = 18.6667;

export function UploadCloudSmallIcon({
  width = UPLOAD_SMALL_WIDTH,
  height = UPLOAD_SMALL_HEIGHT,
  color = '#D3D3D3',
}: {
  width?: number;
  height?: number;
  color?: string;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 28 18.6667" fill="none">
      <Path
        d="M22.575 7.04667C21.7817 3.02167 18.2467 0 14 0C10.6283 0 7.7 1.91333 6.24167 4.71333C2.73 5.08667 0 8.06167 0 11.6667C0 15.5283 3.13833 18.6667 7 18.6667H22.1667C25.3867 18.6667 28 16.0533 28 12.8333C28 9.75333 25.6083 7.25667 22.575 7.04667ZM22.1667 16.3333H7C4.42167 16.3333 2.33333 14.245 2.33333 11.6667C2.33333 9.275 4.11833 7.28 6.48667 7.035L7.735 6.90667L8.31833 5.79833C9.42667 3.66333 11.5967 2.33333 14 2.33333C17.0567 2.33333 19.6933 4.50333 20.2883 7.50167L20.6383 9.25167L22.4233 9.38C24.2433 9.49667 25.6667 11.025 25.6667 12.8333C25.6667 14.7583 24.0917 16.3333 22.1667 16.3333ZM9.33333 10.5H12.3083V14H15.6917V10.5H18.6667L14 5.83333L9.33333 10.5Z"
        fill={color}
      />
    </Svg>
  );
}
