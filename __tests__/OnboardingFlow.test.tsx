import React from 'react';
import { TextInput } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { OtpInput } from '../src/components/OtpInput';
import { PhoneField } from '../src/components/PhoneField';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { SecondaryButton } from '../src/components/SecondaryButton';
import { SlideProgress } from '../src/components/SlideProgress';
import { SocialAuthButtons } from '../src/components/SocialAuthButtons';
import { ONBOARDING_SLIDES, WELCOME_FEATURES } from '../src/data/onboarding';
import { AstrologerWelcomeScreen } from '../src/screens/AstrologerWelcomeScreen';
import { LoginScreen } from '../src/screens/LoginScreen';
import { OnboardingScreen } from '../src/screens/OnboardingScreen';
import { OtpVerificationScreen } from '../src/screens/OtpVerificationScreen';
import { WelcomeScreen } from '../src/screens/WelcomeScreen';

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

/** Concatenated visible text — the screens draw a lot of SVG the JSON dump
 *  would otherwise drown the assertions in. */
const textOf = (tree: ReactTestRenderer.ReactTestRenderer): string => {
  const walk = (node: any): string => {
    if (node === null || node === undefined) return '';
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(walk).join('');
    if (typeof node === 'object') return walk(node.children);
    return '';
  };
  return walk(tree.toJSON());
};

const mounted: ReactTestRenderer.ReactTestRenderer[] = [];

const render = async (element: React.ReactElement) => {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={METRICS}>{element}</SafeAreaProvider>,
    );
  });
  mounted.push(tree);
  return tree;
};

/** The OTP countdown keeps a timer alive, so every tree is torn down. */
afterEach(async () => {
  await ReactTestRenderer.act(() => {
    mounted.splice(0).forEach(tree => tree.unmount());
  });
});

/** Walks the pager to its last slide by tapping "Next →". */
const goToLastSlide = async (tree: ReactTestRenderer.ReactTestRenderer) => {
  for (let step = 0; step < ONBOARDING_SLIDES.length - 1; step += 1) {
    const next = tree.root.findAllByType(PrimaryButton)[0];
    await ReactTestRenderer.act(() => {
      next.props.onPress();
    });
  }
};

test('welcome screen renders the hero copy and both account actions', async () => {
  const text = textOf(await render(<WelcomeScreen />));

  expect(text).toContain('Shree Astro');
  expect(text).toContain('Discover Your');
  expect(text).toContain('Cosmic Destiny');
  expect(text).toContain('Connect with expert astrologers');
  expect(text).toContain('Login');
  expect(text).toContain('Create Account');
  expect(text).toContain('By continuing, you agree to our Terms & Privacy Policy');
});

test('onboarding renders all four slides with the first one active', async () => {
  const tree = await render(<OnboardingScreen />);
  const text = textOf(tree);

  for (const slide of ONBOARDING_SLIDES) {
    expect(text).toContain(slide.title);
    expect(text).toContain(slide.body);
  }

  expect(text).toContain('Skip');
  expect(text).toContain('Next →');
  expect(text).not.toContain('Get Started');

  // One indicator per slide, each lighting its own dot.
  const indicators = tree.root.findAllByType(SlideProgress);
  expect(indicators.map(indicator => indicator.props.activeIndex)).toEqual(
    ONBOARDING_SLIDES.map((_, index) => index),
  );
});

test('onboarding swaps Skip / Next for Get Started on the last slide', async () => {
  const tree = await render(<OnboardingScreen />);
  await goToLastSlide(tree);

  const text = textOf(tree);
  expect(text).toContain('Get Started →');
  expect(text).not.toContain('Next →');
  expect(tree.root.findAllByType(SecondaryButton)).toHaveLength(0);
});

test('onboarding reports skipping and finishing', async () => {
  const onSkip = jest.fn();
  const onFinish = jest.fn();
  const tree = await render(
    <OnboardingScreen onSkip={onSkip} onFinish={onFinish} />,
  );

  await ReactTestRenderer.act(() => {
    tree.root.findAllByType(SecondaryButton)[0].props.onPress();
  });
  expect(onSkip).toHaveBeenCalledTimes(1);

  await goToLastSlide(tree);
  await ReactTestRenderer.act(() => {
    tree.root.findAllByType(PrimaryButton)[0].props.onPress();
  });
  expect(onFinish).toHaveBeenCalledTimes(1);
});

test('astrologer welcome renders the features and both entry points', async () => {
  const onLogin = jest.fn();
  const onRegister = jest.fn();
  const tree = await render(
    <AstrologerWelcomeScreen onLogin={onLogin} onRegister={onRegister} />,
  );
  const text = textOf(tree);

  expect(text).toContain('Welcome to Shree Astro');
  expect(text).toContain(
    'Your premium platform for Vedic astrology consultations',
  );
  for (const feature of WELCOME_FEATURES) {
    expect(text).toContain(feature);
  }
  expect(text).toContain('Login to Your Account');
  expect(text).toContain('Register as Astrologer');

  await ReactTestRenderer.act(() => {
    tree.root.findAllByType(PrimaryButton)[0].props.onPress();
  });
  await ReactTestRenderer.act(() => {
    tree.root.findAllByType(SecondaryButton)[0].props.onPress();
  });

  expect(onLogin).toHaveBeenCalledTimes(1);
  expect(onRegister).toHaveBeenCalledTimes(1);
});

test('login renders the header, field and every social option', async () => {
  const tree = await render(<LoginScreen />);
  const text = textOf(tree);

  expect(text).toContain('Welcome Back');
  expect(text).toContain('Login with your mobile number');
  expect(text).toContain('Mobile Number');
  expect(text).toContain('+91');
  expect(text).toContain('or login with');
  expect(text).toContain('Send OTP');

  // Host nodes only — Pressable surfaces the role on its composite nodes too.
  const socials = tree.root
    .findByType(SocialAuthButtons)
    .findAll(
      node =>
        typeof node.type === 'string' &&
        node.props.accessibilityRole === 'button',
    );
  expect(socials.map(node => node.props.accessibilityLabel)).toEqual([
    'Continue with Google',
    'Continue with Apple',
  ]);
});

test('login arms Send OTP only once the number is ten digits', async () => {
  const onSendOtp = jest.fn();
  const tree = await render(<LoginScreen onSendOtp={onSendOtp} />);

  const cta = () => tree.root.findByType(PrimaryButton);
  const field = () => tree.root.findByType(PhoneField).findByType(TextInput);

  expect(cta().props.disabled).toBe(true);

  await ReactTestRenderer.act(() => {
    field().props.onChangeText('98765');
  });
  expect(cta().props.disabled).toBe(true);

  // Letters and separators are dropped as they are typed.
  await ReactTestRenderer.act(() => {
    field().props.onChangeText('98765-4321x0');
  });
  expect(field().props.value).toBe('9876543210');
  expect(cta().props.disabled).toBe(false);

  await ReactTestRenderer.act(() => {
    cta().props.onPress();
  });
  /** The screen also passes the dev code through, which is undefined here. */
  expect(onSendOtp).toHaveBeenCalledWith('9876543210', undefined);
});

test('otp screen renders the code destination, countdown and advisory', async () => {
  const text = textOf(await render(<OtpVerificationScreen mobile="98765 43210" />));

  expect(text).toContain('Verify OTP');
  expect(text).toContain('6-digit code sent to');
  expect(text).toContain('+91 98765 43210');
  expect(text).toContain('Resend in 0:45');
  expect(text).toContain('Verify & Continue');
  expect(text).toContain('Auto-reading SMS. Allow SMS permission if prompted.');
});

test('otp screen fills its boxes and arms the CTA on the sixth digit', async () => {
  const onVerified = jest.fn();
  const tree = await render(<OtpVerificationScreen onVerified={onVerified} />);

  const cta = () => tree.root.findByType(PrimaryButton);
  const boxes = () => tree.root.findByType(OtpInput).findAllByType(TextInput);

  expect(boxes()).toHaveLength(6);
  expect(cta().props.disabled).toBe(true);

  // Typing into the first box absorbs a whole pasted code.
  await ReactTestRenderer.act(() => {
    boxes()[0].props.onChangeText('123456');
  });

  expect(boxes().map(box => box.props.value)).toEqual([
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
  ]);
  expect(cta().props.disabled).toBe(false);

  await ReactTestRenderer.act(() => {
    cta().props.onPress();
  });
  expect(onVerified).toHaveBeenCalledTimes(1);
});

test('otp backspace clears the digit before an empty box', async () => {
  const tree = await render(<OtpVerificationScreen />);
  const boxes = () => tree.root.findByType(OtpInput).findAllByType(TextInput);

  await ReactTestRenderer.act(() => {
    boxes()[0].props.onChangeText('12');
  });
  expect(boxes().map(box => box.props.value).join('')).toBe('12');

  // Box 3 is empty, so the backspace reaches back and clears box 2.
  await ReactTestRenderer.act(() => {
    boxes()[2].props.onKeyPress({ nativeEvent: { key: 'Backspace' } });
  });
  expect(boxes().map(box => box.props.value).join('')).toBe('1');
});
