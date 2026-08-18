import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors, radius, typography } from '../theme';
import { ChevronSolidIcon, TickDoubleIcon } from './icons/ChatIcons';

const TICK_SIZE = 8;
/** Every bubble in the design is drawn at this width (Figma node 110:441). */
export const BUBBLE_WIDTH = 193;
/** The quoted message's bubble runs a little wider (node 110:481). */
export const QUOTED_BUBBLE_WIDTH = 202.3;

/**
 * The "Union" shape Figma fills every bubble with: a 19.2pt-radius rectangle
 * with a small tail flicking off one top corner. Figma exports it with
 * `preserveAspectRatio="none"`, so it stretches the one path to each bubble's
 * box — this does the same, and mirrors it when the tail belongs on the right.
 * Source vector kept alongside at src/assets/icons/chat-bubble-shape.svg.
 */
const BUBBLE_PATH =
  'M15.418 0C15.6041 0.00014187 15.7882 0.0753779 15.9742 0.0680506C17.6741 0.00105249 19.7057 0 22.2003 0H173.8C180.521 0 183.881 -0.000304624 186.448 1.30762C188.706 2.45807 190.542 4.29393 191.692 6.55176C193 9.1187 193 12.4796 193 19.2002V69.7998C193 76.5204 193 79.8813 191.692 82.4482C190.542 84.7061 188.706 86.5419 186.448 87.6924C183.881 89.0003 180.521 89 173.8 89H22.2003C15.4796 89 12.1188 89.0003 9.55183 87.6924C7.29403 86.5419 5.45814 84.7061 4.30769 82.4482C2.99977 79.8813 3.00007 76.5204 3.00007 69.7998V19.2002C3.00007 17.6544 3.00008 16.2864 3.01601 15.065C3.07069 10.8714 3.09803 8.77464 3.04778 8.18655C2.85691 5.95317 2.94993 6.31029 2.02702 4.26758C1.784 3.7297 1.21182 2.73647 0.067457 0.75C-0.124598 0.416667 0.116348 0 0.501051 0H15.418Z';

/** A quote card nested inside a bubble (Figma nodes 110:487 – 110:492). */
export type QuotedBlock = {
  lines: ReadonlyArray<string>;
};

export type ChatMessage = {
  id: string;
  /** `seeker` sits left in white, `astrologer` right in brand yellow. */
  from: 'seeker' | 'astrologer';
  /**
   * One entry per rendered line, exactly as Figma breaks them. An empty string
   * is the 5pt paragraph gap the design uses rather than a blank line.
   */
  lines: ReadonlyArray<string>;
  time: string;
  /** Which top corner the bubble's tail flicks off, as Figma mirrors it. */
  tail: 'left' | 'right';
  /** The card above the copy on a quoted message. */
  quote?: QuotedBlock;
  /** The strip below the copy on the birth-details message. */
  action?: string;
};

type ChatBubbleProps = {
  message: ChatMessage;
  onAction?: () => void;
};

/**
 * One message: the Union shape behind the copy, its timestamp and delivery tick,
 * plus the quote card or action strip when the design gives it one.
 * Figma: nodes 110:440, 110:450, 110:462, 110:470, 110:478.
 */
export function ChatBubble({ message, onAction }: ChatBubbleProps) {
  const isSeeker = message.from === 'seeker';
  const ink = isSeeker ? colors.text.slateMuted : colors.text.ink;
  const fill = isSeeker ? colors.surface : colors.brandYellow;
  const width = message.quote ? QUOTED_BUBBLE_WIDTH : BUBBLE_WIDTH;

  const bubble = (
    <View style={[styles.bubble, { width }]}>
      <BubbleShape fill={fill} tail={message.tail} />

      {message.quote && (
        <View style={styles.quote}>
          <View style={styles.quoteBar} />
          <View style={styles.quoteCopy}>
            {message.quote.lines.map((line, index) => (
              <Text key={index} style={[styles.line, { color: ink }]}>
                {line}
              </Text>
            ))}
          </View>
        </View>
      )}

      <View style={message.quote ? styles.copyIndented : styles.copy}>
        {message.lines.map((line, index) =>
          line === '' ? (
            <View key={index} style={styles.paragraphGap} />
          ) : (
            <Text key={index} style={[styles.line, { color: ink }]}>
              {line}
            </Text>
          ),
        )}

        <View style={styles.meta}>
          <Text style={[styles.time, { color: ink }]}>{message.time}</Text>
          <TickDoubleIcon size={TICK_SIZE} color={ink} />
        </View>
      </View>
    </View>
  );

  /**
   * Figma seats the birth-details bubble on a yellow rounded rectangle that
   * pokes out below it and carries the action (nodes 110:458, 110:459).
   */
  if (message.action !== undefined) {
    return (
      <View style={isSeeker ? styles.rowLeft : styles.rowRight}>
        <View style={[styles.actionCard, { width }]}>
          {bubble}
          <Pressable
            accessibilityRole="button"
            onPress={onAction}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          >
            <Text style={styles.actionLabel}>{message.action}</Text>
            <ChevronSolidIcon />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={isSeeker ? styles.rowLeft : styles.rowRight}>{bubble}</View>
  );
}

function BubbleShape({
  fill,
  tail,
}: {
  fill: string;
  tail: 'left' | 'right';
}) {
  return (
    <View
      style={[styles.shape, tail === 'right' && styles.shapeMirrored]}
      pointerEvents="none"
    >
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 193 89"
        preserveAspectRatio="none"
      >
        <Path d={BUBBLE_PATH} fill={fill} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  rowLeft: {
    alignItems: 'flex-start',
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  actionCard: {
    borderRadius: radius.input,
    backgroundColor: colors.brandYellow,
    overflow: 'hidden',
  },
  bubble: {
    // The shape is painted behind, so the box itself stays transparent.
    paddingTop: 7,
    paddingBottom: 4.5,
  },
  shape: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  shapeMirrored: {
    transform: [{ scaleX: -1 }],
  },
  copy: {
    paddingLeft: 8.7,
    paddingRight: 10.7,
  },
  // The reply under a quote card is indented a further 3pt (node 110:493).
  copyIndented: {
    paddingLeft: 11.3,
    paddingRight: 10.7,
    paddingTop: 7,
  },
  quote: {
    flexDirection: 'row',
    marginLeft: 8.25,
    marginRight: 8.5,
    borderRadius: radius.well,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  // Figma masks a #CA1B2E rectangle to the card's rounded left edge (110:490).
  quoteBar: {
    width: 5,
    backgroundColor: colors.leave.border,
  },
  quoteCopy: {
    flex: 1,
    paddingLeft: 4,
  },
  line: {
    ...typography.chatBody,
  },
  paragraphGap: {
    height: 5,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 2,
    paddingTop: 2,
  },
  time: {
    ...typography.chatTime,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 27.6,
    paddingLeft: 9,
    paddingRight: 10,
  },
  pressed: {
    opacity: 0.7,
  },
  actionLabel: {
    ...typography.chatAction,
    color: colors.text.ink,
  },
});
