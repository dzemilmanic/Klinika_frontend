import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Dodajemo state za prijavu
  const navigate = useNavigate();

  useEffect(() => {
    // Proveri da li postoji JWT token u localStorage
    const token = localStorage.getItem("jwtToken");
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleSearch = () => {
    setIsSearchActive(!isSearchActive);
  };

  const handleLogout = () => {
    // Briši JWT token iz localStorage
    localStorage.removeItem("jwtToken");
    setIsLoggedIn(false); // Osveži stanje
    navigate("/pocetna"); // Preusmeri korisnika na pocetna stranicu
  };

  return (
    <header>
      <nav className="navbar">
        <div className="menu-icon" onClick={toggleMenu}>
          <i className={`fas ${isMenuOpen ? "fa-times" : "fa-bars"}`}></i>
        </div>
        <ul className={`nav-items ${isMenuOpen ? "active" : ""}`}>
          <li>
            <NavLink to="/pocetna" onClick={() => setIsMenuOpen(false)}>
              Početna
            </NavLink>
          </li>
          <li>
            <NavLink to="/usluge" onClick={() => setIsMenuOpen(false)}>
              Usluge
            </NavLink>
          </li>
          <li>
            <NavLink to="/osoblje" onClick={() => setIsMenuOpen(false)}>
              Osoblje
            </NavLink>
          </li>
          <li>
            <NavLink to="/vesti" onClick={() => setIsMenuOpen(false)}>
              Vesti
            </NavLink>
          </li>
          {!isLoggedIn ? (
            <li>
              <NavLink to="/login" onClick={() => setIsMenuOpen(false)}>
                Prijavi se
              </NavLink>
            </li>
          ) : (
            <>
              <li>
                <NavLink to="/profil" onClick={() => setIsMenuOpen(false)}>
                  Profil
                </NavLink>
              </li>
              <li>
                <button onClick={handleLogout} className="logout-button">
                  Odjavi se
                </button>
              </li>
            </>
          )}
        </ul>
        <div className="search-container">
          {isSearchActive && (
            <input
              type="text"
              placeholder="Pretraži..."
              className="search-bar"
            />
          )}
          <i className="fas fa-search search-icon" onClick={toggleSearch}></i>
        </div>
      </nav>
    </header>
  );
}