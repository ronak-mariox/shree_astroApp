/**
 * The incoming-request queue, shared behind the dashboard and the Consult
 * tab (see utils/requests.ts's own note on why the mapping lives in one
 * place — this is the same queue for the same reason). A request answered
 * from either screen leaves the same live queue, socket subscription, and
 * answer flow behind it.
 *
 * A fresh request pushed over the socket opens the review popup itself,
 * rather than waiting for the astrologer to notice a new card in the list —
 * that live pop-open is the whole point of wiring the socket in here instead
 * of leaving each screen's plain `useApi(() => fetchRequests())` as the only
 * way a request is ever seen.
 */
import { useEffect, useState } from 'react';

import { useApi } from './useApi';
import type { ConsultationRequest } from '../components/RequestCard';
import * as api from '../services/api';
import { requestsFromApi } from '../utils/requests';

export function useIncomingRequests(options: {
  /** Fires once a request is accepted — the caller is what actually opens the chat. */
  onAccepted?: (request: ConsultationRequest) => void;
  /** Anything else the caller reloads alongside the queue once a request is answered (the dashboard's own pendingRequests count, say). */
  onSettled?: () => void | Promise<void>;
} = {}) {
  const { onAccepted, onSettled } = options;
  const queue = useApi(() => api.fetchRequests(), []);
  const [reviewing, setReviewing] = useState<ConsultationRequest | null>(null);

  useEffect(
    () =>
      api.subscribeToIncomingRequests({
        onRequested: () => {
          queue.reload();
        },
        onCancelled: payload => {
          setReviewing(current => (current?.id === payload.chatId ? null : current));
          queue.reload();
        },
      }),
    // queue.reload is a fresh closure every render; the subscription itself only needs to open once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const requests = requestsFromApi(queue.data ?? []);

  const answer = async (request: ConsultationRequest, accepted: boolean) => {
    setReviewing(null);

    try {
      if (accepted) {
        await api.acceptRequest(request.id);
        onAccepted?.(request);
      } else {
        await api.rejectRequest(request.id, 'Declined');
      }
    } finally {
      await queue.reload();
      await onSettled?.();
    }
  };

  return { requests, reviewing, setReviewing, answer, reloadQueue: queue.reload };
}
