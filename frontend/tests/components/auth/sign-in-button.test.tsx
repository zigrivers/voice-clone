/**
 * Tests for SignInButton components
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { signIn } from "next-auth/react";
import {
  SignInButton,
  GoogleSignInButton,
  GitHubSignInButton,
} from "@/components/auth/sign-in-button";

// Mock next-auth signIn
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
  useSession: jest.fn(() => ({
    data: null,
    status: "unauthenticated",
  })),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const mockSignIn = signIn as jest.Mock;

describe("SignInButton", () => {
  beforeEach(() => {
    mockSignIn.mockClear();
  });

  it("renders with default text when no provider specified", () => {
    render(<SignInButton />);

    expect(screen.getByRole("button")).toHaveTextContent("Sign in");
  });

  it("renders with provider name when provider is specified", () => {
    render(<SignInButton provider="google" />);

    expect(screen.getByRole("button")).toHaveTextContent("Sign in with google");
  });

  it("calls signIn with provider and default callbackUrl on click", () => {
    render(<SignInButton provider="google" />);

    fireEvent.click(screen.getByRole("button"));

    expect(mockSignIn).toHaveBeenCalledWith("google", { callbackUrl: "/" });
  });

  it("calls signIn with custom callbackUrl", () => {
    render(<SignInButton provider="github" callbackUrl="/dashboard" />);

    fireEvent.click(screen.getByRole("button"));

    expect(mockSignIn).toHaveBeenCalledWith("github", {
      callbackUrl: "/dashboard",
    });
  });

  it("applies custom className", () => {
    render(<SignInButton className="custom-class" />);

    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });
});

describe("GoogleSignInButton", () => {
  beforeEach(() => {
    mockSignIn.mockClear();
  });

  it("renders with Google branding", () => {
    render(<GoogleSignInButton />);

    expect(screen.getByRole("button")).toHaveTextContent("Continue with Google");
  });

  it("renders Google icon", () => {
    render(<GoogleSignInButton />);

    const svg = screen.getByRole("button").querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("calls signIn with google provider on click", () => {
    render(<GoogleSignInButton />);

    fireEvent.click(screen.getByRole("button"));

    expect(mockSignIn).toHaveBeenCalledWith("google", { callbackUrl: "/" });
  });

  it("uses custom callbackUrl", () => {
    render(<GoogleSignInButton callbackUrl="/onboarding" />);

    fireEvent.click(screen.getByRole("button"));

    expect(mockSignIn).toHaveBeenCalledWith("google", {
      callbackUrl: "/onboarding",
    });
  });

  it("applies custom className", () => {
    render(<GoogleSignInButton className="w-full" />);

    expect(screen.getByRole("button")).toHaveClass("w-full");
  });
});

describe("GitHubSignInButton", () => {
  beforeEach(() => {
    mockSignIn.mockClear();
  });

  it("renders with GitHub branding", () => {
    render(<GitHubSignInButton />);

    expect(screen.getByRole("button")).toHaveTextContent("Continue with GitHub");
  });

  it("renders GitHub icon", () => {
    render(<GitHubSignInButton />);

    const svg = screen.getByRole("button").querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("calls signIn with github provider on click", () => {
    render(<GitHubSignInButton />);

    fireEvent.click(screen.getByRole("button"));

    expect(mockSignIn).toHaveBeenCalledWith("github", { callbackUrl: "/" });
  });

  it("uses custom callbackUrl", () => {
    render(<GitHubSignInButton callbackUrl="/settings" />);

    fireEvent.click(screen.getByRole("button"));

    expect(mockSignIn).toHaveBeenCalledWith("github", {
      callbackUrl: "/settings",
    });
  });

  it("applies custom className", () => {
    render(<GitHubSignInButton className="mt-4" />);

    expect(screen.getByRole("button")).toHaveClass("mt-4");
  });
});
