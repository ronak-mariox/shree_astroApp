import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandGradient } from './BrandGradient';
import {
  RatingStarIcon,
  ReviewFlagIcon,
  ReviewPinIcon,
} from './icons/ReviewIcons';
import { MAX_RATING, type Review } from '../data/reviews';
import { colors, radius, spacing, typography } from '../theme';

const AVATAR_SIZE = 28;
const REPLY_STRIP_HEIGHT = 34;
const REPLY_BUTTON_WIDTH = 62;
const REPLY_BUTTON_HEIGHT = 22;
const STAR_GAP = 2;

type ReviewCardProps = {
  review: Review;
  /**
   * Its one-based place in the list. Two seekers can share a name, so the
   * position is what keeps each card's buttons distinguishable.
   */
  position: number;
  onReply: (review: Review) => void;
  onFlag: (review: Review) => void;
  onPin: (review: Review) => void;
};

/**
 * One seeker's review: who left it, against which order, how they rated it, and
 * the strip where the astrologer answers.
 * Figma: nodes 110:12283 and 110:12306.
 */
export function ReviewCard({
  review,
  position,
  onReply,
  onFlag,
  onPin,
}: ReviewCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.identity}>
          <Text style={styles.name}>{review.reviewer}</Text>
          <Text style={styles.label}>
            Order ID: <Text style={styles.value}>{review.orderId}</Text>
          </Text>
        </View>

        <View style={styles.marks}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Flag review ${position}`}
            accessibilityState={{ selected: review.flagged }}
            onPress={() => onFlag(review)}
            hitSlop={spacing.sm}
            style={({ pressed }) => [
              !review.flagged && styles.markIdle,
              pressed && styles.pressed,
            ]}
          >
            <ReviewFlagIcon />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Pin review ${position}`}
            accessibilityState={{ selected: review.pinned }}
            onPress={() => onPin(review)}
            hitSlop={spacing.sm}
            style={({ pressed }) => [
              !review.pinned && styles.markIdle,
              pressed && styles.pressed,
            ]}
          >
            <ReviewPinIcon />
          </Pressable>
        </View>
      </View>

      <View style={styles.rule} />

      <View style={styles.metaRow}>
        <Text style={styles.label}>
          Service: <Text style={styles.value}>{review.service}</Text>
        </Text>
        <Text style={styles.label}>{review.date}</Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.label}>
          Chat Total Time: <Text style={styles.value}>{review.duration}</Text>
        </Text>

        <View style={styles.rating}>
          <Text style={styles.label}>Rating:</Text>
          <View style={styles.stars}>
            {Array.from({ length: MAX_RATING }, (_, index) => (
              <RatingStarIcon key={index} filled={index < review.rating} />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.replyStrip}>
        <Image
          accessibilityLabel={review.reviewer}
          source={require('../assets/images/seeker-avatar.png')}
          style={styles.avatar}
        />

        <View style={styles.replyText}>
          <Text style={styles.replyName} numberOfLines={1}>
            {review.reply ? review.reply.author : review.reviewer}
          </Text>
          <Text style={styles.replyBody} numberOfLines={2}>
            {review.reply ? review.reply.message : review.comment}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Reply to review ${position}`}
          onPress={() => onReply(review)}
          style={({ pressed }) => [
            styles.replyButton,
            pressed && styles.pressed,
          ]}
        >
          <BrandGradient radius={radius.button} angle="shallow" />
          <Text style={styles.replyLabel}>Reply</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 13,
    paddingTop: 11,
    paddingBottom: 11,
    borderRadius: radius.mediaCard,
    backgroundColor: colors.review.card,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  identity: {
    flex: 1,
  },
  name: {
    ...typography.reviewName,
    color: colors.text.slateMuted,
  },
  label: {
    ...typography.reviewLabel,
    color: colors.text.slateMuted,
  },
  value: {
    ...typography.reviewValue,
    color: colors.review.value,
  },
  marks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingTop: 2,
  },
  // An unset flag or pin reads back at half strength.
  markIdle: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.6,
  },
  rule: {
    height: 1,
    marginTop: 5,
    backgroundColor: colors.border.reviewRule,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingTop: 3,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  stars: {
    flexDirection: 'row',
    gap: STAR_GAP,
  },
  replyStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: REPLY_STRIP_HEIGHT,
    marginTop: 8,
    paddingHorizontal: 3,
    borderRadius: radius.chip * 2,
    backgroundColor: colors.surfaceReply,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 0.3,
    borderColor: colors.surface,
  },
  replyText: {
    flex: 1,
  },
  replyName: {
    ...typography.replyName,
    color: colors.text.slateMuted,
  },
  replyBody: {
    ...typography.replyBody,
    color: colors.text.slateMuted,
  },
  replyButton: {
    width: REPLY_BUTTON_WIDTH,
    height: REPLY_BUTTON_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.button,
    overflow: 'hidden',
  },
  replyLabel: {
    ...typography.historyAction,
    color: colors.text.inverse,
  },
});
