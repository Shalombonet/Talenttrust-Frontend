import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { vi } from 'vitest';
import OfflineIndicatorDefault, { OfflineIndicator } from '../OfflineIndicator';
import * as useOnlineStatusModule from '@/hooks/useOnlineStatus';

vi.mock('@/hooks/useOnlineStatus');

const mockedUseOnlineStatus = vi.mocked(useOnlineStatusModule.useOnlineStatus);

describe('OfflineIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering behavior', () => {
    it('renders nothing when user is online and data is not stale', () => {
      mockedUseOnlineStatus.mockReturnValue(true);

      const { container } = render(<OfflineIndicator />);
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing via default export when user is online with default props', () => {
      mockedUseOnlineStatus.mockReturnValue(true);

      const { container } = render(<OfflineIndicatorDefault />);
      expect(container.firstChild).toBeNull();
    });

    it('renders offline status via default export when user is offline', () => {
      mockedUseOnlineStatus.mockReturnValue(false);

      render(<OfflineIndicatorDefault />);

      const statusEl = screen.getByRole('status');
      expect(statusEl).toBeInTheDocument();
      expect(statusEl).toHaveAttribute('aria-live', 'polite');
      expect(statusEl).toHaveAttribute('aria-label', 'You are offline');
      expect(
        screen.getByText('You are offline. Showing previously loaded data.'),
      ).toBeInTheDocument();
    });

    it('renders offline message when user is offline', () => {
      mockedUseOnlineStatus.mockReturnValue(false);

      render(<OfflineIndicator />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(
        screen.getByText('You are offline. Showing previously loaded data.'),
      ).toBeInTheDocument();
    });

  });

  describe('accessibility (a11y)', () => {
    it('has role="status" and aria-live="polite"', () => {
      mockedUseOnlineStatus.mockReturnValue(false);

      render(<OfflineIndicator />);

      const statusEl = screen.getByRole('status');
      expect(statusEl).toHaveAttribute('aria-live', 'polite');
      expect(statusEl).toHaveAttribute('aria-label', 'You are offline');
    });

    it('passes axe accessibility audit when offline', async () => {
      mockedUseOnlineStatus.mockReturnValue(false);

      const { container } = render(
        <main>
          <h1>Contract Title</h1>
          <OfflineIndicator />
        </main>,
      );

      const results = await axe(container);
      expect(results.violations).toHaveLength(0);
    });
  });
});
