import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

import { ChatBubble, type ChatMessage } from '../components/ChatBubble';
import { ChatComposer } from '../components/ChatComposer';
import { ChatHeader } from '../components/ChatHeader';
import { GenerateKundliSheet } from '../components/GenerateKundliSheet';
import { KundliDetailsSheet } from '../components/KundliDetailsSheet';
import { LeaveChatDialog } from '../components/LeaveChatDialog';
import { useApi } from '../hooks/useApi';
import * as api from '../services/api';
import type { KundliDraft } from '../data/kundli';
import { colors, spacing } from '../theme';

type ConsultationChatScreenProps = {
  /** The session being conducted. Without one the screen is read-only. */
  chatId?: string;
  /** How long it has been running, already formatted. */
  elapsed?: string;
  /** Who the astrologer is talking to; defaults to the designed seeker. */
  peerName?: string;
  /** Called once the astrologer confirms leaving. */
  onLeave?: () => void;
};

/** Stamps a new message with the current wall clock, as the transcript prints it. */
const timeNow = () =>
  new Date()
    .toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    .toUpperCase();

/**
 * The live consultation. The header's chart button opens the generate-kundli
 * form, which hands over to the chart it produces, and its cross asks before
 * ending the session.
 * Figma: node 110:439.
 */
export function ConsultationChatScreen({
  chatId,
  elapsed = '00:00 mins',
  peerName = 'Seeker',
  onLeave,
}: ConsultationChatScreenProps) {
  /** The transcript, oldest first. */
  const transcript = useApi(
    () => (chatId ? api.fetchMessages(chatId) : Promise.resolve([])),
    [chatId],
    { skip: !chatId },
  );

  /**
   * Turns one stored message into the bubble the screen draws.
   *
   * The tail follows who sent it — the astrologer's flicks off the trailing
   * corner and the seeker's off the leading one. A message that answers another
   * carries the quoted one above it.
   */
  const bubbleOf = (message: any, quoted?: any): ChatMessage => ({
    id: String(message.id),
    from: message.senderRole === 'astrologer' ? 'astrologer' : 'seeker',
    tail: message.senderRole === 'astrologer' ? 'right' : 'left',
    quote: quoted ? { lines: [quoted.content?.text ?? ''] } : undefined,
    /**
     * The seeker's opening message is their birth details, and it is the one
     * the astrologer can cast a chart from — so it carries the action strip.
     */
    action: message.isIntake ? 'Generate Kundli' : undefined,
    lines: [message.content?.text ?? ''],
    time: new Date(message.createdAt).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  });

  /** Messages sent from here, held until the next read from the server. */
  const [sent, setSent] = useState<ChatMessage[]>([]);
  const stored = (transcript.data ?? []) as any[];
  const byId = new Map(stored.map(message => [String(message.id), message]));

  const messages: ChatMessage[] = [
    ...stored.map(message =>
      bubbleOf(message, message.replyTo ? byId.get(String(message.replyTo)) : undefined),
    ),
    ...sent,
  ];

  const [draft, setDraft] = useState('');
  const [generating, setGenerating] = useState(false);
  /** Whose chart is on screen; `null` while no kundli has been generated. */
  const [kundliFor, setKundliFor] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);

  const generate = (details: KundliDraft) => {
    setGenerating(false);
    setKundliFor(details.name.trim() || peerName);
  };

  const send = async () => {
    const body = draft.trim();
    if (body.length === 0) {
      return;
    }

    /** Shown straight away; the server is told next. */
    const pending: ChatMessage = {
      id: `sent-${Date.now()}`,
      from: 'astrologer',
      // The astrologer's bubbles flick their tail off the trailing corner.
      tail: 'right',
      lines: [body],
      time: timeNow(),
    };
    setSent(current => [...current, pending]);
    setDraft('');

    if (!chatId) {
      return;
    }

    try {
      await api.sendMessage(chatId, body, pending.id);
      /** Re-read, so the bubble is the stored one from here on. */
      setSent(current => current.filter(message => message.id !== pending.id));
      await transcript.reload();
    } catch {
      /** Left on screen; the astrologer can see it did not go and retype. */
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      <ChatHeader
        name={peerName}
        elapsed={elapsed}
        onOpenKundli={() => setGenerating(true)}
        onLeave={() => setLeaving(true)}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.body}
      >
        <ScrollView contentContainerStyle={styles.transcript}>
          {messages.map(message => (
            <ChatBubble
              key={message.id}
              message={message}
              onAction={() => setGenerating(true)}
            />
          ))}
        </ScrollView>

        <ChatComposer
          value={draft}
          onChangeText={setDraft}
          onSend={send}
        />
      </KeyboardAvoidingView>

      <GenerateKundliSheet
        visible={generating}
        onDismiss={() => setGenerating(false)}
        onGenerate={generate}
      />

      <KundliDetailsSheet
        visible={kundliFor !== null}
        name={kundliFor ?? peerName}
        onClose={() => setKundliFor(null)}
      />

      <LeaveChatDialog
        visible={leaving}
        onStay={() => setLeaving(false)}
        onLeave={() => {
          setLeaving(false);
          onLeave?.();
        }}
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
  // The first bubble sits 16pt under the header, the rest 20pt apart, inset
  // 17pt from either edge (Figma nodes 110:462 – 110:450).
  transcript: {
    paddingTop: spacing.section,
    paddingBottom: spacing.sm,
    paddingHorizontal: 17,
    gap: spacing.lg,
  },
});
