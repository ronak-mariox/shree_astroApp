import React, { useRef, useState } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  type ScrollViewInstance,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconHalo } from '../components/IconHalo';
import { ONBOARDING_ICON_SIZE } from '../components/icons/OnboardingIcons';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { SlideProgress } from '../components/SlideProgress';
import { ONBOARDING_SLIDES } from '../data/onboarding';
import { colors, spacing, typography } from '../theme';

type OnboardingScreenProps = {
  /** "Skip" — jump straight past the pitch. */
  onSkip?: () => void;
  /** "Get Started →" on the last slide. */
  onFinish?: () => void;
};

/**
 * Four-slide pitch for the astrologer app: an icon, a headline, a paragraph and
 * a pager indicator, with Skip / Next in the footer until the last slide swaps
 * them for a single "Get Started".
 * Figma: nodes 104:4916, 104:5007, 104:5102, 104:5196.
 */
export function OnboardingScreen({ onSkip, onFinish }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const pager = useRef<ScrollViewInstance>(null);
  const [index, setIndex] = useState(0);

  const lastIndex = ONBOARDING_SLIDES.length - 1;
  const isLast = index === lastIndex;

  const goTo = (next: number) => {
    setIndex(next);
    pager.current?.scrollTo({ x: next * width, animated: true });
  };

  /** Keeps the indicator in step when the slides are swiped instead. */
  const onMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const offset = event.nativeEvent.contentOffset.x;
    setIndex(Math.round(offset / width));
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        ref={pager}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        style={styles.pager}
      >
        {ONBOARDING_SLIDES.map((slide, slideIndex) => (
          <View key={slide.id} style={[styles.slide, { width }]}>
            <View style={styles.iconWrap}>
              <IconHalo>
                <slide.Icon size={ONBOARDING_ICON_SIZE} />
              </IconHalo>
            </View>

            <Text style={[styles.title, { maxWidth: slide.titleWidth }]}>
              {slide.title}
            </Text>

            <Text style={styles.body}>{slide.body}</Text>

            <SlideProgress
              count={ONBOARDING_SLIDES.length}
              activeIndex={slideIndex}
            />
          </View>
        ))}
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: spacing.huge + insets.bottom }]}
      >
        {isLast ? (
          <PrimaryButton
            label="Get Started →"
            labelStyle={typography.buttonStrong}
            onPress={onFinish}
            style={styles.finishButton}
          />
        ) : (
          <>
            <SecondaryButton
              label="Skip"
              variant="brand"
              labelStyle={typography.buttonSmall}
              onPress={onSkip}
              style={styles.skipButton}
            />
            <PrimaryButton
              label="Next →"
              labelStyle={typography.buttonSmallStrong}
              gradientAngle="shallow"
              onPress={() => goTo(Math.min(index + 1, lastIndex))}
              style={styles.nextButton}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  pager: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  iconWrap: {
    paddingBottom: spacing.xxxl,
  },
  title: {
    ...typography.slideTitle,
    color: colors.text.ink,
    textAlign: 'center',
    paddingBottom: spacing.section,
  },
  // Figma caps the copy at 326pt so it breaks where the design does; a cap
  // rather than a fixed width keeps it inside narrower screens.
  body: {
    ...typography.slideBody,
    color: colors.text.body,
    textAlign: 'center',
    maxWidth: 326,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  // The footer splits 111 / 219 between Skip and Next (Figma nodes 104:4997,
  // 104:5000); the flex values are those widths.
  skipButton: {
    flex: 111.005,
  },
  nextButton: {
    flex: 218.989,
  },
  finishButton: {
    flex: 1,
  },
});
