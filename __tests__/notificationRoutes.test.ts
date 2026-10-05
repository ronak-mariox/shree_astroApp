/**
 * services/notificationRoutes.ts — the table that turns the server's
 * `action` on a notification into a place in this app. Pure, so nothing is
 * mounted; that App.tsx actually goes there is PushWiring.test.tsx.
 */
import { FALLBACK_ROUTE, routeForAction } from '../src/services/notificationRoutes';

describe('routeForAction', () => {
  test('a consultation — "a seeker is waiting" — opens the Consult tab, where Accept / Decline are', () => {
    expect(routeForAction({ screen: 'consultation', id: 'chat-9' })).toEqual({ route: 'dashboard', tab: 'consult' });
    /** The id is not needed to get there: the tab lists every pending request. */
    expect(routeForAction({ screen: 'consultation' })).toEqual({ route: 'dashboard', tab: 'consult' });
  });

  test.each([
    ['wallets', { route: 'dashboard', tab: 'wallet' }],
    ['wallet', { route: 'dashboard', tab: 'wallet' }],
    ['support', { route: 'help' }],
    ['profileEdit', { route: 'profileEdit' }],
    ['dashboard', { route: 'dashboard', tab: 'home' }],
    ['astrologer', { route: 'dashboard', tab: 'home' }],
  ])('%s → %o', (screen, destination) => {
    expect(routeForAction({ screen })).toEqual(destination);
    /** An id riding along changes nothing. */
    expect(routeForAction({ screen, id: 'x-1' })).toEqual(destination);
  });

  test.each([
    'order',
    'puja_booking',
    'referral',
    'loyalty',
    'application',
    /** The seeker app's live-consultation action: an astrologer's consultation opens by accepting, not from a notification. */
    'consultationChat',
    'something-new',
    /** Spelling counts — the table is the server's vocabulary, exactly. */
    'Wallet',
    'CONSULTATION',
  ])('"%s" has no screen in this app → the Alerts tab', screen => {
    expect(routeForAction({ screen, id: 'x-1' })).toEqual({ route: 'dashboard', tab: 'alerts' });
  });

  test('no action at all → the Alerts tab', () => {
    expect(routeForAction(undefined)).toEqual({ route: 'dashboard', tab: 'alerts' });
    expect(routeForAction()).toBe(FALLBACK_ROUTE);
  });

  test.each(['constructor', 'toString', 'hasOwnProperty', '__proto__'])(
    'a screen named "%s" finds nothing on Object.prototype → the Alerts tab',
    screen => {
      expect(routeForAction({ screen })).toEqual({ route: 'dashboard', tab: 'alerts' });
    },
  );
});
