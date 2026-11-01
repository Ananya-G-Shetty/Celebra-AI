import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Footer from '@/components/Footer';
import ApiKeyModal from '@/components/ApiKeyModal';
import { EventProvider } from '@/components/EventContext';

// Mock useRouter and usePathname from next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => '/dashboard',
}));

beforeAll(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [] }),
    })
  ) as any;
});

describe('Frontend Component Tests', () => {
  describe('Footer Component', () => {
    test('renders brand name, tagline, and cultural metadata', () => {
      render(<Footer />);

      expect(screen.getByText('CELEBRA AI')).toBeInTheDocument();
      expect(screen.getByText(/"Every celebration deserves a perfect plan\."/i)).toBeInTheDocument();
      expect(screen.getByText(/INR \(₹\) Native/i)).toBeInTheDocument();
      expect(screen.getByText(/Google Build with AI/i)).toBeInTheDocument();
    });

    test('renders platform navigation links', () => {
      render(<Footer />);

      expect(screen.getByText(/4-Step Event Wizard/i)).toBeInTheDocument();
      expect(screen.getByText(/Planning Dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/Smart Budget & Optimizer/i)).toBeInTheDocument();
      expect(screen.getByText(/Emergency Scenario Planner/i)).toBeInTheDocument();
    });
  });

  describe('ApiKeyModal Component', () => {
    test('does not render when isOpen is false', async () => {
      let container: any;
      await act(async () => {
        const res = render(
          <EventProvider>
            <ApiKeyModal isOpen={false} onClose={jest.fn()} />
          </EventProvider>
        );
        container = res.container;
      });
      expect(container.firstChild).toBeNull();
    });

    test('renders modal content and handles close action when isOpen is true', async () => {
      const handleClose = jest.fn();
      await act(async () => {
        render(
          <EventProvider>
            <ApiKeyModal isOpen={true} onClose={handleClose} />
          </EventProvider>
        );
      });

      expect(screen.getByText('Gemini Engine Settings')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/AIzaSy.../i)).toBeInTheDocument();

      const closeButton = screen.getByLabelText(/close modal/i);
      fireEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    test('allows user to type API key and switch back to cultural engine', async () => {
      await act(async () => {
        render(
          <EventProvider>
            <ApiKeyModal isOpen={true} onClose={jest.fn()} />
          </EventProvider>
        );
      });

      const input = screen.getByPlaceholderText(/AIzaSy.../i);
      fireEvent.change(input, { target: { value: 'AIzaSyTestMockKey123' } });
      expect((input as HTMLInputElement).value).toBe('AIzaSyTestMockKey123');

      const clearButton = screen.getByText(/Reset to Local Engine/i);
      fireEvent.click(clearButton);
      expect(screen.getByText(/Switched to Celebra AI Local Cultural Engine/i)).toBeInTheDocument();
    });
  });
});
