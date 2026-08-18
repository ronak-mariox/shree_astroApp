import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';

import { ChipGroup } from '../components/ChipGroup';
import { OptionGroup } from '../components/OptionGroup';
import { WizardFooter } from '../components/WizardFooter';
import { WizardHeader } from '../components/WizardHeader';
import {
  EXPERIENCE_OPTIONS,
  LANGUAGES,
  RATE_OPTIONS,
  REGISTRATION_STEPS,
  SPECIALIZATIONS,
} from '../data/registration';
import { colors, spacing } from '../theme';

export type ProfessionalDetails = {
  specializations: string[];
  languages: string[];
  experience: string;
  rate: string;
};

type ProfessionalDetailsScreenProps = {
  onBack?: () => void;
  onContinue?: (details: ProfessionalDetails) => void;
};

/** Adds a value to a multi-select list, or takes it back out. */
const toggle = (values: string[], value: string) =>
  values.includes(value)
    ? values.filter(current => current !== value)
    : [...values, value];

/**
 * Step 2 of registration: what the astrologer practises, in which languages,
 * for how long, and at what rate.
 * Figma: node 105:6168.
 */
export function ProfessionalDetailsScreen({
  onBack,
  onContinue,
}: ProfessionalDetailsScreenProps) {
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [experience, setExperience] = useState<string | null>(null);
  const [rate, setRate] = useState<string | null>(null);

  const isComplete =
    specializations.length > 0 &&
    languages.length > 0 &&
    experience !== null &&
    rate !== null;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      <WizardHeader
        step={2}
        totalSteps={REGISTRATION_STEPS}
        title="Professional Details"
        onBack={onBack}
      />

      <ScrollView style={styles.body} contentContainerStyle={styles.content}>
        <ChipGroup
          label="Specializations (select all that apply)"
          options={SPECIALIZATIONS}
          selected={specializations}
          onToggle={value => setSpecializations(current => toggle(current, value))}
        />

        <ChipGroup
          label="Languages Known"
          options={LANGUAGES}
          selected={languages}
          onToggle={value => setLanguages(current => toggle(current, value))}
          tone="info"
        />

        <OptionGroup
          label="Years of Experience"
          options={EXPERIENCE_OPTIONS}
          selected={experience}
          onSelect={setExperience}
          size="sm"
        />

        <OptionGroup
          label="Consultation Rate (₹ per minute)"
          options={RATE_OPTIONS}
          selected={rate}
          onSelect={setRate}
          size="sm"
        />
      </ScrollView>

      <WizardFooter
        label="Continue →"
        disabled={!isComplete}
        onPress={() =>
          onContinue?.({
            specializations,
            languages,
            experience: experience ?? '',
            rate: rate ?? '',
          })
        }
        onBack={onBack}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  body: {
    flex: 1,
  },
  content: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: 18,
  },
});
