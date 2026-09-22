/**
 * The live consultation's header clock, measured on the SERVER's clock.
 *
 * Both apps draw the same clock from the same GET /chats/:id: `startedAt`
 * (and, for a package booking, `package.endsAt`) plus the server's
 * `serverTime` at the moment of the read. Counting from the phone's own
 * clock instead would put the seeker's and the astrologer's headers minutes
 * apart whenever either phone's clock is off. user_app's
 * src/data/consultPackages.ts has the same functions — keep them in step.
 */

/** How far the server's clock is ahead of this device's, in ms. */
export function clockOffsetMs(serverTime: string | undefined | null, deviceNow: number = Date.now()): number {
  if (!serverTime) {
    return 0;
  }
  const server = new Date(serverTime).getTime();
  return Number.isNaN(server) ? 0 : server - deviceNow;
}

/** Whole seconds until `iso` on the server's clock (0 once it has passed, or when there's no time). */
export function secondsUntil(iso: string | undefined | null, offsetMs: number, deviceNow: number = Date.now()): number {
  if (!iso) {
    return 0;
  }
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) {
    return 0;
  }
  return Math.max(0, Math.ceil((target - (deviceNow + offsetMs)) / 1000));
}

/** Whole seconds elapsed since `startedAt` on the server's clock, less any time spent paused. */
export function elapsedSeconds(
  startedAt: string | undefined | null,
  offsetMs: number,
  pausedMs = 0,
  deviceNow: number = Date.now(),
): number {
  if (!startedAt) {
    return 0;
  }
  const started = new Date(startedAt).getTime();
  if (Number.isNaN(started)) {
    return 0;
  }
  return Math.max(0, Math.floor((deviceNow + offsetMs - started - pausedMs) / 1000));
}

/** 125 -> "02:05". */
export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}

/** Where a package booking stands — mirrors the backend's packageViewFor. Undefined for a per-minute session. */
export type PackageView = {
  phase: 'package' | 'per_minute';
  endsAt?: string;
  warningSeconds?: number;
  perMinuteStartedAt?: string;
  requestedMinutes?: number;
};
