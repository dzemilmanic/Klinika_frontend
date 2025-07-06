import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from './Navbar';
import { MemoryRouter } from 'react-router-dom';

// Mock navigate funkciju iz react-router
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    useNavigate: () => jest.fn(),
  };
});

describe('Navbar', () => {
  beforeEach(() => {
    localStorage.clear(); // Reset pre svakog testa
  });

  test('prikazuje logo i osnovne linkove', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByAltText('Logo')).toBeInTheDocument();
    expect(screen.getByText('Početna')).toBeInTheDocument();
    expect(screen.getByText('Usluge')).toBeInTheDocument();
    expect(screen.getByText('Osoblje')).toBeInTheDocument();
    expect(screen.getByText('Vesti')).toBeInTheDocument();
  });

  test('prikazuje dugme "Prijavi se" kada korisnik nije ulogovan', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText('Prijavi se')).toBeInTheDocument();
    expect(screen.queryByText('Profil')).not.toBeInTheDocument();
    expect(screen.queryByText('Odjavi se')).not.toBeInTheDocument();
  });

  test('prikazuje dugmad "Profil" i "Odjavi se" kada je korisnik ulogovan', () => {
    const token = btoa(JSON.stringify({})) + "." + btoa(JSON.stringify({
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "User"
    })) + ".sig";
    localStorage.setItem('jwtToken', token);

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText('Profil')).toBeInTheDocument();
    expect(screen.getByText('Odjavi se')).toBeInTheDocument();
  });

  test('prikazuje admin linkove kada je uloga Admin', () => {
    const token = btoa(JSON.stringify({})) + "." + btoa(JSON.stringify({
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "Admin"
    })) + ".sig";
    localStorage.setItem('jwtToken', token);

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText('Korisnici')).toBeInTheDocument();
    expect(screen.getByText('Termini')).toBeInTheDocument();
  });

  test('otvara i zatvara meni', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const toggleButton = screen.getByLabelText('Toggle menu');
    fireEvent.click(toggleButton); // Otvaranje
    expect(document.querySelector('.nav-container.menu-open')).toBeInTheDocument();

    fireEvent.click(toggleButton); // Zatvaranje
    expect(document.querySelector('.nav-container.menu-open')).not.toBeInTheDocument();
  });
});
