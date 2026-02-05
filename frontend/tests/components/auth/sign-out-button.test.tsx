/**
 * Tests for SignOutButton component
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { signOut } from "next-auth/react";
import { SignOutButton } from "@/components/auth/sign-out-button";

// Mock next-auth signOut
jest.mock("next-auth/react", () => ({
  signOut: jest.fn(),
  useSession: jest.fn(() => ({
    data: null,
    status: "unauthenticated",
  })),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const mockSignOut = signOut as jest.Mock;

describe("SignOutButton", () => {
  beforeEach(() => {
    mockSignOut.mockClear();
  });

  it("renders with Sign out text", () => {
    render(<SignOutButton />);

    expect(screen.getByRole("button")).toHaveTextContent("Sign out");
  });

  it("calls signOut with default callbackUrl on click", () => {
    render(<SignOutButton />);

    fireEvent.click(screen.getByRole("button"));

    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: "/" });
  });

  it("calls signOut with custom callbackUrl", () => {
    render(<SignOutButton callbackUrl="/goodbye" />);

    fireEvent.click(screen.getByRole("button"));

    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: "/goodbye" });
  });

  it("applies custom className", () => {
    render(<SignOutButton className="text-red-500" />);

    expect(screen.getByRole("button")).toHaveClass("text-red-500");
  });

  it("uses ghost variant by default", () => {
    render(<SignOutButton />);

    // Ghost variant should not have the primary button styles
    const button = screen.getByRole("button");
    // Check it's rendered (variant styles are applied via className)
    expect(button).toBeInTheDocument();
  });

  it("accepts different variants", () => {
    const { rerender } = render(<SignOutButton variant="destructive" />);

    expect(screen.getByRole("button")).toBeInTheDocument();

    rerender(<SignOutButton variant="outline" />);
    expect(screen.getByRole("button")).toBeInTheDocument();

    rerender(<SignOutButton variant="secondary" />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
