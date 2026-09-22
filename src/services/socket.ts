/**
 * The live half of a consultation: everything the REST API in `api.ts` cannot
 * push on its own — a new request arriving, a message arriving, the minute
 * meter ticking, the session ending.
 *
 * One socket for the whole app. Unlike the seeker's app, it is not opened on
 * sign-in — an astrologer's presence is the manual online/offline toggle
 * (`setOnline` in `api.ts`), and the backend ties `presence.isOnline` to this
 * very socket's connect/disconnect (see backend/socket/index.js), so the
 * toggle is what opens and closes the connection. Screens never construct
 * their own connection; they call `getSocket()` and attach the listeners they
 * care about, and detach them on unmount — the connection itself outlives any
 * one screen.
 */

import { io, type Socket } from 'socket.io-client';

import type { PackageView } from '../utils/sessionClock';

import { API_BASE_URL } from './client';
import { getAccessToken } from './session';

/** socket.io attaches to the server root, not the REST API's `/api/v1` path. */
const SOCKET_BASE_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

/** Event names, kept identical to backend/models/Chat.js's CHAT_EVENTS — see that file for what each one carries. */
export const CHAT_EVENTS = {
  JOIN: 'chat:join',
  LEAVE: 'chat:leave',
  SEND: 'message:send',
  NEW: 'message:new',
  DELIVERED: 'message:delivered',
  READ: 'message:read',
  TYPING: 'chat:typing',
  ENDED: 'session:ended',
  TICK: 'chat:tick',
  LOW_BALANCE: 'chat:low_balance',
  /**
   * The astrologer's own socket dropping/reconnecting while a chat is
   * active — this app never listens for these itself (it can't receive a
   * notice about its own disconnect while it's the one disconnected), but
   * the names are kept here anyway so this file's event vocabulary matches
   * the server's and user_app's copies exactly. See backend/services/
   * chat.service.js's pauseSessionsForAstrologer/resumeSessionsForAstrologer.
   */
  ASTROLOGER_LEFT: 'chat:astrologer_left',
  ASTROLOGER_JOINED: 'chat:astrologer_joined',
  /** Emitted outside any chat room, to the astrologer's own `astrologer:{id}` room — see backend/services/chat.service.js. */
  REQUESTED: 'chat:requested',
  STARTED: 'chat:started',
  ACCEPTED: 'chat:accepted',
  REJECTED: 'chat:rejected',
  MISSED: 'chat:missed',
  CANCELLED: 'chat:cancelled',
  /** Package bookings: ~30s left; ran out (paused on the seeker's choice); continued with another package; continued per-minute. */
  PACKAGE_WARNING: 'chat:package_warning',
  PACKAGE_ENDED: 'chat:package_ended',
  PACKAGE_EXTENDED: 'chat:package_extended',
  PER_MINUTE_STARTED: 'chat:per_minute_started',
} as const;

export const roomFor = (chatId: string) => `chat:${chatId}`;

let socket: Socket | null = null;

/**
 * Opens the connection if one isn't already open or opening. Safe to call
 * repeatedly — a screen that needs live chat can just call this on mount
 * without worrying whether the toggle already did.
 */
export function connectSocket(): Socket | null {
  const token = getAccessToken();
  if (!token) {
    return null;
  }

  if (socket) {
    if (socket.auth && (socket.auth as { token?: string }).token !== token) {
      /** A refreshed token — reconnect so the next handshake carries it. */
      socket.auth = { token };
      socket.disconnect().connect();
    } else if (!socket.connected) {
      socket.connect();
    }
    return socket;
  }

  socket = io(SOCKET_BASE_URL, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
  });

  socket.on('connect_error', error => {
    console.warn('[socket] connect_error:', error.message);
  });

  attachIncomingRequestListeners(socket);

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

/**
 * Closes the connection. Called from `api.ts`'s `setOnline` the moment the
 * astrologer toggles off (and, as a safety net, on sign-out) — not registered
 * here at module load, so importing this file never opens a connection on its
 * own; a screen test that pulls in services/api.ts (which pulls in this
 * module) must not reach out to a real server it never asked to talk to.
 */
export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

/**
 * Joins a chat's room and returns what was missed since `lastSeq` — mirrors
 * socket/chat.handlers.js's JOIN handler, which is also how a reconnect
 * catches back up.
 */
export function joinChatRoom(
  chatId: string,
  lastSeq = 0,
): Promise<{
  chatId: string;
  role: 'user' | 'astrologer';
  status: string;
  /** Whether billing is paused for insufficient balance RIGHT NOW — the true current state, not just "was a pause event ever seen." A live chat:low_balance push can be missed by a socket that was briefly disconnected; this is how a (re)join recovers the real answer. */
  paused: boolean;
  /** ISO timestamp of when the current pause began, or null — lets a (re)joining client backdate its own freeze point instead of freezing from whenever it happens to notice. */
  pausedSince: string | null;
  seq: number;
  unread: number;
  messages: unknown[];
  /** Package bookings only — the true current package clock, recovered on every (re)join. */
  package?: PackageView;
  /** The server's clock at the time of the join — header clocks count against it, not the phone's. */
  serverTime?: string;
  error?: string;
}> {
  return new Promise((resolve, reject) => {
    const active = connectSocket();
    if (!active) {
      reject(new Error('Not online.'));
      return;
    }
    active.emit(CHAT_EVENTS.JOIN, { chatId, lastSeq }, (state: { error?: string }) => {
      if (state?.error) {
        reject(new Error(state.error));
        return;
      }
      resolve(state as never);
    });
  });
}

export function leaveChatRoom(chatId: string) {
  socket?.emit(CHAT_EVENTS.LEAVE, { chatId });
}

/** Mirrors backend/models/Chat.js's Message#toSocketPayload — what every message arrives shaped like, over the socket or the REST fallback alike. */
export type ChatMessage = {
  id: string;
  chatId: string;
  senderId: string | null;
  senderRole: 'user' | 'astrologer' | 'system' | 'ai';
  type: string;
  content: { text?: string; [key: string]: unknown };
  seq: number;
  replyTo: string | null;
  status: 'sent' | 'delivered' | 'read';
  clientMessageId?: string;
  createdAt: string;
};

/**
 * Sends a message over the socket. Falls back to the REST `sendMessage` in
 * `api.ts` when there is no live connection — the socket path is the normal
 * one, but a message must never be lost just because the connection dropped.
 */
export function sendChatMessage(
  chatId: string,
  text: string,
  clientMessageId: string,
): Promise<{ message?: unknown; error?: string }> {
  return new Promise((resolve, reject) => {
    if (!socket?.connected) {
      reject(new Error('offline'));
      return;
    }
    socket.emit(
      CHAT_EVENTS.SEND,
      { chatId, type: 'text', content: { text }, clientMessageId },
      (result: { message?: unknown; error?: string }) => {
        if (result?.error) {
          reject(new Error(result.error));
          return;
        }
        resolve(result);
      },
    );
  });
}

type TickPayload = { chatId: string; minutesBilled: number; minutesRemaining: number; balanceRemaining?: number };
type LowBalancePayload = {
  chatId: string;
  exhausted: boolean;
  /** true once the seeker's balance has actually paused billing; false again the moment a top-up resumes it. Undefined for the earlier, non-blocking warnings, which this app's screen has nothing useful to do with (only the seeker can recharge). */
  paused?: boolean;
  minutesRemaining?: number;
  graceSeconds?: number;
  secondsUntilCut?: number;
  requiredAmount?: number;
  balanceRemaining?: number;
};
type EndedPayload = { chatId: string; endedBy: string; reason?: string; durationSeconds: number; amountCharged: number };
type PackageWarningPayload = { chatId: string; endsAt: string; serverTime: string; secondsLeft: number; ratePerMinute: number };
type PerMinuteStartedPayload = { chatId: string; perMinuteStartedAt: string; serverTime: string; ratePerMinute: number };
type PackageEndedPayload = { chatId: string; pausedSince: string; serverTime: string };
type PackageExtendedPayload = { chatId: string; packageMinutes: number; endsAt: string; serverTime: string };

/**
 * Everything a live consultation screen needs while it is open: the
 * transcript (backfilled once now, and again after any reconnect — a chat
 * room is not remembered across a dropped socket, so rejoining is how a gap
 * fills itself back in), the minute ticks, low-balance warnings, and the end.
 *
 * Returns the unsubscribe function; call it on unmount.
 */
export function subscribeToChat(
  chatId: string,
  initialSeq: number,
  handlers: {
    onMessage?: (message: ChatMessage) => void;
    onTick?: (payload: TickPayload) => void;
    onLowBalance?: (payload: LowBalancePayload) => void;
    onEnded?: (payload: EndedPayload) => void;
    /**
     * Fires on every (re)join — including the very first one, since a socket
     * that's already connected by the time this screen mounts still runs
     * `rejoin()` immediately — with the session's true current pause state.
     * A live chat:low_balance push can be missed entirely by a socket that
     * was briefly disconnected; this is what lets the screen recover the
     * real answer instead of trusting whatever it last happened to see.
     */
    onRejoinState?: (payload: {
      status: string;
      paused: boolean;
      pausedSince: string | null;
      package?: PackageView;
      serverTime?: string;
    }) => void;
    /** Package bookings: ~30s of package time left. */
    onPackageWarning?: (payload: PackageWarningPayload) => void;
    /** Package bookings: the package ran out — paused until the seeker chooses how to continue. */
    onPackageEnded?: (payload: PackageEndedPayload) => void;
    /** Package bookings: the seeker continued with another package. */
    onPackageExtended?: (payload: PackageExtendedPayload) => void;
    /** Package bookings: the seeker continued per-minute. */
    onPerMinuteStarted?: (payload: PerMinuteStartedPayload) => void;
  },
): () => void {
  const active = connectSocket();
  if (!active) {
    return () => {};
  }

  let seq = initialSeq;

  const rejoin = () => {
    joinChatRoom(chatId, seq)
      .then(state => {
        handlers.onRejoinState?.({
          status: state.status,
          paused: state.paused,
          pausedSince: state.pausedSince,
          package: state.package,
          serverTime: state.serverTime,
        });
        for (const message of state.messages as ChatMessage[]) {
          seq = Math.max(seq, message.seq ?? seq);
          handlers.onMessage?.(message);
        }
      })
      .catch(() => {
        /** The room membership itself is what matters; a failed backfill just means nothing was missed to show. */
      });
  };

  if (active.connected) {
    rejoin();
  }
  active.on('connect', rejoin);

  const onMessage = (payload: ChatMessage) => {
    if (payload?.chatId !== chatId) return;
    seq = Math.max(seq, payload.seq ?? seq);
    handlers.onMessage?.(payload);
  };
  const onTick = (payload: TickPayload) => {
    if (payload?.chatId === chatId) handlers.onTick?.(payload);
  };
  const onLowBalance = (payload: LowBalancePayload) => {
    if (payload?.chatId === chatId) handlers.onLowBalance?.(payload);
  };
  const onEnded = (payload: EndedPayload) => {
    if (payload?.chatId === chatId) handlers.onEnded?.(payload);
  };

  const onPackageWarning = (payload: PackageWarningPayload) => {
    if (payload?.chatId === chatId) handlers.onPackageWarning?.(payload);
  };
  const onPerMinuteStarted = (payload: PerMinuteStartedPayload) => {
    if (payload?.chatId === chatId) handlers.onPerMinuteStarted?.(payload);
  };
  const onPackageEnded = (payload: PackageEndedPayload) => {
    if (payload?.chatId === chatId) handlers.onPackageEnded?.(payload);
  };
  const onPackageExtended = (payload: PackageExtendedPayload) => {
    if (payload?.chatId === chatId) handlers.onPackageExtended?.(payload);
  };

  active.on(CHAT_EVENTS.NEW, onMessage);
  active.on(CHAT_EVENTS.TICK, onTick);
  active.on(CHAT_EVENTS.LOW_BALANCE, onLowBalance);
  active.on(CHAT_EVENTS.ENDED, onEnded);
  active.on(CHAT_EVENTS.PACKAGE_WARNING, onPackageWarning);
  active.on(CHAT_EVENTS.PER_MINUTE_STARTED, onPerMinuteStarted);
  active.on(CHAT_EVENTS.PACKAGE_ENDED, onPackageEnded);
  active.on(CHAT_EVENTS.PACKAGE_EXTENDED, onPackageExtended);

  return () => {
    active.off('connect', rejoin);
    active.off(CHAT_EVENTS.NEW, onMessage);
    active.off(CHAT_EVENTS.TICK, onTick);
    active.off(CHAT_EVENTS.LOW_BALANCE, onLowBalance);
    active.off(CHAT_EVENTS.ENDED, onEnded);
    active.off(CHAT_EVENTS.PACKAGE_WARNING, onPackageWarning);
    active.off(CHAT_EVENTS.PER_MINUTE_STARTED, onPerMinuteStarted);
    active.off(CHAT_EVENTS.PACKAGE_ENDED, onPackageEnded);
    active.off(CHAT_EVENTS.PACKAGE_EXTENDED, onPackageExtended);
    leaveChatRoom(chatId);
  };
}

type IncomingRequestHandlers = {
  onRequested?: (payload: unknown) => void;
  onCancelled?: (payload: { chatId: string }) => void;
};

/**
 * The Dashboard and Consult screens register here on mount, whether or not
 * the astrologer is online yet — registering must never itself open the
 * connection (that is the toggle's job alone, per `api.ts`'s `setOnline`).
 * Whatever is registered is wired onto the socket the moment one actually
 * opens, and stays wired across a disconnect/reconnect since this set
 * outlives any one socket instance.
 */
const incomingRequestHandlers = new Set<IncomingRequestHandlers>();

function attachIncomingRequestListeners(target: Socket) {
  target.on(CHAT_EVENTS.REQUESTED, (payload: unknown) => {
    incomingRequestHandlers.forEach(handlers => handlers.onRequested?.(payload));
  });
  target.on(CHAT_EVENTS.CANCELLED, (payload: { chatId: string }) => {
    incomingRequestHandlers.forEach(handlers => handlers.onCancelled?.(payload));
  });
}

/**
 * The pre-active half of a request: the astrologer's own account room
 * (`astrologer:{id}`, auto-joined by the backend on connect) hears a new
 * request arrive, or the seeker cancel one still waiting on an answer.
 */
export function subscribeToIncomingRequests(handlers: IncomingRequestHandlers): () => void {
  incomingRequestHandlers.add(handlers);
  return () => {
    incomingRequestHandlers.delete(handlers);
  };
}
