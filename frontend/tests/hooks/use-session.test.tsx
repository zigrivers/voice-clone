/**
 * Tests for useSession hook
 */

import { renderHook } from "@testing-library/react";
import { useSession as useNextAuthSession } from "next-auth/react";
import { useSession, useRequireAuth } from "@/hooks/use-session";

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const mockUseSession = useNextAuthSession as jest.Mock;

describe("useSession", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("when authenticated", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
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
        update: jest.fn(),
      });
    });

    it("returns session data", () => {
      const { result } = renderHook(() => useSession());

      expect(result.current.session).toBeDefined();
      expect(result.current.session?.user.email).toBe("test@example.com");
    });

    it("returns user data", () => {
      const { result } = renderHook(() => useSession());

      expect(result.current.user).toBeDefined();
      expect(result.current.user?.name).toBe("Test User");
    });

    it("isAuthenticated is true", () => {
      const { result } = renderHook(() => useSession());

      expect(result.current.isAuthenticated).toBe(true);
    });

    it("isLoading is false", () => {
      const { result } = renderHook(() => useSession());

      expect(result.current.isLoading).toBe(false);
    });

    it("isUnauthenticated is false", () => {
      const { result } = renderHook(() => useSession());

      expect(result.current.isUnauthenticated).toBe(false);
    });

    it("provides update function", () => {
      const { result } = renderHook(() => useSession());

      expect(result.current.update).toBeDefined();
      expect(typeof result.current.update).toBe("function");
    });
  });

  describe("when loading", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "loading",
        update: jest.fn(),
      });
    });

    it("session is null", () => {
      const { result } = renderHook(() => useSession());

      expect(result.current.session).toBeNull();
    });

    it("user is undefined", () => {
      const { result } = renderHook(() => useSession());

      expect(result.current.user).toBeUndefined();
    });

    it("isLoading is true", () => {
      const { result } = renderHook(() => useSession());

      expect(result.current.isLoading).toBe(true);
    });

    it("isAuthenticated is false", () => {
      const { result } = renderHook(() => useSession());

      expect(result.current.isAuthenticated).toBe(false);
    });

    it("isUnauthenticated is false", () => {
      const { result } = renderHook(() => useSession());

      expect(result.current.isUnauthenticated).toBe(false);
    });
  });

  describe("when unauthenticated", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
        update: jest.fn(),
      });
    });

    it("session is null", () => {
      const { result } = renderHook(() => useSession());

      expect(result.current.session).toBeNull();
    });

    it("user is undefined", () => {
      const { result } = renderHook(() => useSession());

      expect(result.current.user).toBeUndefined();
    });

    it("isUnauthenticated is true", () => {
      const { result } = renderHook(() => useSession());

      expect(result.current.isUnauthenticated).toBe(true);
    });

    it("isAuthenticated is false", () => {
      const { result } = renderHook(() => useSession());

      expect(result.current.isAuthenticated).toBe(false);
    });

    it("isLoading is false", () => {
      const { result } = renderHook(() => useSession());

      expect(result.current.isLoading).toBe(false);
    });
  });
});

describe("useRequireAuth", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("when authenticated", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: "user-123",
            email: "test@example.com",
            name: "Test User",
          },
        },
        status: "authenticated",
        update: jest.fn(),
      });
    });

    it("requireAuth is false", () => {
      const { result } = renderHook(() => useRequireAuth());

      expect(result.current.requireAuth).toBe(false);
    });

    it("returns user data", () => {
      const { result } = renderHook(() => useRequireAuth());

      expect(result.current.user?.name).toBe("Test User");
    });
  });

  describe("when loading", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "loading",
        update: jest.fn(),
      });
    });

    it("requireAuth is false (waiting for auth check)", () => {
      const { result } = renderHook(() => useRequireAuth());

      expect(result.current.requireAuth).toBe(false);
    });

    it("isLoading is true", () => {
      const { result } = renderHook(() => useRequireAuth());

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe("when unauthenticated", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
        update: jest.fn(),
      });
    });

    it("requireAuth is true", () => {
      const { result } = renderHook(() => useRequireAuth());

      expect(result.current.requireAuth).toBe(true);
    });

    it("isUnauthenticated is true", () => {
      const { result } = renderHook(() => useRequireAuth());

      expect(result.current.isUnauthenticated).toBe(true);
    });

    it("user is undefined", () => {
      const { result } = renderHook(() => useRequireAuth());

      expect(result.current.user).toBeUndefined();
    });
  });
});
