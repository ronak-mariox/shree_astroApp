/**
 * The rates the astrologer charges per service, and the changes they have asked
 * for.
 * Figma: nodes 110:11895 (the screen) and 110:12038 (its sheet).
 */

/** The paragraph under the screen's heading (Figma node 110:11980). */
export const CHANGE_REQUEST_INTRO =
  'You can request pricing changes for services like video calls, audio calls, live broadcasts, and chat consultations to maintain high-quality astrological insights and public support. Thank you for your attention.';

export type ServiceRate = {
  id: string;
  /** The panel's name, e.g. "Call". */
  name: string;
  oldRate: string;
  currentRate: string;
  offer: string;
  applyAll: string;
  newRequestedRate: string;
  requestDate: string;
  status: string;
  /** Emergency Chat is drawn on its own warm gradient (node 110:12034). */
  emergency?: boolean;
};

/**
 * Figma fills in only the first panel and leaves the rest closed, so the others
 * carry the same figures until a request is made against them.
 */
const BASE = {
  oldRate: '₹ 15',
  currentRate: '₹ 15',
  offer: '15%',
  applyAll: 'Yas',
  newRequestedRate: '₹ 15',
  requestDate: '20 Jan, 2025',
  status: 'Pending',
} as const;

/** Figma nodes 110:11983 – 110:12036, in order. */
export const SEED_SERVICE_RATES: ReadonlyArray<ServiceRate> = [
  { id: 'call', name: 'Call', ...BASE },
  { id: 'chat', name: 'Chat', ...BASE },
  { id: 'live-chat', name: 'Live Chat', ...BASE },
  { id: 'live-call', name: 'Live Call', ...BASE },
  { id: 'live-video-call', name: 'Live Video call', ...BASE },
  { id: 'emergency-chat', name: 'Emergency Chat', ...BASE, emergency: true },
];

/** The rows a panel prints, in Figma's order (nodes 110:11987 – 110:12007). */
export function rateRowsOf(service: ServiceRate) {
  return [
    { label: 'Old Rate', value: service.oldRate },
    { label: 'Current Rate', value: service.currentRate },
    { label: 'Offer (%)', value: service.offer },
    { label: 'Apply All', value: service.applyAll },
    { label: 'New Req Rate', value: service.newRequestedRate },
    { label: 'Req Date', value: service.requestDate },
    { label: 'Status', value: service.status, status: true },
  ];
}

export type PriceChangeDraft = {
  service: string;
  newPrice: string;
};

export const EMPTY_PRICE_CHANGE: PriceChangeDraft = {
  service: '',
  newPrice: '',
};

/** Everything the sheet needs before the server will take the request. */
export function validatePriceChange(draft: PriceChangeDraft): string | null {
  if (!draft.service.trim()) return 'Pick the service you are repricing.';
  const price = Number(draft.newPrice.replace(/[^0-9.]/g, ''));
  if (!draft.newPrice.trim() || Number.isNaN(price) || price <= 0) {
    return 'Enter the new rate as a number.';
  }
  return null;
}
