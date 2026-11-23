'use client';

import { useEffect } from 'react';
import { reportError } from '@/lib/errorReporter';

export function GlobalErrorHandlers() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      reportError(event.error ?? event.message, { source: 'window-error', filename: event.filename });
    };
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      reportError(event.reason, { source: 'unhandled-rejection' });
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  return null;
}
