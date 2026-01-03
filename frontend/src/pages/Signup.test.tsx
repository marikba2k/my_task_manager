import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Signup from "./Signup";
import * as authModule from "../lib/auth";

// Mock the auth module
vi.mock("../lib/auth", () => ({
  auth: {
    signup: vi.fn(),
    login: vi.fn(),
  },
}));

describe("Signup error rendering", () => {
  const mockOnSignup = vi.fn();
  const mockOnSwitchToLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders error message when signup fails with structured axios error", async () => {
    const user = userEvent.setup();

    // Mock auth.signup to throw an axios-like error
    const axiosError = {
      response: {
        data: {
          username: ["A user with that username already exists."],
          email: ["A user with that email already exists."],
        },
      },
    };

    vi.mocked(authModule.auth.signup).mockRejectedValue(axiosError);

    render(
      <Signup onSignup={mockOnSignup} onSwitchToLogin={mockOnSwitchToLogin} />
    );

    // Fill in the form
    await user.type(screen.getByLabelText(/username/i), "testuser");
    await user.type(screen.getByLabelText(/password/i), "password123");

    // Submit the form
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    // Wait for error to appear
    await waitFor(() => {
      const errorMessage = screen.getByText(/username.*already exists/i);
      expect(errorMessage).toBeInTheDocument();
    });

    // Verify error contains both field errors
    expect(screen.getByText(/username.*already exists/i)).toBeInTheDocument();
    expect(screen.getByText(/email.*already exists/i)).toBeInTheDocument();

    // Verify signup was called but onSignup was not
    expect(authModule.auth.signup).toHaveBeenCalledWith({
      username: "testuser",
      email: undefined,
      password: "password123",
    });
    expect(mockOnSignup).not.toHaveBeenCalled();
  });

  it("renders error message when signup fails with detail error", async () => {
    const user = userEvent.setup();

    const axiosError = {
      response: {
        data: {
          detail: "Invalid password format.",
        },
      },
    };

    vi.mocked(authModule.auth.signup).mockRejectedValue(axiosError);

    render(
      <Signup onSignup={mockOnSignup} onSwitchToLogin={mockOnSwitchToLogin} />
    );

    await user.type(screen.getByLabelText(/username/i), "testuser");
    await user.type(screen.getByLabelText(/password/i), "weak");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid password format.")).toBeInTheDocument();
    });
  });
});
