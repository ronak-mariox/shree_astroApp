/**
 * The whole app — dashboard, presence/service toggles, wallet/earnings,
 * withdrawals, notifications, history, support, and (independently, via the
 * flags below) auth and profile — is wired to, and verified against, the real
 * backend. Every function's dummy branch (reads from `./dummyData`, writes
 * that simulate success against it) is left in place beneath the early return
 * it used to take, in case an area ever needs pulling back off the live
 * backend to keep working with nothing running behind it — see
 * `services/api.ts`. See `USE_DUMMY_CONSULT` below for the one area still
 * deliberately kept on fixtures.
 */
export const USE_DUMMY_DATA = false;

/**
 * Sign-up (the four-step wizard), sign-in, and sign-out (`services/auth.ts`)
 * — kept as its own flag from when it was taken out from under `USE_DUMMY_DATA`
 * independently of the rest of the app.
 */
export const USE_DUMMY_AUTH = false;

/**
 * The astrologer's own profile — view, edit, photo, documents, bank accounts,
 * opening rates, service rates and price-change requests, reviews (list,
 * reply, flag, pin), gallery, and submitting the application for review (all
 * in `services/api.ts`) — kept as its own flag from when it was taken out
 * from under `USE_DUMMY_DATA` independently of the rest of the app.
 */
export const USE_DUMMY_PROFILE = false;

/**
 * The Consult tab — the incoming-request queue, missed calls, accept/reject,
 * and the live chat itself (`fetchRequests`, `acceptRequest`, `rejectRequest`,
 * `endConsultation`, `fetchConsultations`, `fetchMessages`, `sendMessage`) —
 * now wired to the real backend, same as everything else above.
 */
export const USE_DUMMY_CONSULT = false;
