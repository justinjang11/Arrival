import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "@/app/page";

describe("Home page smoke test", () => {
  it("renders the Arrival heading", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { name: /arrival/i })
    ).toBeInTheDocument();
  });

  it("shows the private beta notice", () => {
    render(<Home />);
    expect(screen.getByText(/private beta/i)).toBeInTheDocument();
  });
});
