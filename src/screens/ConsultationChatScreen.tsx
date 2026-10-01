import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useDialog } from '../components/AppDialogProvider';
import { ChatBubble, type ChatMessage } from '../components/ChatBubble';
import { ChatComposer } from '../components/ChatComposer';
import { ChatHeader } from '../components/ChatHeader';
import { GenerateKundliSheet } from '../components/GenerateKundliSheet';
import { KundliDetailsSheet } from '../components/KundliDetailsSheet';
import { LeaveChatDialog } from '../components/LeaveChatDialog';
import { VoiceCallPanel } from '../components/VoiceCallPanel';
import { useApi } from '../hooks/useApi';
import { useKeyboardOpen } from '../hooks/useKeyboardOpen';
import { useResponsive } from '../hooks/useResponsive';
import * as api from '../services/api';
import {
  joinVoiceCall,
  leaveVoiceCall,
  renewVoiceToken,
  setMuted as setVoiceMuted,
  setSpeaker as setVoiceSpeaker,
  type VoiceCallEvent,
} from '../services/voiceCall';
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
  /**
   * What the caller already knows the session to be — the accepted request's
   * channel, or which history list it was opened from. Only a hint for the
   * first render: the session state (REST read, then every (re)join) is what
   * decides, and a `call` session gets the voice-call layout in place of the
   * transcript and composer.
   */
  channel?: 'chat' | 'call';
};

/** Where the voice call stands, as the status line reads it. */
type CallPhase = 'idle' | 'connecting' | 'ringing' | 'connected' | 'reconnecting';

/**
 * What the status line says when GET /chats/:id/call-token refuses. The
 * server's stable `code` is what to branch on; its prose message is the
 * fallback, since it is already safe to print.
 */
function callTokenError(error: unknown): string {
  const code = (error as { code?: string } | null)?.code;
  switch (code) {
    case 'calls_unconfigured':
      return 'Voice calls are not set up on the server yet';
    case 'not_active':
      return 'The session is not active yet';
    case 'not_a_call':
      return 'This session is not a voice call';
    default:
      return error instanceof Error && error.message ? error.message : 'Could not set up the call';
  }
}

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
/** Three bouncing dots in a seeker-side bubble — "they are typing". */
function TypingDots() {
  const dots = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;
  useEffect(() => {
    const loops = dots.map((dot, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 150),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(450 - index * 150),
        ]),
      ),
    );
    loops.forEach(loop => loop.start());
    return () => loops.forEach(loop => loop.stop());
  }, [dots]);
  return (
    <View accessibilityLabel="Seeker is typing" style={typingStyles.bubble}>
      {dots.map((dot, index) => (
        <Animated.View
          key={index}
          style={[
            typingStyles.dot,
            { opacity: dot.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }), transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }] },
          ]}
        />
      ))}
    </View>
  );
}

const typingStyles = StyleSheet.create({
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    minHeight: 36,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: colors.surfaceInset,
    marginTop: spacing.sm,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.text.slateMuted,
  },
});

export function ConsultationChatScreen({
  chatId,
  peerName = 'Seeker',
  onLeave,
  readOnly = false,
  channel: channelHint,
}: ConsultationChatScreenProps) {
  const { contentWidth, isTablet } = useResponsive();
  const styles = useMemo(() => createStyles(contentWidth, isTablet), [contentWidth, isTablet]);
  const dialog = useDialog();

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
  /**
   * The seeker's app is away, and when the server will end the session over it.
   * Held as the moment it runs out (on the server's clock) rather than a
   * counter, so the banner's countdown survives re-renders and a clock that is
   * a few seconds off.
   */
  const [userAwayEndsAt, setUserAwayEndsAt] = useState<string | null>(null);
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

  /* ------------------------------------------------------------ voice call */

  /**
   * A `call` session gets the voice layout in place of the transcript. The
   * REST state is the source of truth; every (re)join reports it too
   * (`liveChannel`), and `channelHint` is what App passed from the accepted
   * request, so the right layout shows before either has answered.
   */
  const [liveChannel, setLiveChannel] = useState<string | undefined>(undefined);
  const channel = state.data?.channel ?? liveChannel ?? channelHint;
  const isCall = channel === 'call';

  const [callPhase, setCallPhase] = useState<CallPhase>('idle');
  /** Whether the seeker is in the Agora channel right now — a ref, since the engine's callbacks read it, not the render. */
  const peerPresent = useRef(false);
  /** …and whether they ever were: a drop-off reads differently from never having answered. */
  const [peerEverJoined, setPeerEverJoined] = useState(false);
  /** Why the call could not be set up — the token call refusing, a denied microphone, an engine error. Shown with a Retry. */
  const [callError, setCallError] = useState<string | null>(null);
  /** Bumped by Retry: re-runs the join effect from the token fetch. */
  const [callAttempt, setCallAttempt] = useState(0);
  /** The astrologer's own mute — separate from a billing pause, which mutes underneath it and unmutes back to this. */
  const [muted, setMutedState] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);
  /** The session ended (either side, or the server) — the channel is left and never rejoined. */
  const [callEnded, setCallEnded] = useState(false);

  /** Always the latest closure, so the engine's callbacks (registered once, at join) see current state. */
  const onCallEvent = useRef<(event: VoiceCallEvent) => void>(() => {});
  onCallEvent.current = (event: VoiceCallEvent) => {
    switch (event.type) {
      case 'joined':
        setCallPhase(peerPresent.current ? 'connected' : 'ringing');
        break;
      case 'peerJoined':
        peerPresent.current = true;
        setPeerEverJoined(true);
        setCallPhase('connected');
        break;
      case 'peerLeft':
        peerPresent.current = false;
        setCallPhase('ringing');
        break;
      case 'reconnecting':
        setCallPhase('reconnecting');
        break;
      case 'reconnected':
        setCallPhase(peerPresent.current ? 'connected' : 'ringing');
        break;
      case 'tokenExpiring':
        /** A fresh token from the same endpoint, handed to the engine in place. */
        if (chatId) {
          api
            .fetchCallToken(chatId)
            .then(fresh => renewVoiceToken(fresh.token))
            .catch(() => {
              /** The SDK asks again before giving up; a session that ended meanwhile has ended the call with it. */
            });
        }
        break;
      case 'permissionDenied':
        setCallError('Microphone access is needed for a voice call. Allow it in Settings and retry.');
        setCallPhase('idle');
        break;
      case 'error':
        setCallError(event.message ? `${event.message} (${event.code})` : `Call error ${event.code}`);
        break;
    }
  };

  const sessionActive = state.data?.status === 'active';
  /**
   * Joins Agora only once the session is active AND the token call has
   * answered — and leaves exactly once, whichever comes first: the session
   * ending (`callEnded`), the astrologer ending it, a Retry, or this screen
   * unmounting. `leaveVoiceCall` is idempotent, so the cleanup here and the
   * explicit calls elsewhere never double-leave.
   */
  useEffect(() => {
    if (!isCall || readOnly || !chatId || !sessionActive || callEnded) {
      return;
    }
    let cancelled = false;
    /** A fresh join: whoever was in the previous channel is not in this one until the engine says so. */
    peerPresent.current = false;
    setCallError(null);
    setCallPhase('connecting');

    (async () => {
      let token: api.CallToken;
      try {
        token = await api.fetchCallToken(chatId);
      } catch (error) {
        if (!cancelled) {
          setCallError(callTokenError(error));
          setCallPhase('idle');
        }
        return;
      }
      if (cancelled) {
        return;
      }
      /** Dummy mode, or a server without Agora credentials: nothing to join. */
      if (!token.appId) {
        setCallError('Calls need a live server');
        setCallPhase('idle');
        return;
      }
      await joinVoiceCall({
        appId: token.appId,
        channelName: token.channelName,
        uid: token.uid,
        token: token.token,
        onEvent: event => {
          if (!cancelled) {
            onCallEvent.current(event);
          }
        },
      });
      if (cancelled) {
        leaveVoiceCall();
      }
    })();

    return () => {
      cancelled = true;
      leaveVoiceCall();
    };
  }, [isCall, readOnly, chatId, sessionActive, callEnded, callAttempt]);

  /**
   * While a call is live, re-read the session every 15s: a socket that was
   * down when the server ended it (the seeker's End, their disconnect grace
   * running out, a timeout) never gets `session:ended`, and the audio would
   * otherwise carry on with nobody being billed.
   */
  useEffect(() => {
    if (!isCall || readOnly || !chatId || !sessionActive || callEnded) {
      return undefined;
    }
    const timer = setInterval(async () => {
      try {
        const fresh = await api.getChatState(chatId);
        if (fresh && fresh.status !== 'active') {
          finishSession.current();
        }
      } catch {
        /** Offline right now — the next tick, or the socket's own event, will say. */
      }
    }, 15_000);
    return () => clearInterval(timer);
  }, [isCall, readOnly, chatId, sessionActive, callEnded]);

  /**
   * A billing pause (low balance, or a package awaiting the seeker's choice)
   * mutes the microphone underneath the astrologer's own toggle; the resume
   * restores whatever they had. Re-applied on every phase change so a
   * (re)join picks it up too.
   */
  useEffect(() => {
    if (!isCall) {
      return;
    }
    setVoiceMuted(sessionPaused || muted);
  }, [isCall, sessionPaused, muted, callPhase]);

  useEffect(() => {
    if (!isCall) {
      return;
    }
    setVoiceSpeaker(speakerOn);
  }, [isCall, speakerOn, callPhase]);

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
  /**
   * Closes the session on this side, once: out of the voice channel first,
   * then the ended state and the screen going away — whichever way the end
   * was learnt (`session:ended`, a rejoin, the poll below).
   */
  const endedHandled = useRef(false);
  const finishSession = useRef<() => void>(() => {});
  finishSession.current = () => {
    if (endedHandled.current) {
      return;
    }
    endedHandled.current = true;
    leaveVoiceCall();
    setCallEnded(true);
    onLeave?.();
  };

  useEffect(() => {
    /** A past consultation has nothing left to live-update — its meter, its balance, its ending, all already happened. */
    if (!chatId || readOnly) {
      return;
    }
    return api.subscribeToConsultation(chatId, 0, {
      onMessage: () => transcript.reload(),
      /** The seeker is typing — three dots under the transcript until they stop (or 4s pass without another ping). */
      onTyping: payload => {
        if (payload.role !== 'user') return;
        setSeekerTyping(payload.isTyping);
        if (seekerTypingTimer.current) clearTimeout(seekerTypingTimer.current);
        if (payload.isTyping) {
          seekerTypingTimer.current = setTimeout(() => setSeekerTyping(false), 4000);
        }
      },
      /**
       * Fires on every (re)join, including the very first one — a socket
       * that's already connected before this screen mounts still runs this
       * immediately. Resyncs to the session's true current pause state,
       * since a live low-balance push can be missed entirely by a socket
       * that was briefly disconnected and never redelivered once it
       * reconnects.
       */
      onRejoinState: payload => {
        /** Already over by the time the socket came back: close here too, so the call audio never outlives the session. */
        if (payload.status && payload.status !== 'active' && payload.status !== 'requested') {
          finishSession.current();
          return;
        }
        if (payload.serverTime) {
          clockOffset.current = clockOffsetMs(payload.serverTime);
        }
        /** The join reports the channel too — the call layout keys off it as much as off the REST read. */
        if (payload.channel) {
          setLiveChannel(payload.channel);
        }
        /** Away-ness is as missable as a pause: recover the true current answer. */
        setUserAwayEndsAt(
          payload.userAwaySince && payload.userAwayEndsInSeconds
            ? new Date(new Date(payload.userAwaySince).getTime() + payload.userAwayEndsInSeconds * 1000).toISOString()
            : null,
        );
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
      /**
       * Their app went away — closed, killed, or off the network. Worth saying
       * out loud: otherwise the chat simply goes quiet and then ends, and the
       * astrologer is left wondering whether they were ignored.
       */
      onUserLeft: payload => {
        clockOffset.current = clockOffsetMs(payload.serverTime);
        setUserAwayEndsAt(new Date(new Date(payload.serverTime).getTime() + payload.endsInSeconds * 1000).toISOString());
      },
      onUserReturned: () => setUserAwayEndsAt(null),
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
      onEnded: () => finishSession.current(),
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
  const transcriptRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  /** Keep the latest messages in view once the keyboard has taken its space. */
  const keyboardOpen = useKeyboardOpen();
  useEffect(() => {
    if (!keyboardOpen) return undefined;
    const timer = setTimeout(() => transcriptRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(timer);
  }, [keyboardOpen]);
  /** Whether the seeker is typing right now (from chat:typing), shown as dots under the transcript. */
  const [seekerTyping, setSeekerTyping] = useState(false);
  const seekerTypingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Our own typing pings: at most one "typing" every 2.5s while the draft changes, and a "stopped" 3s after the last keystroke. */
  const typingSentAt = useRef(0);
  const typingStopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onDraftChange = (text: string) => {
    setDraft(text);
    if (!chatId || readOnly) return;
    const now = Date.now();
    if (text.length > 0 && now - typingSentAt.current > 2500) {
      typingSentAt.current = now;
      api.sendTyping(chatId, true);
    }
    if (typingStopTimer.current) clearTimeout(typingStopTimer.current);
    typingStopTimer.current = setTimeout(() => {
      typingSentAt.current = 0;
      api.sendTyping(chatId, false);
    }, 3000);
  };
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
      dialog.show({
        title: 'Birth details needed',
        message: 'Fill in the name, date, time and place of birth to generate a kundli.',
        tone: 'warning',
      });
      return;
    }

    setGeneratingKundli(true);
    try {
      setGeneratedKundli(await api.generateSeekerKundli(chatId, toKundliRequest(details)));
    } catch (error) {
      dialog.show({
        title: 'Could not generate the kundli',
        message: error instanceof Error ? error.message : 'Please try again in a moment.',
        tone: 'error',
      });
    } finally {
      setGeneratingKundli(false);
    }
  };

  const send = async () => {
    const body = draft.trim();
    if (body.length === 0 || sessionPaused) {
      return;
    }
    if (typingStopTimer.current) clearTimeout(typingStopTimer.current);
    typingSentAt.current = 0;
    if (chatId) api.sendTyping(chatId, false);

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
  /** Counted off the same 1s tick the header clock runs on, so it needs no timer of its own. */
  const userAwaySecondsLeft = userAwayEndsAt ? secondsUntil(userAwayEndsAt, clockOffset.current) : 0;

  /** The header's running clock — and, on a call, the panel's, so both read the same. */
  const headerElapsed =
    !readOnly && pkg?.phase === 'awaiting_choice'
      ? 'Paused'
      : !readOnly && pkg?.phase === 'package'
        ? `${formatClock(packageSecondsLeft)} left`
        : elapsedLabel(elapsedSeconds);

  /** One line under the seeker's name on a call, in the order that matters: over, broken, paused, then how the channel is doing. */
  const callStatus = ((): string => {
    if (readOnly || callEnded || state.data?.status === 'ended') {
      return 'Call ended';
    }
    if (callError) {
      return callError;
    }
    if (sessionPaused) {
      return pkg?.phase === 'awaiting_choice'
        ? 'Paused — seeker is choosing how to continue'
        : 'Paused — seeker is adding money';
    }
    switch (callPhase) {
      case 'connected':
        return 'Connected';
      case 'reconnecting':
        return 'Reconnecting…';
      case 'ringing':
        return peerEverJoined
          ? `${peerName} dropped off — waiting for them to rejoin…`
          : `Ringing… waiting for ${peerName}`;
      default:
        return 'Connecting…';
    }
  })();

  /** The seeker's app going away, said on the call panel the way the chat banner says it. */
  const callAwayNote =
    !readOnly && userAwayEndsAt
      ? userAwaySecondsLeft > 0
        ? `Seeker's app has closed — the consultation ends in ${userAwaySecondsLeft}s unless they come back.`
        : "Seeker's app has closed — ending the consultation now…"
      : undefined;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      <ChatHeader
        name={peerName}
        elapsed={headerElapsed}
        onOpenKundli={openSavedKundli}
        onLeave={() => (readOnly ? onLeave?.() : setLeaving(true))}
      />

      {/**
        * A call: the seeker, how the call is going, the same clock the header
        * runs, and the three controls — in place of the transcript and
        * composer. Billing, pauses, packages and the ending all run exactly as
        * they do for a chat; only what is drawn differs.
        */}
      {isCall ? (
        <VoiceCallPanel
          peerName={peerName}
          status={callStatus}
          timer={headerElapsed}
          rate={state.data?.ratePerMinute ? `₹ ${state.data.ratePerMinute}/min` : undefined}
          note={callAwayNote}
          muted={muted}
          speakerOn={speakerOn}
          onToggleMute={() => setMutedState(current => !current)}
          onToggleSpeaker={() => setSpeakerOn(current => !current)}
          onEnd={() => (readOnly ? onLeave?.() : setLeaving(true))}
          onRetry={callError && !callEnded ? () => setCallAttempt(current => current + 1) : undefined}
          ended={readOnly || callEnded}
        />
      ) : (
      <KeyboardAvoidingView
        /** 'padding' on Android too — edge-to-edge ignores adjustResize, see hooks/useKeyboardOpen.ts. */
        behavior="padding"
        keyboardVerticalOffset={0}
        style={styles.body}
      >
        <ScrollView
          ref={transcriptRef}
          contentContainerStyle={styles.transcript}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          onContentSizeChange={() => transcriptRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(message => (
            <ChatBubble
              key={message.id}
              message={message}
              onAction={openKundliForm}
            />
          ))}
          {seekerTyping && <TypingDots />}
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

        {/**
          * The seeker's app has gone. Said plainly, with how long is left,
          * because the alternative is a chat that goes quiet for no visible
          * reason and then ends by itself.
          */}
        {!readOnly && userAwayEndsAt && (
          <View accessibilityRole="alert" style={styles.awayBanner}>
            <Text style={styles.awayBannerText}>
              {userAwaySecondsLeft > 0
                ? `Seeker's app has closed — the consultation ends in ${userAwaySecondsLeft}s unless they come back.`
                : /**
                   * The countdown is up but the session is not closed yet — the
                   * sweep that ends it runs every 10 seconds. Said as the state
                   * it is, rather than a stuck "0s" that looks like a hung
                   * clock.
                   */
                  'Seeker\'s app has closed — ending the consultation now…'}
            </Text>
          </View>
        )}

        {/** A finished consultation has nothing left to say into. */}
        {!readOnly && (
          <ChatComposer
            value={draft}
            onChangeText={onDraftChange}
            onSend={send}
            disabled={sessionPaused}
          />
        )}
      </KeyboardAvoidingView>
      )}

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
        variant={isCall ? 'call' : 'chat'}
        onStay={() => setLeaving(false)}
        onLeave={() => {
          setLeaving(false);
          /** Out of the voice channel first — a no-op for a chat, or a call already left. */
          leaveVoiceCall();
          setCallEnded(true);
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
    awayBanner: {
      alignSelf: 'center',
      width: '100%',
      maxWidth: isTablet ? contentWidth : undefined,
      paddingHorizontal: 17,
      paddingVertical: spacing.sm,
      backgroundColor: colors.status.dangerTint,
    },
    awayBannerText: {
      ...typography.caption,
      color: colors.status.danger,
      textAlign: 'center',
    },
  });
}
