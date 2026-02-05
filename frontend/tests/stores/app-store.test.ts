/**
 * Tests for Zustand app store
 */

import { act } from "@testing-library/react";
import { useAppStore } from "@/stores/app-store";

describe("useAppStore", () => {
  // Reset store state before each test
  beforeEach(() => {
    const { getState, setState } = useAppStore;
    setState({
      sidebarOpen: true,
      activeModal: null,
      modalData: null,
      globalLoading: false,
    });
  });

  describe("initial state", () => {
    it("has sidebarOpen true by default", () => {
      const { sidebarOpen } = useAppStore.getState();
      expect(sidebarOpen).toBe(true);
    });

    it("has activeModal null by default", () => {
      const { activeModal } = useAppStore.getState();
      expect(activeModal).toBeNull();
    });

    it("has modalData null by default", () => {
      const { modalData } = useAppStore.getState();
      expect(modalData).toBeNull();
    });

    it("has globalLoading false by default", () => {
      const { globalLoading } = useAppStore.getState();
      expect(globalLoading).toBe(false);
    });
  });

  describe("sidebar actions", () => {
    it("toggleSidebar toggles sidebarOpen", () => {
      const { toggleSidebar } = useAppStore.getState();

      act(() => {
        toggleSidebar();
      });

      expect(useAppStore.getState().sidebarOpen).toBe(false);

      act(() => {
        toggleSidebar();
      });

      expect(useAppStore.getState().sidebarOpen).toBe(true);
    });

    it("setSidebarOpen sets value directly", () => {
      const { setSidebarOpen } = useAppStore.getState();

      act(() => {
        setSidebarOpen(false);
      });

      expect(useAppStore.getState().sidebarOpen).toBe(false);

      act(() => {
        setSidebarOpen(true);
      });

      expect(useAppStore.getState().sidebarOpen).toBe(true);
    });
  });

  describe("modal actions", () => {
    it("openModal sets activeModal and modalData", () => {
      const { openModal } = useAppStore.getState();
      const modalData = { id: "123", name: "Test" };

      act(() => {
        openModal("confirmDelete", modalData);
      });

      const state = useAppStore.getState();
      expect(state.activeModal).toBe("confirmDelete");
      expect(state.modalData).toEqual(modalData);
    });

    it("openModal works without modalData", () => {
      const { openModal } = useAppStore.getState();

      act(() => {
        openModal("settings");
      });

      const state = useAppStore.getState();
      expect(state.activeModal).toBe("settings");
      expect(state.modalData).toEqual({});
    });

    it("closeModal clears modal state", () => {
      const { openModal, closeModal } = useAppStore.getState();

      act(() => {
        openModal("test", { data: "value" });
      });

      expect(useAppStore.getState().activeModal).toBe("test");

      act(() => {
        closeModal();
      });

      const state = useAppStore.getState();
      expect(state.activeModal).toBeNull();
      expect(state.modalData).toBeNull();
    });
  });

  describe("loading actions", () => {
    it("setGlobalLoading sets loading state to true", () => {
      const { setGlobalLoading } = useAppStore.getState();

      act(() => {
        setGlobalLoading(true);
      });

      expect(useAppStore.getState().globalLoading).toBe(true);
    });

    it("setGlobalLoading sets loading state to false", () => {
      const { setGlobalLoading } = useAppStore.getState();

      act(() => {
        setGlobalLoading(true);
      });

      act(() => {
        setGlobalLoading(false);
      });

      expect(useAppStore.getState().globalLoading).toBe(false);
    });
  });
});
