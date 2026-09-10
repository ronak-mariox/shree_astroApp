import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ChatBubble, type ChatMessage } from '../components/ChatBubble';
import { ChatComposer } from '../components/ChatComposer';
import { ChatHeader } from '../components/ChatHeader';
import { GenerateKundliSheet } from '../components/GenerateKundliSheet';
import { KundliDetailsSheet } from '../components/KundliDetailsSheet';
import { LeaveChatDialog } from '../components/LeaveChatDialog';
import { useApi } from '../hooks/useApi';
import { useResponsive } from '../hooks/useResponsive';
import * as api from '../services/api';
import type { KundliDraft } from '../data/kundli';
import { colors, spacing, typography } from '../theme';

type ConsultationChatScreenProps = {
  /** The session being conducted. Without one the screen is read-only. */
  chatId?: string;
  /** Who the astrologer is talking to; defaults to the designed seeker. */
  peerName?: string;
  /** Called once the astrologer confirms leaving. */
  onLeave?: () => void;
  /**
   * A past, already-ended consultation opened from History rather than a
   * live one — no composer, no live socket subscription, no "end the
   * consultation" confirmation, and the header clock is frozen at the
   * session's real recorded length instead of ticking off `startedAt`.
   */
  readOnly?: boolean;
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

/** "04:58 mins" — how the header prints the running session. */
const elapsedLabel = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')} mins`;

/**
 * The live consultation. The header's chart button opens the generate-kundli
 * form, which hands over to the chart it produces, and its cross asks before
 * ending the session.
 * Figma: node 110:439.
 */
export function ConsultationChatScreen({
  chatId,
  peerName = 'Seeker',
  onLeave,
  readOnly = false,
}: ConsultationChatScreenProps) {
  const { contentWidth, isTablet } = useResponsive();
  const styles = useMemo(() => createStyles(contentWidth, isTablet), [contentWidth, isTablet]);

  /** Status, the frozen rate, and the server's own startedAt — what the header's running clock ticks from. */
  const state = useApi(
    () => (chatId ? api.getChatState(chatId) : Promise.resolve(null)),
    [chatId],
    { skip: !chatId },
  );

  /** The transcript, oldest first. */
  const transcript = useApi(
    () => (chatId ? api.fetchMessages(chatId) : Promise.resolve([])),
    [chatId],
    { skip: !chatId },
  );

  /**
   * True only once the seeker's balance has actually paused billing (not the
   * earlier, non-blocking warnings) — user_app's ConsultationChatScreen sets
   * the same thing from the same `chat:low_balance` event. Freezes the clock
   * below, and the composer, for exactly as long as this stays true; a
   * top-up on the seeker's side (chat.service.js's resumePausedSessionsForUser)
   * clears it again.
   */
  const [sessionPaused, setSessionPaused] = useState(false);

  /**
   * How long the clock below has spent frozen so far (`pausedAccumMs`), and
   * when the current freeze began (`pausedSince`, null while running) — kept
   * in refs rather than state since nothing needs to re-render off them
   * directly, only off the `elapsedSeconds` they feed into.
   */
  const pausedAccumMs = useRef(0);
  const pausedSince = useRef<number | null>(null);
  /**
   * Set just before `setSessionPaused(true)` when the pause actually began
   * earlier than "now" — a (re)join that discovers an already-paused session
   * (see `onRejoinState` below) backdates to the server's own
   * `balanceExhaustedAt` instead of freezing from whenever this screen
   * happened to notice, so the frozen value is exactly right, not inflated
   * by however long the client was out of the loop.
   */
  const pausedSinceOverride = useRef<number | null>(null);

  useEffect(() => {
    if (sessionPaused) {
      pausedSince.current = pausedSinceOverride.current ?? Date.now();
      pausedSinceOverride.current = null;
    } else if (pausedSince.current !== null) {
      pausedAccumMs.current += Date.now() - pausedSince.current;
      pausedSince.current = null;
    }
  }, [sessionPaused]);

  /**
   * The header's running clock: real elapsed time since the server's own
   * startedAt, minus however long it's spent paused for the seeker's low
   * balance — ticked locally so it doesn't need a round trip every second.
   */
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  useEffect(() => {
    const startedAt = state.data?.startedAt;
    if (!startedAt) {
      return;
    }
    const started = new Date(startedAt).getTime();

    /** A past session's length is already final — no clock to tick, just the one real number. */
    if (readOnly) {
      const endedAt = state.data?.endedAt;
      const ended = endedAt ? new Date(endedAt).getTime() : Date.now();
      setElapsedSeconds(Math.max(0, Math.floor((ended - started) / 1000)));
      return;
    }

    const tick = () => {
      if (pausedSince.current !== null) {
        /** Frozen — hold the last value rather than keep advancing it. */
        return;
      }
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - started - pausedAccumMs.current) / 1000)));
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [state.data?.startedAt, state.data?.endedAt, readOnly]);

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

  /**
   * The live half of the session: a message arriving either way is a plain
   * re-read (the transcript is small and this is a lot simpler than merging
   * a pushed message into `stored`'s reply-quoting logic above), and however
   * the session ends drops the screen straight back out — it is already over
   * by the time this fires, so there is nothing left here to confirm.
   */
  useEffect(() => {
    /** A past consultation has nothing left to live-update — its meter, its balance, its ending, all already happened. */
    if (!chatId || readOnly) {
      return;
    }
    return api.subscribeToConsultation(chatId, 0, {
      onMessage: () => transcript.reload(),
      /**
       * Fires on every (re)join, including the very first one — a socket
       * that's already connected before this screen mounts still runs this
       * immediately. Resyncs to the session's true current pause state,
       * since a live low-balance push can be missed entirely by a socket
       * that was briefly disconnected and never redelivered once it
       * reconnects.
       */
      onRejoinState: payload => {
        if (payload.paused) {
          pausedSinceOverride.current = payload.pausedSince ? new Date(payload.pausedSince).getTime() : Date.now();
        }
        setSessionPaused(payload.paused);
      },
      onTick: () => setSessionPaused(false),
      /**
       * The proactive/check-ahead warnings (`paused` undefined) are the
       * seeker's own concern — nothing for the astrologer to act on, so only
       * an actual pause or resume (`paused: true`/`false`) changes anything
       * here.
       */
      onLowBalance: payload => {
        if (payload.paused === true) setSessionPaused(true);
        else if (payload.paused === false) setSessionPaused(false);
      },
      onEnded: () => onLeave?.(),
    });
    // transcript.reload and onLeave are fresh closures every render; only chatId/readOnly should restart the subscription.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, readOnly]);

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
    if (body.length === 0 || sessionPaused) {
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
        elapsed={elapsedLabel(elapsedSeconds)}
        onOpenKundli={() => setGenerating(true)}
        onLeave={() => (readOnly ? onLeave?.() : setLeaving(true))}
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

        {!readOnly && sessionPaused && (
          <View style={styles.pausedBanner}>
            <Text style={styles.pausedBannerText}>
              Seeker's balance is low — chat paused until they recharge.
            </Text>
          </View>
        )}

        {/** A finished consultation has nothing left to say into. */}
        {!readOnly && (
          <ChatComposer
            value={draft}
            onChangeText={setDraft}
            onSend={send}
            disabled={sessionPaused}
          />
        )}
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
          if (chatId) {
            /** Fire-and-forget — the astrologer is leaving either way; a refusal here just means the server ends it on its own grace-period cutoff instead. */
            api.endConsultation(chatId, 'astrologer_ended').catch(() => {});
          }
          onLeave?.();
        }}
      />
    </View>
  );
}

function createStyles(contentWidth: number, isTablet: boolean) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    body: {
      flex: 1,
    },
    // The first bubble sits 16pt under the header, the rest 20pt apart, inset
    // 17pt from either edge (Figma nodes 110:462 – 110:450). On a tablet the
    // whole log sits in a centred column instead of stretching bubbles across
    // the full width.
    transcript: {
      alignSelf: 'center',
      width: '100%',
      maxWidth: isTablet ? contentWidth : undefined,
      paddingTop: spacing.section,
      paddingBottom: spacing.sm,
      paddingHorizontal: 17,
      gap: spacing.lg,
    },
    pausedBanner: {
      alignSelf: 'center',
      width: '100%',
      maxWidth: isTablet ? contentWidth : undefined,
      paddingHorizontal: 17,
      paddingVertical: spacing.sm,
      backgroundColor: colors.status.warningWell,
    },
    pausedBannerText: {
      ...typography.caption,
      color: colors.status.warning,
      textAlign: 'center',
    },
  });
}
