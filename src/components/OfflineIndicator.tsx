'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div role="status" aria-live="polite" aria-label="You are offline" className="offline-indicator">
      <span>You are offline. Showing previously loaded data.</span>
    </div>
  );
}

export default OfflineIndicator;
