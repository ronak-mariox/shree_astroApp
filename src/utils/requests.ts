/**
 * Turning an incoming request from the API into the shape a request card draws.
 *
 * Two screens show the same queue — the dashboard and the Consult tab — so the
 * mapping lives here rather than in both.
 */

import type { ConsultationRequest } from '../components/RequestCard';
import type { IncomingRequest } from '../services/api';

/** "Priya Mehta" -> "PM", for the tile on the card. */
export const initialsOf = (name?: string) =>
  (name ?? '?')
    .split(' ')
    .map(part => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

/** An ISO time -> "2 min ago", as the card prints how long it has waited. */
export function ageOf(at?: string): string {
  if (!at) {
    return 'Just now';
  }

  const seconds = Math.max(Math.floor((Date.now() - new Date(at).getTime()) / 1000), 0);
  if (seconds < 60) {
    return 'Just now';
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min ago`;
  }
  return `${Math.floor(minutes / 60)} hr ago`;
}

/** "career-job" -> "Career job". */
export const titleOf = (value?: string) =>
  value ? value.replace(/[-_]+/g, ' ').replace(/^./, character => character.toUpperCase()) : '';

export function requestsFromApi(
  rows: ReadonlyArray<IncomingRequest>,
): ConsultationRequest[] {
  return rows.map(request => {
    const birth = request.intake?.birthDetails as
      | { dateOfBirth?: string; place?: { formatted?: string; city?: string } }
      | undefined;
    const minutes = request.intake?.minutesBooked ?? 0;

    return {
      id: request.chatId,
      name: request.user?.name ?? 'Someone',
      initials: initialsOf(request.user?.name),
      age: ageOf(request.requestedAt),
      channel: request.channel === 'call' ? 'voice' : 'chat',
      topic: titleOf(request.intake?.topic) || 'General',
      details: {
        dateOfBirth: birth?.dateOfBirth
          ? new Date(birth.dateOfBirth).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : '—',
        birthPlace: birth?.place?.formatted ?? birth?.place?.city ?? '—',
        issue: request.intake?.question ?? titleOf(request.intake?.topic) ?? '—',
        rate: `₹ ${request.ratePerMinute}/min`,
        duration: minutes ? `${minutes} min` : '—',
        earnings: minutes ? `₹ ${minutes * request.ratePerMinute}` : '—',
      },
    };
  });
}
