/**
 * Signing in, and the account the app is signed in as.
 *
 * An astrologer gets here one of two ways, and both end at the same place:
 *
 *   they applied          the four-step registration wizard in this app
 *   an admin created them the panel's short form, from an email address alone
 *
 * Either way they sign in with a **code** — to their mobile number if they
 * applied, or to the email address the admin used. There is no password.
 */

import { client } from './client';
import { DUMMY_PROFILE } from './dummyData';
import { USE_DUMMY_AUTH } from './dummyMode';
import { clearSession, saveSession } from './session';

/** The fixed code the OTP screen accepts while there is no SMS provider. */
const DUMMY_OTP_CODE = '123456';

/** The account every dummy sign-in lands on — kept in step with `dummyData.ts`. */
function dummyAstrologer(phone?: string, email?: string): AuthAstrologer {
  return {
    id: 'astrologer-dummy-1',
    name: DUMMY_PROFILE.fullName,
    email: email ?? DUMMY_PROFILE.email,
    phone: phone ?? DUMMY_PROFILE.primaryMobile,
    astroCode: DUMMY_PROFILE.astroCode,
    applicationStatus: 'approved',
    onboardingStep: 5,
  };
}

/** The account, as the app's header and gates read it. */
export type AuthAstrologer = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  photo?: string;
  astroCode?: string;
  /**
   * Where the application has reached. Everything short of `approved` means
   * they cannot take consultations yet.
   */
  applicationStatus: string;
  onboardingStep: number;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  astrologer: AuthAstrologer;
};

/** Which identifier the code is being sent to. */
export type LoginIdentifier =
  | { channel: 'phone'; phone: string }
  | { channel: 'email'; email: string };

/** What comes back from asking for a code — enough to run the resend timer. */
export type OtpRequest = {
  channel: 'phone' | 'email';
  /** Masked for display: "••••••3210", "ra•••@example.com". */
  destination: string;
  expiresInSeconds: number;
  resendInSeconds: number;
  /**
   * The code itself, returned only while the server has no SMS or mail
   * provider wired up. Never present in production.
   */
  devCode?: string;
};

/** Strips a typed number down to the ten digits the API wants. */
export function localPhoneOf(value: string): string {
  const digits = String(value).replace(/\D/g, '');
  return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
}

/**
 * Step one: ask for a code.
 *
 * An identifier with no account behind it comes back as a 404 with
 * `account_not_found`, which is the screen's cue to offer registration.
 */
export async function requestLoginOtp(identifier: LoginIdentifier): Promise<OtpRequest> {
  if (USE_DUMMY_AUTH) {
    const destination =
      identifier.channel === 'phone'
        ? `••••••${identifier.phone.slice(-4)}`
        : identifier.email.replace(/^(.{2}).*(@.*)$/, '$1•••$2');
    return {
      channel: identifier.channel,
      destination,
      expiresInSeconds: 300,
      resendInSeconds: 45,
      devCode: DUMMY_OTP_CODE,
    };
  }

  const { data } = await client.post<OtpRequest>('/auth/login/otp/request', {
    role: 'astrologer',
    ...identifier,
  });
  return data;
}

/** Step two: trade the code for a session, and store it in the keystore. */
export async function verifyLoginOtp(
  identifier: LoginIdentifier,
  code: string,
): Promise<AuthSession> {
  if (USE_DUMMY_AUTH) {
    const session: AuthSession = {
      accessToken: 'dummy-access-token',
      refreshToken: 'dummy-refresh-token',
      astrologer: dummyAstrologer(
        identifier.channel === 'phone' ? identifier.phone : undefined,
        identifier.channel === 'email' ? identifier.email : undefined,
      ),
    };
    await saveSession(session);
    return session;
  }

  const { data } = await client.post<AuthSession>('/auth/login/otp/verify', {
    role: 'astrologer',
    ...identifier,
    code: String(code).replace(/\D/g, ''),
  });

  await saveSession(data);
  return data;
}

/** What the registration wizard's first two steps collect. */
export type RegistrationDraft = {
  fullName: string;
  phone: string;
  email?: string;
  gender?: string;
  dateOfBirth?: string;
  languages?: string[];
  expertise?: string[];
  experienceYears?: number;
  about?: string;
};

/**
 * Opens an account from the app's own wizard.
 *
 * The account is created but **not approved** — documents and a bank account
 * are filed next, and an admin decides. The session comes back straight away so
 * those steps can be made against it.
 */
export async function register(draft: RegistrationDraft): Promise<AuthSession> {
  if (USE_DUMMY_AUTH) {
    const session: AuthSession = {
      accessToken: 'dummy-access-token',
      refreshToken: 'dummy-refresh-token',
      astrologer: {
        ...dummyAstrologer(draft.phone, draft.email),
        name: draft.fullName.trim() || DUMMY_PROFILE.fullName,
        applicationStatus: 'registered',
        onboardingStep: 0,
      },
    };
    await saveSession(session);
    return session;
  }

  const form = new FormData();

  form.append('fullName', draft.fullName.trim());
  form.append('phone', localPhoneOf(draft.phone));
  if (draft.email) form.append('email', draft.email.trim().toLowerCase());
  if (draft.gender) form.append('gender', draft.gender.toLowerCase());
  if (draft.dateOfBirth) form.append('dateOfBirth', draft.dateOfBirth);
  if (draft.experienceYears !== undefined) {
    form.append('experienceYears', String(draft.experienceYears));
  }
  if (draft.about) form.append('about', draft.about);
  /** Repeated rows are how multipart carries a list. */
  for (const language of draft.languages ?? []) form.append('languages', language);
  for (const area of draft.expertise ?? []) form.append('expertise', area);

  const { data } = await client.post<AuthSession>('/auth/astrologer/register', form);

  await saveSession(data);
  return data;
}

/**
 * Ends the session this device is holding.
 *
 * The local wipe is the sign-out; the server call is a courtesy, so signing out
 * works with no connection.
 */
export async function signOut(): Promise<void> {
  if (!USE_DUMMY_AUTH) {
    try {
      await client.post('/auth/logout');
    } catch {
      /* Nothing here is worth staying signed in for. */
    }
  }
  await clearSession();
}
