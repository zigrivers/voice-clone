import "@testing-library/jest-dom";

// Polyfill fetch globals for JSDOM environment (needed by MSW 2.x)
import { TextEncoder, TextDecoder } from "util";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Note: MSW server setup is handled by individual test files that need it
// because Jest's JSDOM environment doesn't have native fetch APIs.
// For tests requiring API mocking, create a jest.setup.node.js file
// or use setupMswServer() helper from tests/utils/test-utils.tsx

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  usePathname() {
    return "";
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        image: "https://example.com/avatar.jpg",
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    status: "authenticated",
  })),
  SessionProvider: ({ children }) => children,
  signIn: jest.fn(),
  signOut: jest.fn(),
}));
