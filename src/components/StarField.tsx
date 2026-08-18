import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, designFrame } from '../theme';

type Star = {
  x: number;
  y: number;
  w: number;
  h: number;
  opacity: number;
};

/**
 * Scattered stars in the welcome hero (Figma nodes 205:5956 – 205:5985).
 * Coordinates are the raw Figma positions on the 390 x 484 artboard; they are
 * converted to percentages at render time so the scatter keeps its shape on
 * taller or narrower screens.
 */
export const HERO_STARS: ReadonlyArray<Star> = [
  { x: 367.22, y: 267.45, w: 1.994, h: 1.994, opacity: 1.0 },
  { x: 47.89, y: 60.79, w: 1.994, h: 1.994, opacity: 0.57 },
  { x: 66.56, y: 120.99, w: 1.994, h: 1.994, opacity: 0.63 },
  { x: 359.96, y: 205.41, w: 1.994, h: 1.994, opacity: 0.75 },
  { x: 113.92, y: 464.04, w: 1.994, h: 1.994, opacity: 0.77 },
  { x: 78.79, y: 126.5, w: 1.994, h: 1.994, opacity: 0.98 },
  { x: 318.71, y: 422.27, w: 2.997, h: 2.997, opacity: 0.68 },
  { x: 148.86, y: 270.82, w: 1.994, h: 1.994, opacity: 0.64 },
  { x: 169.29, y: 188.97, w: 1.994, h: 1.994, opacity: 0.91 },
  { x: 382.69, y: 240.57, w: 2.997, h: 1.994, opacity: 0.79 },
  { x: 388.04, y: 339.99, w: 2.997, h: 1.994, opacity: 0.42 },
  { x: 144.01, y: 266.55, w: 1.994, h: 1.994, opacity: 0.5 },
  { x: 137.34, y: 30.38, w: 1.994, h: 1.994, opacity: 0.78 },
  { x: 340.62, y: 373.39, w: 1.994, h: 1.994, opacity: 0.65 },
  { x: 159.82, y: 313.55, w: 1.994, h: 1.994, opacity: 0.63 },
  { x: 118.58, y: 392.91, w: 1.994, h: 1.994, opacity: 0.6 },
  { x: 17.92, y: 276.5, w: 2.997, h: 2.997, opacity: 0.52 },
  { x: 303.15, y: 390.05, w: 1.994, h: 1.994, opacity: 0.6 },
  { x: 73.6, y: 269.22, w: 1.994, h: 1.994, opacity: 0.88 },
  { x: 173.74, y: 302.28, w: 2.997, h: 1.994, opacity: 0.64 },
  { x: 323.41, y: 456.67, w: 1.994, h: 1.994, opacity: 0.58 },
  { x: 347.54, y: 317.18, w: 2.997, h: 1.994, opacity: 0.75 },
  { x: 65.35, y: 196.98, w: 1.994, h: 2.997, opacity: 0.9 },
  { x: 300.02, y: 70.35, w: 2.997, h: 2.997, opacity: 0.74 },
  { x: 158.93, y: 344.4, w: 1.994, h: 1.994, opacity: 0.99 },
  { x: 282.18, y: 150.15, w: 1.994, h: 1.994, opacity: 0.8 },
  { x: 70.45, y: 378.79, w: 2.997, h: 2.997, opacity: 0.5 },
  { x: 82.31, y: 341.59, w: 1.994, h: 1.994, opacity: 0.95 },
  { x: 380.58, y: 153.66, w: 1.994, h: 1.994, opacity: 0.5 },
  { x: 38.17, y: 355.62, w: 1.994, h: 2.997, opacity: 0.63 },
];

/**
 * The scatter behind the incoming-request popup, on the full 390 x 844 frame
 * (Figma nodes 108:7374 – 108:7431). Sub-pixel white on the light canvas, so it
 * reads as the faintest texture rather than as stars.
 */
export const INCOMING_STARS: ReadonlyArray<Star> = [
  { x: 299.37, y: 367.88, w: 2.323, h: 2.323, opacity: 0.92 },
  { x: 6.45, y: 364.31, w: 2.378, h: 2.378, opacity: 0.98 },
  { x: 362.82, y: 188.38, w: 0.806, h: 0.806, opacity: 0.21 },
  { x: 42.9, y: 181.82, w: 0.829, h: 0.829, opacity: 0.26 },
  { x: 304.03, y: 246.2, w: 0.911, h: 0.911, opacity: 0.42 },
  { x: 296.89, y: 58.77, w: 1.693, h: 1.693, opacity: 0.29 },
  { x: 153.3, y: 159.78, w: 0.972, h: 0.972, opacity: 0.54 },
  { x: 158.17, y: 610.95, w: 2.253, h: 2.253, opacity: 0.85 },
  { x: 273.96, y: 198.47, w: 1.856, h: 1.856, opacity: 0.46 },
  { x: 319.33, y: 802.5, w: 1.618, h: 1.618, opacity: 0.22 },
  { x: 180.04, y: 562.18, w: 1.125, h: 1.125, opacity: 0.85 },
  { x: 152.2, y: 583.26, w: 0.8, h: 0.8, opacity: 0.2 },
  { x: 112.82, y: 828.61, w: 2.124, h: 2.124, opacity: 0.72 },
  { x: 373.43, y: 316.28, w: 0.881, h: 0.881, opacity: 0.36 },
  { x: 181.89, y: 288.39, w: 2.199, h: 2.199, opacity: 0.8 },
  { x: 381.07, y: 662.89, w: 2.392, h: 2.392, opacity: 0.99 },
  { x: 337.5, y: 342.32, w: 1.039, h: 1.039, opacity: 0.68 },
  { x: 312.25, y: 136.48, w: 1.845, h: 1.845, opacity: 0.45 },
  { x: 50.36, y: 240.04, w: 1.851, h: 1.851, opacity: 0.45 },
  { x: 201.05, y: 829.52, w: 1.775, h: 1.775, opacity: 0.38 },
  { x: 306, y: 485.75, w: 0.88, h: 0.88, opacity: 0.36 },
  { x: 204.35, y: 614.3, w: 0.884, h: 0.884, opacity: 0.37 },
  { x: 294.64, y: 181.17, w: 2.315, h: 2.315, opacity: 0.92 },
  { x: 145.45, y: 374.26, w: 1.159, h: 1.159, opacity: 0.92 },
  { x: 199.02, y: 536.09, w: 1.865, h: 1.865, opacity: 0.47 },
  { x: 255.84, y: 328.73, w: 2.182, h: 2.182, opacity: 0.78 },
  { x: 184.86, y: 534, w: 1.002, h: 1.002, opacity: 0.61 },
  { x: 21.7, y: 344.65, w: 2.4, h: 2.4, opacity: 1 },
  { x: 129.34, y: 681.18, w: 0.875, h: 0.875, opacity: 0.35 },
  { x: 9.41, y: 183.15, w: 0.939, h: 0.939, opacity: 0.48 },
  { x: 54.62, y: 168.24, w: 1.193, h: 1.193, opacity: 0.99 },
  { x: 136.68, y: 264.66, w: 2.37, h: 2.37, opacity: 0.97 },
  { x: 215.79, y: 739.24, w: 1.2, h: 1.2, opacity: 1 },
  { x: 86.88, y: 838.89, w: 1.182, h: 1.182, opacity: 0.96 },
  { x: 20.71, y: 574.72, w: 0.85, h: 0.85, opacity: 0.3 },
  { x: 13.41, y: 654.57, w: 1.606, h: 1.606, opacity: 0.21 },
  { x: 304.93, y: 472.33, w: 1.679, h: 1.679, opacity: 0.28 },
  { x: 367.89, y: 545.93, w: 0.822, h: 0.822, opacity: 0.24 },
  { x: 276.02, y: 513.11, w: 0.854, h: 0.854, opacity: 0.31 },
  { x: 148.69, y: 473.05, w: 2.261, h: 2.261, opacity: 0.86 },
  { x: 218.45, y: 520, w: 2.395, h: 2.395, opacity: 1 },
  { x: 252.14, y: 103.2, w: 2.393, h: 2.393, opacity: 0.99 },
  { x: 162.52, y: 479.13, w: 2.361, h: 2.361, opacity: 0.96 },
  { x: 71.41, y: 777.6, w: 1.15, h: 1.15, opacity: 0.9 },
  { x: 309.27, y: 359.9, w: 1.632, h: 1.632, opacity: 0.23 },
  { x: 343.72, y: 94.45, w: 2.23, h: 2.23, opacity: 0.83 },
  { x: 148.81, y: 365.97, w: 2.399, h: 2.399, opacity: 1 },
  { x: 239.97, y: 428.01, w: 1.124, h: 1.124, opacity: 0.85 },
  { x: 342.67, y: 86.46, w: 1.693, h: 1.693, opacity: 0.29 },
  { x: 180.74, y: 483.53, w: 2.045, h: 2.045, opacity: 0.65 },
  { x: 334.94, y: 71.83, w: 2.075, h: 2.075, opacity: 0.68 },
  { x: 199.83, y: 172.2, w: 1.631, h: 1.631, opacity: 0.23 },
  { x: 180.65, y: 356.62, w: 0.991, h: 0.991, opacity: 0.58 },
  { x: 156.43, y: 417.14, w: 1.062, h: 1.062, opacity: 0.72 },
  { x: 360.09, y: 726.13, w: 0.802, h: 0.802, opacity: 0.21 },
  { x: 24.6, y: 778.12, w: 2.282, h: 2.282, opacity: 0.88 },
  { x: 356.47, y: 173.4, w: 1.6, h: 1.6, opacity: 0.2 },
  { x: 132.15, y: 200.93, w: 1.898, h: 1.898, opacity: 0.5 },
];

type StarFieldProps = {
  stars?: ReadonlyArray<Star>;
  color?: string;
  /** Height of the artboard `stars` were measured on. */
  frameHeight?: number;
};

export function StarField({
  stars = HERO_STARS,
  color = colors.cosmos.star,
  frameHeight = designFrame.heroHeight,
}: StarFieldProps) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {stars.map(star => (
        <View
          key={`${star.x}-${star.y}`}
          style={[
            styles.star,
            {
              left: `${(star.x / designFrame.width) * 100}%`,
              top: `${(star.y / frameHeight) * 100}%`,
              width: star.w,
              height: star.h,
              // Square stars are drawn as dots, the stretched ones as slivers.
              borderRadius: star.w === star.h ? star.w / 2 : 0,
              opacity: star.opacity,
              backgroundColor: color,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
  },
});
