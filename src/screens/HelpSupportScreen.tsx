import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { BrandGradient } from '../components/BrandGradient';
import {
  EMAIL_US_COLOR,
  LIVE_CHAT_COLOR,
  SupportChatIcon,
} from '../components/icons/SupportIcons';
import { ProfileHeader } from '../components/ProfileHeader';
import { FAQS, ISSUE_TYPES } from '../data/support';
import { fetchSupportContact } from '../services/api';
import { useAppData } from '../state/AppDataProvider';
import { colors, radius, spacing, typography } from '../theme';

const QUICK_HELP_HEIGHT = 86;
const ISSUE_TILE_HEIGHT = 66;
const DESCRIPTION_HEIGHT = 128;
const SUBMIT_HEIGHT = 48;

type HelpSupportScreenProps = {
  onBack?: () => void;
  /** Quick Help hands off to whatever channel the app opens. */
  onLiveChat?: () => void;
  onEmailUs?: () => void;
};

/**
 * Where the astrologer gets unstuck: two ways to reach support, the questions
 * that come up most, and the form for raising a dispute.
 * Figma: node 110:12355.
 */
export function HelpSupportScreen({
  onBack,
  onLiveChat,
  onEmailUs,
}: HelpSupportScreenProps) {
  const { submitDispute, error, clearError } = useAppData();
  const [issueType, setIssueType] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  /**
   * Quick Help's defaults when the caller doesn't hand off to a channel of
   * its own: "Email Us" opens a mail to the support address the admin set
   * (Settings → Support contact); "Live Chat" calls the support number if
   * one is set — there is no in-app live chat — and otherwise says so and
   * points at email or the dispute form below.
   */
  const emailSupport = async () => {
    const { email } = await fetchSupportContact();
    const url = `mailto:${email}?subject=${encodeURIComponent('Astrologer support request')}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Email us', `Write to ${email} and our team will get back to you.`);
    }
  };
  const liveChat = async () => {
    const { email, phone } = await fetchSupportContact();
    if (phone) {
      try {
        await Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`);
        return;
      } catch {
        /* fall through to the message below */
      }
    }
    Alert.alert(
      'Live chat',
      `Live chat isn't available yet. Email ${email}, or raise a dispute below and support will reply.`,
      [
        { text: 'OK', style: 'cancel' },
        { text: 'Email us', onPress: () => { emailSupport(); } },
      ],
    );
  };

  const submit = async () => {
    setSubmitting(true);
    const raised = await submitDispute({
      issueType: issueType ?? '',
      description,
    });
    setSubmitting(false);
    if (raised) {
      setIssueType(null);
      setDescription('');
      setSent(true);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      <ProfileHeader title="Help & Support" onBack={onBack} />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Help</Text>

          <View style={styles.quickHelp}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Live Chat"
              onPress={onLiveChat ?? liveChat}
              style={({ pressed }) => [
                styles.quickHelpButton,
                pressed && styles.pressed,
              ]}
            >
              <SupportChatIcon color={LIVE_CHAT_COLOR} />
              <Text style={styles.quickHelpLabel}>Live Chat</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Email Us"
              onPress={onEmailUs ?? emailSupport}
              style={({ pressed }) => [
                styles.quickHelpButton,
                pressed && styles.pressed,
              ]}
            >
              <SupportChatIcon color={EMAIL_US_COLOR} />
              <Text style={styles.quickHelpLabel}>Email Us</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FAQs</Text>

          <View style={styles.faqs}>
            {FAQS.map(faq => (
              <View key={faq.question} style={styles.faq}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.disputeTitle]}>
            Raise a Dispute
          </Text>

          <View style={styles.disputePanel}>
            <View style={styles.field}>
              <Text style={styles.label}>Issue Type</Text>

              <View style={styles.issues}>
                {ISSUE_TYPES.map(issue => {
                  const selected = issue.id === issueType;
                  return (
                    <Pressable
                      key={issue.id}
                      accessibilityRole="radio"
                      accessibilityLabel={issue.label}
                      accessibilityState={{ selected }}
                      onPress={() => {
                        clearError();
                        setSent(false);
                        setIssueType(issue.id);
                      }}
                      style={({ pressed }) => [
                        styles.issue,
                        selected && styles.issueSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <issue.Icon
                        color={
                          selected ? colors.text.ink : colors.support.heading
                        }
                      />
                      <Text
                        style={[
                          styles.issueLabel,
                          selected && styles.issueLabelSelected,
                        ]}
                      >
                        {issue.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                accessibilityLabel="Description"
                value={description}
                onChangeText={next => {
                  clearError();
                  setSent(false);
                  setDescription(next);
                }}
                placeholder="Describe your issue in detail..."
                placeholderTextColor={colors.support.body}
                multiline
                style={styles.description}
              />
            </View>

            {error && <Text style={styles.error}>{error}</Text>}
            {sent && (
              <Text style={styles.sent}>
                Your dispute has been raised. Support will be in touch.
              </Text>
            )}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Submit Dispute"
              disabled={submitting}
              onPress={submit}
              style={({ pressed }) => [
                styles.submit,
                submitting && styles.busy,
                pressed && styles.pressed,
              ]}
            >
              <BrandGradient radius={radius.button} angle="shallow" />
              {submitting ? (
                <ActivityIndicator color={colors.text.inverse} size="small" />
              ) : (
                <Text style={styles.submitLabel}>Submit Dispute</Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvasSoft,
  },
  content: {
    paddingHorizontal: spacing.section,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.supportSection,
    color: colors.text.slateMuted,
  },
  disputeTitle: {
    ...typography.supportSection,
    fontFamily: typography.faqQuestion.fontFamily,
    color: colors.support.heading,
  },
  quickHelp: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickHelpButton: {
    flex: 1,
    height: QUICK_HELP_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border.quickHelp,
  },
  quickHelpLabel: {
    ...typography.supportButton,
    color: colors.text.slateMuted,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  busy: {
    opacity: 0.8,
  },
  faqs: {
    gap: spacing.md,
  },
  faq: {
    gap: spacing.sm,
    paddingHorizontal: spacing.section,
    paddingVertical: spacing.section,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border.faq,
  },
  faqQuestion: {
    ...typography.faqQuestion,
    color: colors.text.sheet,
  },
  faqAnswer: {
    ...typography.faqAnswer,
    color: colors.support.body,
  },
  disputePanel: {
    gap: spacing.section,
    padding: spacing.section,
    borderRadius: radius.input,
    backgroundColor: colors.surfaceDispute,
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    ...typography.supportButton,
    color: colors.support.heading,
  },
  issues: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing.sm,
    rowGap: spacing.sm,
  },
  issue: {
    // Two to a row, sharing the 8pt gutter between them.
    width: '48%',
    height: ISSUE_TILE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.input,
    backgroundColor: colors.surface,
  },
  issueSelected: {
    backgroundColor: colors.brandYellow,
  },
  issueLabel: {
    ...typography.issueLabel,
    color: colors.support.body,
    textAlign: 'center',
  },
  issueLabelSelected: {
    color: colors.text.ink,
  },
  description: {
    ...typography.disputeInput,
    height: DESCRIPTION_HEIGHT,
    paddingHorizontal: spacing.section,
    paddingTop: spacing.md,
    borderRadius: radius.composer,
    backgroundColor: colors.surface,
    color: colors.text.sheet,
    textAlignVertical: 'top',
  },
  error: {
    ...typography.faqAnswer,
    color: colors.status.danger,
  },
  sent: {
    ...typography.faqAnswer,
    color: colors.status.success,
  },
  submit: {
    height: SUBMIT_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.button,
    overflow: 'hidden',
  },
  submitLabel: {
    ...typography.disputeButton,
    color: colors.text.inverse,
    textAlign: 'center',
  },
});
