import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Login from "./Login";
import { BrowserRouter } from "react-router-dom";

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

test("Login forma renderuje email, lozinku i dugme", () => {
  renderWithRouter(<Login />);

  const emailInput = screen.getByLabelText(/email/i);
  const passwordInput = screen.getByLabelText(/lozinka/i);
  const submitButton = screen.getByRole("button", { name: /prijavi se/i });

  expect(emailInput).toBeInTheDocument();
  expect(passwordInput).toBeInTheDocument();
  expect(submitButton).toBeInTheDocument();

  fireEvent.change(emailInput, { target: { value: "test@example.com" } });
  fireEvent.change(passwordInput, { target: { value: "mypassword" } });

  expect(emailInput.value).toBe("test@example.com");
  expect(passwordInput.value).toBe("mypassword");

  fireEvent.click(submitButton);
});
