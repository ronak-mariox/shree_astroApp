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
import { KundliSheet } from '../components/KundliSheet';
import { LeaveChatDialog } from '../components/LeaveChatDialog';
import { CHAT_PEER, CHAT_TRANSCRIPT } from '../data/chat';
import { colors, spacing } from '../theme';

type ConsultationChatScreenProps = {
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
 * The live consultation. The header's chart button opens the kundli sheet and
 * its cross asks before ending the session.
 * Figma: node 110:439.
 */
export function ConsultationChatScreen({
  peerName = CHAT_PEER.name,
  onLeave,
}: ConsultationChatScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([...CHAT_TRANSCRIPT]);
  const [draft, setDraft] = useState('');
  const [kundliOpen, setKundliOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const send = () => {
    const body = draft.trim();
    if (body.length === 0) {
      return;
    }

    setMessages(current => [
      ...current,
      {
        id: `sent-${current.length}`,
        from: 'astrologer',
        // The astrologer's bubbles flick their tail off the trailing corner.
        tail: 'right',
        lines: [body],
        time: timeNow(),
      },
    ]);
    setDraft('');
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      <ChatHeader
        name={peerName}
        elapsed={CHAT_PEER.elapsed}
        onOpenKundli={() => setKundliOpen(true)}
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
              onAction={() => setKundliOpen(true)}
            />
          ))}
        </ScrollView>

        <ChatComposer
          value={draft}
          onChangeText={setDraft}
          onSend={send}
        />
      </KeyboardAvoidingView>

      <KundliSheet
        visible={kundliOpen}
        onClose={() => setKundliOpen(false)}
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
