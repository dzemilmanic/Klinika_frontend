import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Users from "./Users";

// Mock fetch API
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            id: 1,
            firstName: "Marko",
            lastName: "Marković",
            email: "marko@example.com",
            roles: ["User"],
            profileImagePath: null,
          },
          {
            id: 2,
            firstName: "Jelena",
            lastName: "Jovanović",
            email: "jelena@example.com",
            roles: ["Doctor"],
            profileImagePath: null,
          },
        ]),
    })
  );
});

afterEach(() => {
  jest.resetAllMocks();
});

test("prikazuje listu korisnika", async () => {
  render(<Users />);

  // Sačekaj da korisnici budu prikazani
  await waitFor(() => {
    expect(screen.getByText("Marko Marković")).toBeInTheDocument();
    expect(screen.getByText("Jelena Jovanović")).toBeInTheDocument();
  });
});

test("pretraga korisnika filtrira listu", async () => {
  render(<Users />);

  await waitFor(() => screen.getByText("Marko Marković"));

  const searchInput = screen.getByPlaceholderText("Pretraži korisnike...");
  fireEvent.change(searchInput, { target: { value: "jelena" } });

  expect(screen.queryByText("Marko Marković")).not.toBeInTheDocument();
  expect(screen.getByText("Jelena Jovanović")).toBeInTheDocument();
});


