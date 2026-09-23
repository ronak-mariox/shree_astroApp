import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  BackHandler,
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
import {
  canGenerateKundli,
  draftFromBirthDetails,
  kundliMatchNote,
  toKundliRequest,
  type KundliDraft,
  type SeekerKundli,
} from '../data/kundli';
import {
  clockOffsetMs,
  elapsedSeconds as elapsedOnServerClock,
  formatClock,
  secondsUntil,
  type PackageView,
} from '../utils/sessionClock';
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
const elapsedLabel = (seconds: number) => `${formatClock(seconds)} mins`;

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

  /**
   * How far the server's clock is ahead of this phone's — taken from every
   * state read and (re)join. The header counts on the server's clock, so it
   * shows exactly what the seeker's header shows even when either phone's
   * clock is wrong.
   */
  const clockOffset = useRef(0);
  /**
   * Package bookings only: where the package stands. While package time
   * lasts the header counts it DOWN — the same "mm:ss left" the seeker sees —
   * and once it runs out it counts the session up like any other.
   */
  const [pkg, setPkg] = useState<PackageView>();
  useEffect(() => {
    if (state.data?.serverTime) {
      clockOffset.current = clockOffsetMs(state.data.serverTime);
    }
    if (state.data?.billingMode === 'package' && state.data.package) {
      setPkg(state.data.package);
      /** Opened while the seeker is choosing how to continue after a package — frozen, same as their screen. */
      if (state.data.package.phase === 'awaiting_choice' && state.data.status === 'active' && !readOnly) {
        pausedSinceOverride.current = state.data.package.awaitingChoiceSince
          ? new Date(state.data.package.awaitingChoiceSince).getTime()
          : null;
        setSessionPaused(true);
      }
    }
  }, [state.data, readOnly]);

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
      setElapsedSeconds(elapsedOnServerClock(startedAt, clockOffset.current, pausedAccumMs.current));
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
        if (payload.serverTime) {
          clockOffset.current = clockOffsetMs(payload.serverTime);
        }
        if (payload.package) {
          setPkg(payload.package);
          if (payload.package.phase === 'awaiting_choice' && payload.status === 'active') {
            pausedSinceOverride.current = payload.package.awaitingChoiceSince
              ? new Date(payload.package.awaitingChoiceSince).getTime()
              : Date.now();
            setSessionPaused(true);
            return;
          }
        }
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
      onPackageWarning: payload => {
        clockOffset.current = clockOffsetMs(payload.serverTime);
        setPkg(current => (current ? { ...current, endsAt: payload.endsAt } : current));
      },
      /** The package ran out: paused (clock frozen, composer blocked) while the seeker chooses how to continue. */
      onPackageEnded: payload => {
        clockOffset.current = clockOffsetMs(payload.serverTime);
        setPkg(current => ({ ...(current ?? {}), phase: 'awaiting_choice', awaitingChoiceSince: payload.pausedSince }));
        setSessionPaused(true);
      },
      /** The seeker took another package: a fresh countdown, same as theirs. */
      onPackageExtended: payload => {
        clockOffset.current = clockOffsetMs(payload.serverTime);
        setPkg(current => ({ ...(current ?? {}), phase: 'package', endsAt: payload.endsAt, awaitingChoiceSince: undefined }));
        setSessionPaused(false);
      },
      /** The seeker chose per-minute: from here the header counts the session up, same as the seeker's. */
      onPerMinuteStarted: payload => {
        setPkg(current => ({ ...(current ?? {}), phase: 'per_minute', perMinuteStartedAt: payload.perMinuteStartedAt, awaitingChoiceSince: undefined }));
        setSessionPaused(false);
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
  /** Whose chart the details sheet is open for; `null` while it's closed. */
  const [kundliFor, setKundliFor] = useState<string | null>(null);
  /** A chart generated from this screen, which then stands in for the one read on open. */
  const [generatedKundli, setGeneratedKundli] = useState<SeekerKundli | null>(null);
  /** A generate request in flight — the sheet waits on it rather than showing "nothing saved". */
  const [generatingKundli, setGeneratingKundli] = useState(false);
  const [leaving, setLeaving] = useState(false);

  /**
   * The seeker's already-generated kundli for this consultation, from the
   * database (GET /chats/:chatId/kundli) — read once when the chat opens.
   */
  const seekerKundli = useApi(
    () => (chatId ? api.fetchSeekerKundli(chatId) : Promise.resolve(null)),
    [chatId],
    { skip: !chatId },
  );
  /** What the sheet draws: whatever was just generated here, else what was read on open. */
  const savedKundli = generatedKundli ?? seekerKundli.data ?? undefined;
  /** Whose chart it is: the saved chart's name, else the intake's, else the peer. */
  const kundliName = savedKundli?.birthDetails?.fullName || peerName;

  /**
   * Android's own back button, while a consultation is live.
   *
   * Unclaimed, it leaves the app — which drops the astrologer out of a session
   * the seeker is still sitting in, over one stray press. It asks instead, the
   * same question the header's own leave control asks. A consultation that is
   * already over (`readOnly`, opened from history) has nothing to confirm, so
   * back simply goes back.
   */
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (leaving) {
        setLeaving(false);
        return true;
      }
      if (readOnly) {
        onLeave?.();
        return true;
      }
      setLeaving(true);
      return true;
    });
    return () => subscription.remove();
  }, [leaving, readOnly, onLeave]);

  /** The header's kundli button: straight to the seeker's saved kundli. */
  const openSavedKundli = () => {
    setKundliFor(kundliName);
  };

  /** "Generate Kundli" on the intake: the form, already filled in with the seeker's stored details. */
  const openKundliForm = () => {
    setKundliFor(null);
    setGenerating(true);
  };

  /**
   * The form submitted: generate the chart for these birth details and show it.
   *
   * Really generates — the astrologer is not stuck waiting for the seeker to do
   * it in their own app, and details edited to someone the seeker is asking
   * about get that person's chart rather than an empty sheet. It is stored
   * against the seeker either way, so nothing is fetched or paid for twice.
   */
  const generate = async (details: KundliDraft) => {
    setGenerating(false);
    setKundliFor(details.name.trim() || kundliName);

    if (!chatId || !canGenerateKundli(details)) {
      Alert.alert('Birth details needed', 'Fill in the name, date, time and place of birth to generate a kundli.');
      return;
    }

    setGeneratingKundli(true);
    try {
      setGeneratedKundli(await api.generateSeekerKundli(chatId, toKundliRequest(details)));
    } catch (error) {
      Alert.alert(
        'Could not generate the kundli',
        error instanceof Error ? error.message : 'Please try again in a moment.',
      );
    } finally {
      setGeneratingKundli(false);
    }
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

  /** Package time left, on the server's clock — recomputed on every render, which the running clock above triggers once a second. */
  const packageSecondsLeft = pkg?.phase === 'package' ? secondsUntil(pkg.endsAt, clockOffset.current) : 0;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      <ChatHeader
        name={peerName}
        elapsed={
          !readOnly && pkg?.phase === 'awaiting_choice'
            ? 'Paused'
            : !readOnly && pkg?.phase === 'package'
              ? `${formatClock(packageSecondsLeft)} left`
              : elapsedLabel(elapsedSeconds)
        }
        onOpenKundli={openSavedKundli}
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
              onAction={openKundliForm}
            />
          ))}
        </ScrollView>

        {!readOnly && sessionPaused && (
          <View style={styles.pausedBanner}>
            <Text style={styles.pausedBannerText}>
              {pkg?.phase === 'awaiting_choice'
                ? 'Package time is over — chat paused while the seeker chooses how to continue.'
                : "Seeker's balance is low — chat paused until they recharge."}
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
        initialDraft={draftFromBirthDetails(savedKundli?.birthDetails)}
        note={
          savedKundli?.found
            ? "The seeker's saved birth details — Generate shows their kundli."
            : savedKundli
              ? 'Birth details from the seeker\'s intake — Generate creates their kundli.'
              : undefined
        }
      />

      <KundliDetailsSheet
        visible={kundliFor !== null}
        name={kundliFor ?? kundliName}
        kundli={savedKundli}
        loading={seekerKundli.loading}
        generating={generatingKundli}
        note={kundliMatchNote(savedKundli)}
        onOpenForm={openKundliForm}
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
