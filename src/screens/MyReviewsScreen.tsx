import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  FilterChevronIcon,
  ReviewSearchIcon,
} from '../components/icons/ReviewIcons';
import { OptionPickerSheet } from '../components/OptionPickerSheet';
import { ProfileHeader } from '../components/ProfileHeader';
import { ReviewCard } from '../components/ReviewCard';
import { ReviewReplySheet } from '../components/ReviewReplySheet';
import {
  DEFAULT_REVIEW_MONTH,
  DEFAULT_REVIEW_YEAR,
  REVIEWS_NOTICE,
  REVIEW_MONTHS,
  REVIEW_YEARS,
  filterReviews,
  type Review,
} from '../data/reviews';
import { useAppData } from '../state/AppDataProvider';
import { colors, radius, spacing, typography } from '../theme';

const FILTER_HEIGHT = 36;

/** Which of the two filters has its picker open. */
type Filter = 'year' | 'month' | null;

type MyReviewsScreenProps = {
  onBack?: () => void;
};

/**
 * Every review the astrologer has been left, narrowed by month and by search,
 * each one answerable, flaggable and pinnable.
 * Figma: node 110:12201.
 */
export function MyReviewsScreen({ onBack }: MyReviewsScreenProps) {
  const {
    reviews,
    replyToReview,
    toggleReviewFlag,
    toggleReviewPin,
    error,
    clearError,
  } = useAppData();

  const [year, setYear] = useState(DEFAULT_REVIEW_YEAR);
  const [month, setMonth] = useState(DEFAULT_REVIEW_MONTH);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>(null);
  const [replyingTo, setReplyingTo] = useState<Review | null>(null);

  const visible = filterReviews(reviews, { year, month, query });

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      <ProfileHeader title="My Reviews" onBack={onBack} />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Ratings And Reviews</Text>
          <Text style={styles.noticeBody}>{REVIEWS_NOTICE}</Text>
        </View>

        <View style={styles.filters}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Year"
            onPress={() => setFilter('year')}
            style={({ pressed }) => [styles.filter, pressed && styles.pressed]}
          >
            <Text style={styles.filterLabel}>{year}</Text>
            <FilterChevronIcon />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Month"
            onPress={() => setFilter('month')}
            style={({ pressed }) => [styles.filter, pressed && styles.pressed]}
          >
            <Text style={styles.filterLabel}>{month}</Text>
            <FilterChevronIcon />
          </Pressable>
        </View>

        <View style={styles.search}>
          <ReviewSearchIcon />
          <TextInput
            accessibilityLabel="Search reviews"
            value={query}
            onChangeText={setQuery}
            placeholder="Search Here..."
            placeholderTextColor={colors.text.slateMuted}
            style={styles.searchInput}
          />
        </View>

        {visible.length === 0 && (
          <Text style={styles.empty}>
            No reviews for {month} {year}.
          </Text>
        )}

        {visible.map((review, index) => (
          <ReviewCard
            key={review.id}
            review={review}
            position={index + 1}
            onReply={next => {
              clearError();
              setReplyingTo(next);
            }}
            onFlag={next => toggleReviewFlag(next.id)}
            onPin={next => toggleReviewPin(next.id)}
          />
        ))}
      </ScrollView>

      {filter && (
        <OptionPickerSheet
          visible
          title={filter === 'year' ? 'Year' : 'Month'}
          options={filter === 'year' ? REVIEW_YEARS : REVIEW_MONTHS}
          value={filter === 'year' ? year : month}
          onDismiss={() => setFilter(null)}
          onConfirm={value => {
            if (filter === 'year') setYear(value);
            else setMonth(value);
            setFilter(null);
          }}
        />
      )}

      <ReviewReplySheet
        review={replyingTo}
        error={replyingTo ? error : null}
        onDismiss={() => {
          clearError();
          setReplyingTo(null);
        }}
        onSend={async message => {
          if (!replyingTo) return false;
          const sent = await replyToReview(replyingTo.id, message);
          if (sent) {
            setReplyingTo(null);
          }
          return sent;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvasSoft,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  notice: {
    paddingHorizontal: 11,
    paddingVertical: 11,
    borderRadius: radius.mediaCard,
    backgroundColor: colors.surfaceInset,
  },
  noticeTitle: {
    ...typography.reviewBannerTitle,
    color: colors.text.sheet,
  },
  noticeBody: {
    ...typography.reviewBannerBody,
    color: colors.text.sheet,
    paddingTop: 4,
  },
  filters: {
    flexDirection: 'row',
    gap: 9,
  },
  filter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: FILTER_HEIGHT,
    paddingLeft: 10,
    paddingRight: 4,
    borderRadius: radius.mediaCard,
    borderWidth: 1,
    borderColor: colors.border.reviewFilter,
    backgroundColor: colors.border.reviewFilter,
  },
  filterLabel: {
    ...typography.reviewLabel,
    color: colors.review.filterLabel,
  },
  pressed: {
    opacity: 0.6,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    height: FILTER_HEIGHT,
    paddingHorizontal: 8,
    borderRadius: radius.mediaCard,
    borderWidth: 1,
    borderColor: colors.border.reviewFilter,
    backgroundColor: colors.border.reviewFilter,
  },
  searchInput: {
    ...typography.reviewLabel,
    flex: 1,
    paddingVertical: 0,
    color: colors.text.slateMuted,
  },
  empty: {
    ...typography.reviewLabel,
    color: colors.text.slateMuted,
    textAlign: 'center',
    paddingTop: spacing.lg,
    opacity: 0.8,
  },
});
