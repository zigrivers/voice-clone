/**
 * Test utilities for React Testing Library
 */

import React, { ReactElement } from "react";
import { render, RenderOptions, RenderResult } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

// Default mock session for authenticated tests
export const mockSession: Session = {
  user: {
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    image: "https://example.com/avatar.jpg",
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// Create a fresh QueryClient for each test
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// Provider wrapper options
interface WrapperOptions {
  session?: Session | null;
  queryClient?: QueryClient;
}

// Create wrapper with all providers
function createWrapper(options: WrapperOptions = {}) {
  const { session = mockSession, queryClient = createTestQueryClient() } = options;

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <SessionProvider session={session}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </SessionProvider>
    );
  };
}

// Custom render options
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  session?: Session | null;
  queryClient?: QueryClient;
}

// Custom render with providers
function customRender(
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult & { queryClient: QueryClient } {
  const { session, queryClient = createTestQueryClient(), ...renderOptions } = options;
  const wrapper = createWrapper({ session, queryClient });

  return {
    ...render(ui, { wrapper, ...renderOptions }),
    queryClient,
  };
}

// Render for unauthenticated state
function renderUnauthenticated(
  ui: ReactElement,
  options: Omit<CustomRenderOptions, "session"> = {}
): RenderResult & { queryClient: QueryClient } {
  return customRender(ui, { ...options, session: null });
}

// Wait for query to settle (loading -> success/error)
async function waitForQueryToSettle(queryClient: QueryClient): Promise<void> {
  // Wait for all queries to be in a settled state
  await new Promise<void>((resolve) => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.type === "updated") {
        const queries = queryClient.getQueryCache().findAll();
        const allSettled = queries.every(
          (query) => query.state.status !== "pending"
        );
        if (allSettled) {
          unsubscribe();
          resolve();
        }
      }
    });

    // Also check immediately in case queries are already settled
    const queries = queryClient.getQueryCache().findAll();
    const allSettled =
      queries.length === 0 ||
      queries.every((query) => query.state.status !== "pending");
    if (allSettled) {
      unsubscribe();
      resolve();
    }
  });
}

// Re-export everything from testing library
export * from "@testing-library/react";

// Export custom render as default
export { customRender as render, renderUnauthenticated, waitForQueryToSettle };
