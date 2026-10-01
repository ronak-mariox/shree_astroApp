/**
 * The voice half of a `call` consultation — one thin wrapper around
 * react-native-agora v4, so the screen never touches the engine directly.
 *
 * The SERVER owns everything about the channel: GET /chats/:id/call-token
 * (`api.fetchCallToken`) hands back the app id, the channel name (the chat id
 * itself), this side's fixed uid (astrologer 2001, seeker 1001) and a token.
 * This file only joins what it is given. user_app's src/services/voiceCall.ts
 * is the same wrapper from the other side of the call — the two must keep
 * using the same Agora calls (communication profile, broadcaster role,
 * microphone track published, audio auto-subscribed) so both phones land in
 * the same channel and hear each other.
 *
 * One call at a time: a second `joinVoiceCall` first leaves whatever the
 * first one joined. `leaveVoiceCall` is safe to call any number of times —
 * the screen calls it on the session ending, on the astrologer ending it,
 * and again on unmount, and only the first does anything.
 */

import { PermissionsAndroid, Platform } from 'react-native';
import type {
  ConnectionChangedReasonType,
  ConnectionStateType,
  ErrorCodeType,
  IRtcEngine,
  IRtcEngineEventHandler,
  RtcConnection,
  UserOfflineReasonType,
} from 'react-native-agora';

/**
 * The SDK is loaded lazily, inside `joinVoiceCall`: `react-native-agora`
 * resolves its native module the moment it is imported, so a static import
 * would crash a binary built before the module was linked (and the Jest
 * suite). Loading it on the first call keeps every other screen working on an
 * old build, and turns a missing native module into a readable call error.
 */
type AgoraSdk = typeof import('react-native-agora');
let sdk: AgoraSdk | null = null;

/** What the engine reports back to the screen, reduced to what a call UI needs. */
export type VoiceCallEvent =
  /** We are in the channel (`onJoinChannelSuccess`). */
  | { type: 'joined'; uid: number }
  /** The other party is in the channel — audio flows from here. */
  | { type: 'peerJoined'; uid: number }
  /** They left, or dropped off the network (`reason` is Agora's UserOfflineReasonType). */
  | { type: 'peerLeft'; uid: number; reason: UserOfflineReasonType }
  /** Our own connection dropped and the SDK is trying to get it back. */
  | { type: 'reconnecting' }
  /** …and got it back. */
  | { type: 'reconnected' }
  /** The token runs out in ~30s (or already has): fetch a fresh one and `renewVoiceToken` it. */
  | { type: 'tokenExpiring' }
  /** `onError`, or the connection giving up for good — `code` is Agora's ErrorCodeType / ConnectionChangedReasonType. */
  | { type: 'error'; code: number; message: string }
  /** Android refused RECORD_AUDIO — nothing was joined. */
  | { type: 'permissionDenied' };

/** Dev-only tracing for the first real-device runs — every engine call's return code and every event. */
const VOICE_LOG = (...args: unknown[]) => { if (__DEV__) console.log('[voice]', ...args); };

export type JoinVoiceCallOptions = {
  appId: string;
  /** The chat id — both sides join the channel named after the session. */
  channelName: string;
  /** This side's fixed uid from the token endpoint. */
  uid: number;
  token: string;
  onEvent: (event: VoiceCallEvent) => void;
};

let engine: IRtcEngine | null = null;
let handler: IRtcEngineEventHandler | null = null;
/** Remembered across the join so a mute/speaker set before the channel is up still applies. Reset on leave. */
let muted = false;
let speakerOn = false;
/** True from `onJoinChannelSuccess` until leave: the speaker route can only be set on a live connection (-3 before). */
let inChannel = false;

/**
 * Android needs the microphone granted at runtime before the engine opens it;
 * iOS prompts on its own the first time (NSMicrophoneUsageDescription).
 */
async function ensureMicrophonePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }
  try {
    const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

/** The engine's callbacks, reduced to `VoiceCallEvent`s for the screen. */
function eventHandlerFor(agora: AgoraSdk, onEvent: (event: VoiceCallEvent) => void): IRtcEngineEventHandler {
  const { ConnectionStateType: State, ConnectionChangedReasonType: Reason } = agora;
  return {
    onJoinChannelSuccess: (connection: RtcConnection) => {
      inChannel = true;
      /** Whatever the astrologer set while the channel was still coming up. */
      engine?.muteLocalAudioStream(muted);
      engine?.setEnableSpeakerphone(speakerOn);
      onEvent({ type: 'joined', uid: connection.localUid ?? 0 });
    },
    onRejoinChannelSuccess: () => {
      onEvent({ type: 'reconnected' });
    },
    onUserJoined: (_connection: RtcConnection, remoteUid: number) => {
      onEvent({ type: 'peerJoined', uid: remoteUid });
    },
    onUserOffline: (_connection: RtcConnection, remoteUid: number, reason: UserOfflineReasonType) => {
      onEvent({ type: 'peerLeft', uid: remoteUid, reason });
    },
    onConnectionStateChanged: (
      _connection: RtcConnection,
      state: ConnectionStateType,
      reason: ConnectionChangedReasonType,
    ) => {
      if (state === State.ConnectionStateReconnecting) {
        onEvent({ type: 'reconnecting' });
      } else if (
        state === State.ConnectionStateConnected &&
        reason === Reason.ConnectionChangedRejoinSuccess
      ) {
        onEvent({ type: 'reconnected' });
      } else if (state === State.ConnectionStateFailed) {
        /** The SDK has stopped trying; only a fresh join gets the call back. */
        onEvent({ type: 'error', code: reason, message: `Connection failed (reason ${reason})` });
      }
      if (
        reason === Reason.ConnectionChangedTokenExpired ||
        reason === Reason.ConnectionChangedInvalidToken
      ) {
        onEvent({ type: 'tokenExpiring' });
      }
    },
    onTokenPrivilegeWillExpire: () => {
      onEvent({ type: 'tokenExpiring' });
    },
    onRequestToken: () => {
      onEvent({ type: 'tokenExpiring' });
    },
    onError: (err: ErrorCodeType, msg: string) => {
      onEvent({ type: 'error', code: err, message: msg });
    },
  };
}

/**
 * Joins the session's voice channel. Resolves `true` once the join request is
 * accepted by the engine (the `joined` event follows when the channel is
 * actually up), `false` when nothing was joined — a denied microphone
 * permission or a refused join, both already reported through `onEvent`.
 */
export async function joinVoiceCall(options: JoinVoiceCallOptions): Promise<boolean> {
  const { appId, channelName, uid, token, onEvent: rawOnEvent } = options;
  const onEvent = (event: VoiceCallEvent) => { VOICE_LOG('event', JSON.stringify(event)); rawOnEvent(event); };
  VOICE_LOG('join requested', { appIdLen: appId.length, channelName, uid, tokenLen: token.length });

  if (!(await ensureMicrophonePermission())) {
    onEvent({ type: 'permissionDenied' });
    return false;
  }

  /** One call at a time. */
  leaveVoiceCall();

  if (!sdk) {
    try {
      sdk = await import('react-native-agora');
    } catch {
      onEvent({ type: 'error', code: -1, message: 'Voice calls need the app rebuilt with react-native-agora.' });
      return false;
    }
  }
  const agora = sdk;

  const rtc = agora.createAgoraRtcEngine();
  const initialised = rtc.initialize({
    appId,
    channelProfile: agora.ChannelProfileType.ChannelProfileCommunication,
  });
  VOICE_LOG('initialize ->', initialised);
  if (initialised !== 0) {
    onEvent({ type: 'error', code: initialised, message: `Could not start the voice engine (${initialised})` });
    return false;
  }

  VOICE_LOG('enableAudio ->', rtc.enableAudio());
  /** A voice call plays through the earpiece unless the astrologer taps Speaker. */
  VOICE_LOG('setDefaultAudioRoute ->', rtc.setDefaultAudioRouteToSpeakerphone(false));

  handler = eventHandlerFor(agora, onEvent);
  rtc.registerEventHandler(handler);
  engine = rtc;

  const joined = rtc.joinChannel(token, channelName, uid, {
    clientRoleType: agora.ClientRoleType.ClientRoleBroadcaster,
    publishMicrophoneTrack: true,
    autoSubscribeAudio: true,
    /** Voice only — no camera, and nothing to draw a remote video on. */
    publishCameraTrack: false,
    autoSubscribeVideo: false,
  });
  VOICE_LOG('joinChannel ->', joined);
  if (joined !== 0) {
    onEvent({ type: 'error', code: joined, message: `Could not join the call (${joined})` });
    leaveVoiceCall();
    return false;
  }

  /** The mute flag may be set before the channel is up; the speaker route is applied on `onJoinChannelSuccess`. */
  rtc.muteLocalAudioStream(muted);
  return true;
}

/**
 * Leaves the channel and releases the engine. Idempotent: the first call does
 * the work, every later one is a no-op — so ending, `session:ended` and
 * unmount can each call it without worrying about the others.
 */
export function leaveVoiceCall(): void {
  const rtc = engine;
  const registered = handler;
  engine = null;
  handler = null;
  muted = false;
  speakerOn = false;
  inChannel = false;
  if (!rtc) {
    return;
  }
  try {
    rtc.leaveChannel();
  } catch {
    /** Already out of the channel — nothing to undo. */
  }
  if (registered) {
    try {
      rtc.unregisterEventHandler(registered);
    } catch {
      /** Releasing below drops it regardless. */
    }
  }
  try {
    /** Synchronous, as Agora asks when the engine may be created again straight away (a Retry, the next call): an async release still winding down makes the next `joinChannel` fail with -17. */
    rtc.release(true);
    VOICE_LOG('release(sync) done');
  } catch (e) {
    VOICE_LOG('release threw', String(e));
  }
}

/** Stops (or resumes) sending the microphone. Remembered, so it also applies to a channel joined later. */
export function setMuted(mute: boolean): void {
  muted = mute;
  engine?.muteLocalAudioStream(mute);
}

/** Routes playback to the loudspeaker (true) or the earpiece (false). */
export function setSpeaker(on: boolean): void {
  speakerOn = on;
  if (inChannel) {
    engine?.setEnableSpeakerphone(on);
  }
}

/** Hands the engine a fresh token after `tokenExpiring`. */
export function renewVoiceToken(token: string): void {
  engine?.renewToken(token);
}

/** Whether a channel is currently joined (or being joined). */
export function isInVoiceCall(): boolean {
  return engine !== null;
}
