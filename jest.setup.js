// Optional: configure or set up a testing framework before each test.
require('@testing-library/jest-dom');

// Polyfill web standards in JSDOM environment from Node globalThis
if (typeof global.Request === 'undefined' && typeof globalThis.Request !== 'undefined') {
  global.Request = globalThis.Request;
  global.Response = globalThis.Response;
  global.Headers = globalThis.Headers;
  global.FormData = globalThis.FormData;
  global.fetch = globalThis.fetch;
}

// Mock window.matchMedia if needed in jsdom
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

