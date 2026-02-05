/**
 * Tests for useToast hook
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { useToast, toast, reducer } from "@/hooks/use-toast";

// Helper to reset toast state between tests
// Since toast uses module-level state, we need to manually dispatch REMOVE_TOAST
function clearAllToasts() {
  const { result } = renderHook(() => useToast());
  // Dismiss all and then wait for removal
  act(() => {
    result.current.dismiss();
  });
  // Fast forward removal timers
  act(() => {
    jest.advanceTimersByTime(10000);
  });
}

describe("useToast", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Clear any toasts from previous tests
    clearAllToasts();
  });

  afterEach(() => {
    // Clean up any remaining toasts
    clearAllToasts();
    jest.useRealTimers();
  });

  describe("toast function", () => {
    it("adds a toast to state", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        toast({ title: "Test Toast", description: "Test description" });
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].title).toBe("Test Toast");
      expect(result.current.toasts[0].description).toBe("Test description");
    });

    it("uses default variant when not specified", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        toast({ title: "Default Toast" });
      });

      expect(result.current.toasts[0].variant).toBe("default");
    });

    it("accepts destructive variant", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        toast({ title: "Error", variant: "destructive" });
      });

      expect(result.current.toasts[0].variant).toBe("destructive");
    });

    it("accepts success variant", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        toast({ title: "Success!", variant: "success" });
      });

      expect(result.current.toasts[0].variant).toBe("success");
    });

    it("returns dismiss function", () => {
      const { result } = renderHook(() => useToast());

      let toastResult: ReturnType<typeof toast>;
      act(() => {
        toastResult = toast({ title: "Dismissable" });
      });

      expect(toastResult!.dismiss).toBeDefined();
      expect(typeof toastResult!.dismiss).toBe("function");
    });

    it("returns update function", () => {
      const { result } = renderHook(() => useToast());

      let toastResult: ReturnType<typeof toast>;
      act(() => {
        toastResult = toast({ title: "Updatable" });
      });

      expect(toastResult!.update).toBeDefined();
      expect(typeof toastResult!.update).toBe("function");
    });

    it("auto-dismisses when duration is set", async () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        toast({ title: "Auto Dismiss", duration: 1000 });
      });

      expect(result.current.toasts).toHaveLength(1);

      // Advance timer
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // After dismiss is called, the toast should be marked for removal
      // It will be removed after TOAST_REMOVE_DELAY (5000ms)
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(result.current.toasts).toHaveLength(0);
      });
    });
  });

  describe("dismiss function", () => {
    it("dismisses a specific toast by id", async () => {
      const { result } = renderHook(() => useToast());

      let toastId: string;
      act(() => {
        const t = toast({ title: "To Dismiss" });
        toastId = t.id;
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        result.current.dismiss(toastId);
      });

      // Advance removal timer
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(result.current.toasts).toHaveLength(0);
      });
    });

    it("dismisses all toasts when no id provided", async () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        toast({ title: "Toast 1" });
        toast({ title: "Toast 2" });
      });

      expect(result.current.toasts).toHaveLength(2);

      act(() => {
        result.current.dismiss();
      });

      // Advance removal timer
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(result.current.toasts).toHaveLength(0);
      });
    });
  });

  describe("toast limit", () => {
    it("respects TOAST_LIMIT of 3", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        toast({ title: "Toast 1" });
        toast({ title: "Toast 2" });
        toast({ title: "Toast 3" });
        toast({ title: "Toast 4" });
        toast({ title: "Toast 5" });
      });

      expect(result.current.toasts).toHaveLength(3);
      // Most recent toasts should be kept (LIFO)
      expect(result.current.toasts[0].title).toBe("Toast 5");
      expect(result.current.toasts[1].title).toBe("Toast 4");
      expect(result.current.toasts[2].title).toBe("Toast 3");
    });
  });

  describe("update function", () => {
    it("updates existing toast", () => {
      const { result } = renderHook(() => useToast());

      let toastResult: ReturnType<typeof toast>;
      act(() => {
        toastResult = toast({ title: "Original" });
      });

      expect(result.current.toasts[0].title).toBe("Original");

      act(() => {
        toastResult!.update({ title: "Updated", description: "New description" });
      });

      expect(result.current.toasts[0].title).toBe("Updated");
      expect(result.current.toasts[0].description).toBe("New description");
    });
  });
});

describe("reducer", () => {
  const initialState = { toasts: [] };

  it("handles ADD_TOAST action", () => {
    const newToast = {
      id: "1",
      title: "Test",
      variant: "default" as const,
    };

    const result = reducer(initialState, {
      type: "ADD_TOAST",
      toast: newToast,
    });

    expect(result.toasts).toHaveLength(1);
    expect(result.toasts[0]).toEqual(newToast);
  });

  it("handles UPDATE_TOAST action", () => {
    const state = {
      toasts: [{ id: "1", title: "Original", variant: "default" as const }],
    };

    const result = reducer(state, {
      type: "UPDATE_TOAST",
      toast: { id: "1", title: "Updated" },
    });

    expect(result.toasts[0].title).toBe("Updated");
    expect(result.toasts[0].id).toBe("1");
  });

  it("handles REMOVE_TOAST action with specific id", () => {
    const state = {
      toasts: [
        { id: "1", title: "First", variant: "default" as const },
        { id: "2", title: "Second", variant: "default" as const },
      ],
    };

    const result = reducer(state, {
      type: "REMOVE_TOAST",
      toastId: "1",
    });

    expect(result.toasts).toHaveLength(1);
    expect(result.toasts[0].id).toBe("2");
  });

  it("handles REMOVE_TOAST action without id (removes all)", () => {
    const state = {
      toasts: [
        { id: "1", title: "First", variant: "default" as const },
        { id: "2", title: "Second", variant: "default" as const },
      ],
    };

    const result = reducer(state, {
      type: "REMOVE_TOAST",
      toastId: undefined,
    });

    expect(result.toasts).toHaveLength(0);
  });
});
