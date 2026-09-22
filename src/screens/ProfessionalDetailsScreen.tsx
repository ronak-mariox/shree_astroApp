import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

import { ChipGroup } from '../components/ChipGroup';
import { OptionGroup } from '../components/OptionGroup';
import { WizardFooter } from '../components/WizardFooter';
import { WizardHeader } from '../components/WizardHeader';
import {
  EXPERIENCE_OPTIONS,
  EXPERIENCE_YEARS,
  LANGUAGES,
  LANGUAGE_IDS,
  RATE_OPTIONS,
  REGISTRATION_STEPS,
  SPECIALIZATIONS,
  SPECIALIZATION_IDS,
} from '../data/registration';
import { register, type AuthSession } from '../services/auth';
import { setOpeningRates } from '../services/api';
import type { PersonalInfo } from './PersonalInfoScreen';
import { colors, spacing, typography } from '../theme';

export type ProfessionalDetails = {
  specializations: string[];
  languages: string[];
  experience: string;
  rate: string;
  callRate: string;
};

type ProfessionalDetailsScreenProps = {
  /** Step 1's answers — combined with this step's to actually open the account. */
  personalInfo: PersonalInfo;
  onBack?: () => void;
  /** Fires once the account is real and signed in. */
  onRegistered?: (session: AuthSession) => void;
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
 *
 * This is also where the account actually gets created — `personalInfo` plus
 * everything collected here is exactly what `POST /auth/astrologer/register`
 * takes in one call, so there is nothing left for steps 1 and 2 apart to wait
 * for. Documents and a bank account (steps 3-4) are filed against the real,
 * signed-in account this opens.
 */
export function ProfessionalDetailsScreen({
  personalInfo,
  onBack,
  onRegistered,
}: ProfessionalDetailsScreenProps) {
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [experience, setExperience] = useState<string | null>(null);
  const [rate, setRate] = useState<string | null>(null);
  const [callRate, setCallRate] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isComplete =
    specializations.length > 0 &&
    languages.length > 0 &&
    experience !== null &&
    rate !== null &&
    callRate !== null;

  const submit = async () => {
    if (!isComplete || submitting) {
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const session = await register({
        fullName: personalInfo.fullName,
        phone: personalInfo.mobile,
        gender: personalInfo.gender,
        dateOfBirth: personalInfo.dateOfBirth,
        languages: languages.map(label => LANGUAGE_IDS[label] ?? label),
        expertise: specializations.map(label => SPECIALIZATION_IDS[label] ?? label),
        experienceYears: experience ? EXPERIENCE_YEARS[experience] : undefined,
      });

      /**
       * Rates are not part of `register()` — they land on their own endpoint.
       * "Custom" has no amount attached to it in this UI yet, so it is left
       * for the astrologer to set from the dashboard/price-change flow later
       * rather than guessed at here.
       */
      const services = [
        rate && rate !== 'custom' ? { type: 'chat', ratePerMinute: Number(rate) } : null,
        callRate && callRate !== 'custom'
          ? { type: 'call', ratePerMinute: Number(callRate) }
          : null,
      ].filter((service): service is { type: string; ratePerMinute: number } => service !== null);

      if (services.length > 0) {
        try {
          await setOpeningRates(services);
        } catch {
          /** The account exists either way; rates can be set again later. */
        }
      }

      onRegistered?.(session);
    } catch (caught) {
      setError(
        (caught as Error)?.message ?? 'Something went wrong. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

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
          label="Chat Rate (₹ per minute)"
          options={RATE_OPTIONS}
          selected={rate}
          onSelect={setRate}
          size="sm"
        />

        <OptionGroup
          label="Call Rate (₹ per minute)"
          options={RATE_OPTIONS}
          selected={callRate}
          onSelect={setCallRate}
          size="sm"
        />

        {error !== null && <Text style={styles.error}>{error}</Text>}
      </ScrollView>

      <WizardFooter
        label={submitting ? 'Creating account…' : 'Continue →'}
        disabled={!isComplete || submitting}
        onPress={submit}
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
  error: {
    ...typography.caption,
    color: colors.status.danger,
    textAlign: 'center',
  },
});
