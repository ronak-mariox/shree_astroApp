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
import type { IncomingRequest } from '../services/api';
import { requestsFromApi } from '../utils/requests';

export function useIncomingRequests(options: {
  /** Fires once a request is accepted — the caller is what actually opens the chat. */
  onAccepted?: (request: ConsultationRequest) => void;
  /** Anything else the caller reloads alongside the queue once a request is answered (the dashboard's own pendingRequests count, say). */
  onSettled?: () => void | Promise<void>;
  /**
   * Changes when something outside the socket says the queue may have moved —
   * a push notification arriving or being tapped (App.tsx). The queue is read
   * again, which is what shows a request the socket was not connected to hear.
   */
  refreshKey?: number;
} = {}) {
  const { onAccepted, onSettled, refreshKey } = options;
  const queue = useApi(() => api.fetchRequests(), [refreshKey]);
  const [reviewing, setReviewing] = useState<ConsultationRequest | null>(null);

  useEffect(() => {
    /** A request withdrawn or aged out closes its popup — answering it now would only be refused. */
    const closeIfReviewing = (payload: { chatId: string }) => {
      setReviewing(current => (current?.id === payload.chatId ? null : current));
      queue.reload();
    };
    const unsubscribe = api.subscribeToIncomingRequests({
      onRequested: payload => {
        /** Straight into the review popup — unless one is already open, which keeps the astrologer's place. */
        const [request] = requestsFromApi([payload as IncomingRequest]);
        if (request) {
          setReviewing(current => current ?? request);
        }
        queue.reload();
      },
      onCancelled: closeIfReviewing,
      onMissed: closeIfReviewing,
    });
    /**
     * Opened here, not only by the online toggle: the toggle survives the app
     * closing, so an astrologer who reopens it already Online would otherwise
     * have no live connection until they flipped the switch twice.
     */
    api.connectLiveUpdates();
    return unsubscribe;
    // queue.reload is a fresh closure every render; the subscription itself only needs to open once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
