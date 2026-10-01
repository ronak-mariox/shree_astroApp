import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { AppDialog, dialogBridge, type DialogRequest } from './AppDialog';

type DialogContextValue = {
  /** Opens a message; one already showing is replaced — the newer message is the one that matters. */
  show: (request: DialogRequest) => void;
  dismiss: () => void;
  /**
   * True while the open dialog is a question still waiting on its answer —
   * more than one action (a confirm, the photo-source chooser), one that may
   * not be tapped away, or one whose caller is awaiting `onDismiss`. A passing
   * message (a push that arrived with the app open) must not replace that:
   * the question would vanish unanswered.
   */
  isAnswerPending: () => boolean;
};

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

type AppDialogProviderProps = {
  children: React.ReactNode;
};

/**
 * One dialog for the whole app, opened from any screen under it.
 *
 * `Alert.alert` needed no state because the OS owned the window; the app's own
 * dialog does, and this keeps it in one place rather than one `<AppDialog>`
 * per screen. The dialog is drawn last, so it sits over whichever screen is
 * showing. Mounted once in App.tsx; `useDialog()` is the way in:
 *
 *   const dialog = useDialog();
 *   dialog.show({ title: 'Request sent', message, tone: 'success' });
 *
 * It also registers the imperative bridge (`showDialog` in AppDialog.tsx) for
 * code with no React tree of its own, such as the file picker service.
 */
export function AppDialogProvider({ children }: AppDialogProviderProps) {
  const [request, setRequest] = useState<DialogRequest>();
  /** The request on screen, for `show` to tell the one it is replacing. */
  const current = useRef<DialogRequest>(undefined);

  const show = useCallback((next: DialogRequest) => {
    const replaced = current.current;
    current.current = next;
    setRequest(next);
    /** Whoever was waiting on the old one is not going to get an answer now. */
    replaced?.onDismiss?.();
  }, []);

  const dismiss = useCallback(() => {
    current.current = undefined;
    setRequest(undefined);
  }, []);

  useEffect(() => dialogBridge.register(show), [show]);

  /** Reads the ref, not the state, so it is stable and correct between renders. */
  const isAnswerPending = useCallback(() => {
    const open = current.current;
    if (!open) {
      return false;
    }
    return (open.actions?.length ?? 0) > 1 || open.dismissable === false || Boolean(open.onDismiss);
  }, []);

  const value = useMemo(() => ({ show, dismiss, isAnswerPending }), [show, dismiss, isAnswerPending]);

  return (
    <DialogContext.Provider value={value}>
      {children}
      <AppDialog request={request} onDismiss={dismiss} />
    </DialogContext.Provider>
  );
}

/**
 * The app dialog from any screen. `show` and `dismiss` never change, so an
 * effect that raises a message can depend on `dialog.show` safely.
 */
export function useDialog(): DialogContextValue {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog() needs an <AppDialogProvider> above it.');
  }
  return context;
}
