/**
 * Tests for Input component
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "@/components/ui/input";

describe("Input", () => {
  it("renders as an input element", () => {
    render(<Input placeholder="Enter text" />);

    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter text").tagName).toBe("INPUT");
  });

  it("handles text input", () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Hello" } });

    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue("Hello");
  });

  it("uses text type by default", () => {
    render(<Input data-testid="input" />);

    // Input without explicit type attribute uses 'text' implicitly
    expect(screen.getByTestId("input")).not.toHaveAttribute("type", "number");
  });

  it("accepts different input types", () => {
    const { rerender } = render(<Input type="email" data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveAttribute("type", "email");

    rerender(<Input type="password" data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveAttribute("type", "password");

    rerender(<Input type="number" data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveAttribute("type", "number");
  });

  it("applies default styles", () => {
    render(<Input data-testid="input" />);

    const input = screen.getByTestId("input");
    expect(input).toHaveClass("flex");
    expect(input).toHaveClass("h-10");
    expect(input).toHaveClass("w-full");
    expect(input).toHaveClass("rounded-md");
    expect(input).toHaveClass("border");
  });

  it("applies custom className", () => {
    render(<Input className="custom-input" data-testid="input" />);

    expect(screen.getByTestId("input")).toHaveClass("custom-input");
  });

  it("can be disabled", () => {
    render(<Input disabled data-testid="input" />);

    const input = screen.getByTestId("input");
    expect(input).toBeDisabled();
    expect(input).toHaveClass("disabled:cursor-not-allowed");
    expect(input).toHaveClass("disabled:opacity-50");
  });

  it("forwards ref correctly", () => {
    const ref = { current: null };
    render(<Input ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("handles value prop (controlled)", () => {
    const handleChange = jest.fn();
    render(<Input value="controlled value" onChange={handleChange} />);

    expect(screen.getByRole("textbox")).toHaveValue("controlled value");
  });

  it("handles defaultValue prop (uncontrolled)", () => {
    render(<Input defaultValue="default value" />);

    expect(screen.getByRole("textbox")).toHaveValue("default value");
  });

  it("accepts placeholder attribute", () => {
    render(<Input placeholder="Type here..." />);

    expect(screen.getByPlaceholderText("Type here...")).toBeInTheDocument();
  });

  it("passes through additional attributes", () => {
    render(
      <Input
        data-testid="input"
        aria-label="Test input"
        maxLength={10}
        required
      />
    );

    const input = screen.getByTestId("input");
    expect(input).toHaveAttribute("aria-label", "Test input");
    expect(input).toHaveAttribute("maxLength", "10");
    expect(input).toBeRequired();
  });

  it("handles focus and blur events", () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();

    render(<Input onFocus={handleFocus} onBlur={handleBlur} />);

    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);

    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });
});
