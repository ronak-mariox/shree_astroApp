/**
 * Where a tapped notification leads.
 *
 * The server attaches an `action` to every notification — `{ screen, id? }`
 * (services/push.ts's `pushActionOf` reads it off a push) — written in the
 * backend's own vocabulary, which is shared with the seeker's app and the
 * website. This is the one place that vocabulary is turned into a place in
 * *this* app: a route of the signed-in shell (App.tsx) and, for the dashboard
 * route, which tab of it.
 *
 * Pure and table-driven, so it is tested without mounting anything
 * (__tests__/notificationRoutes.test.ts). App.tsx does the navigating — and
 * decides when not to (a live consultation is never left for a notification).
 */

import type { TabKey } from '../components/BottomNav';
import type { PushAction } from './push';

/** A destination a notification can open: a tab of the signed-in shell, or one of the screens pushed over it. */
export type NotificationRoute =
  | { route: 'dashboard'; tab: Exclude<TabKey, 'menu'> }
  | { route: 'help' }
  | { route: 'profileEdit' };

/** Where anything without a screen of its own goes: the Alerts tab, where the notification itself is listed. */
export const FALLBACK_ROUTE: NotificationRoute = { route: 'dashboard', tab: 'alerts' };

const ROUTES: Record<string, NotificationRoute> = {
  /**
   * `consultation_request` — a seeker is waiting on Accept / Decline. The
   * Consult tab is where that request sits, with both buttons on its card.
   */
  consultation: { route: 'dashboard', tab: 'consult' },
  /** Earnings credited, a payout approved or rejected. The server says `wallets` to an astrologer; `wallet` is the seeker-side spelling, taken too. */
  wallets: { route: 'dashboard', tab: 'wallet' },
  wallet: { route: 'dashboard', tab: 'wallet' },
  /** Support answered a ticket — the raised disputes and their replies are listed on Help & Support. */
  support: { route: 'help' },
  /** A profile change was reviewed. */
  profileEdit: { route: 'profileEdit' },
  /** The account was approved, or something about it changed: Home. */
  dashboard: { route: 'dashboard', tab: 'home' },
  astrologer: { route: 'dashboard', tab: 'home' },
};

/**
 * The destination for a notification's action. Never `undefined`: no action,
 * or one this app has no screen for (`order`, `puja_booking`, `referral`,
 * `loyalty`, `application`, `consultationChat`, anything new), opens the
 * Alerts tab.
 */
export function routeForAction(action?: PushAction): NotificationRoute {
  if (!action) {
    return FALLBACK_ROUTE;
  }
  /** An own-property check rather than a plain lookup: a screen named "constructor" must not find Object.prototype's. */
  return Object.prototype.hasOwnProperty.call(ROUTES, action.screen) ? ROUTES[action.screen] : FALLBACK_ROUTE;
}
