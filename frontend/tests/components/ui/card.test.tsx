/**
 * Tests for Card components
 */

import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

describe("Card", () => {
  it("renders children correctly", () => {
    render(<Card>Card Content</Card>);

    expect(screen.getByText("Card Content")).toBeInTheDocument();
  });

  it("applies default styles", () => {
    render(<Card data-testid="card">Content</Card>);

    const card = screen.getByTestId("card");
    expect(card).toHaveClass("rounded-lg");
    expect(card).toHaveClass("border");
    expect(card).toHaveClass("shadow-sm");
  });

  it("applies custom className", () => {
    render(
      <Card className="custom-class" data-testid="card">
        Content
      </Card>
    );

    expect(screen.getByTestId("card")).toHaveClass("custom-class");
  });

  it("forwards ref correctly", () => {
    const ref = { current: null };
    render(<Card ref={ref}>Content</Card>);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("passes through additional props", () => {
    render(
      <Card data-testid="card" aria-label="Test Card">
        Content
      </Card>
    );

    expect(screen.getByTestId("card")).toHaveAttribute("aria-label", "Test Card");
  });
});

describe("CardHeader", () => {
  it("renders children correctly", () => {
    render(<CardHeader>Header Content</CardHeader>);

    expect(screen.getByText("Header Content")).toBeInTheDocument();
  });

  it("applies default styles", () => {
    render(<CardHeader data-testid="header">Content</CardHeader>);

    const header = screen.getByTestId("header");
    expect(header).toHaveClass("flex");
    expect(header).toHaveClass("flex-col");
    expect(header).toHaveClass("p-6");
  });

  it("applies custom className", () => {
    render(
      <CardHeader className="bg-blue-500" data-testid="header">
        Content
      </CardHeader>
    );

    expect(screen.getByTestId("header")).toHaveClass("bg-blue-500");
  });
});

describe("CardTitle", () => {
  it("renders as h3 element", () => {
    render(<CardTitle>Title</CardTitle>);

    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Title");
  });

  it("applies default styles", () => {
    render(<CardTitle data-testid="title">Title</CardTitle>);

    const title = screen.getByTestId("title");
    expect(title).toHaveClass("text-2xl");
    expect(title).toHaveClass("font-semibold");
  });

  it("applies custom className", () => {
    render(
      <CardTitle className="text-red-500" data-testid="title">
        Title
      </CardTitle>
    );

    expect(screen.getByTestId("title")).toHaveClass("text-red-500");
  });
});

describe("CardDescription", () => {
  it("renders as p element", () => {
    render(<CardDescription>Description text</CardDescription>);

    expect(screen.getByText("Description text").tagName).toBe("P");
  });

  it("applies default styles", () => {
    render(
      <CardDescription data-testid="desc">Description</CardDescription>
    );

    const desc = screen.getByTestId("desc");
    expect(desc).toHaveClass("text-sm");
    expect(desc).toHaveClass("text-muted-foreground");
  });

  it("applies custom className", () => {
    render(
      <CardDescription className="italic" data-testid="desc">
        Description
      </CardDescription>
    );

    expect(screen.getByTestId("desc")).toHaveClass("italic");
  });
});

describe("CardContent", () => {
  it("renders children correctly", () => {
    render(<CardContent>Main content here</CardContent>);

    expect(screen.getByText("Main content here")).toBeInTheDocument();
  });

  it("applies default styles", () => {
    render(<CardContent data-testid="content">Content</CardContent>);

    const content = screen.getByTestId("content");
    expect(content).toHaveClass("p-6");
    expect(content).toHaveClass("pt-0");
  });

  it("applies custom className", () => {
    render(
      <CardContent className="bg-gray-100" data-testid="content">
        Content
      </CardContent>
    );

    expect(screen.getByTestId("content")).toHaveClass("bg-gray-100");
  });
});

describe("CardFooter", () => {
  it("renders children correctly", () => {
    render(<CardFooter>Footer content</CardFooter>);

    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });

  it("applies default styles", () => {
    render(<CardFooter data-testid="footer">Footer</CardFooter>);

    const footer = screen.getByTestId("footer");
    expect(footer).toHaveClass("flex");
    expect(footer).toHaveClass("items-center");
    expect(footer).toHaveClass("p-6");
    expect(footer).toHaveClass("pt-0");
  });

  it("applies custom className", () => {
    render(
      <CardFooter className="justify-between" data-testid="footer">
        Footer
      </CardFooter>
    );

    expect(screen.getByTestId("footer")).toHaveClass("justify-between");
  });
});

describe("Card composition", () => {
  it("renders a complete card with all subcomponents", () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description text</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Main content</p>
        </CardContent>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByText("Card Title")).toBeInTheDocument();
    expect(screen.getByText("Card description text")).toBeInTheDocument();
    expect(screen.getByText("Main content")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
  });
});
