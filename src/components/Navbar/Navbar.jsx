import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import "./Navbar.css";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("User");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      setIsLoggedIn(true);
      checkUserRole(token);
    } else {
      setIsLoggedIn(false);
    }

    // Add click event listener to handle clicks outside navbar
    const handleClickOutside = (event) => {
      const navContainer = document.querySelector('.nav-container');
      const menuToggle = document.querySelector('.menu-toggle');
      
      if (isMenuOpen && navContainer && menuToggle) {
        // Check if click is outside both the nav container and menu toggle
        if (!navContainer.contains(event.target) && !menuToggle.contains(event.target)) {
          setIsMenuOpen(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen((prev) => !prev);
  };
  
  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    localStorage.removeItem("jwtToken");
    setIsLoggedIn(false);
    navigate("/pocetna");
    window.location.reload();
  };

  const checkUserRole = (token) => {
    if (token) {
      try {
        const payload = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payload));
        const roles =
          decodedPayload[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ] || "User";
        setUserRole(roles);
      } catch (error) {
        console.error("Error decoding token.");
      }
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <nav className="navbar">
        <div className="navbar-logo">
          <NavLink to="/pocetna" onClick={closeMenu}>
            <img
              src="https://dzemil.blob.core.windows.net/slike/oculus-simple.png"
              alt="Logo"
              className="logo-image"
            />
          </NavLink>
        </div>

        <button 
          className="menu-toggle" 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="menu-icon" size={24} />
          ) : (
            <Menu className="menu-icon" size={24} />
          )}
        </button>

        <div 
          className={`nav-container ${isMenuOpen ? "menu-open" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          <ul className="nav-items">
            <li>
              <NavLink 
                to="/pocetna" 
                onClick={closeMenu}
                className={({ isActive }) => isActive ? "active" : ""}
              >
                Početna
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/usluge" 
                onClick={closeMenu}
                className={({ isActive }) => isActive ? "active" : ""}
              >
                Usluge
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/osoblje" 
                onClick={closeMenu}
                className={({ isActive }) => isActive ? "active" : ""}
              >
                Osoblje
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/vesti" 
                onClick={closeMenu}
                className={({ isActive }) => isActive ? "active" : ""}
              >
                Vesti
              </NavLink>
            </li>
            {userRole === "Admin" && (
              <>
                <li>
                  <NavLink 
                    to="/korisnici" 
                    onClick={closeMenu}
                    className={({ isActive }) => isActive ? "active" : ""}
                  >
                    Korisnici
                  </NavLink>
                </li>
                <li>
                  <NavLink 
                    to="/termini" 
                    onClick={closeMenu}
                    className={({ isActive }) => isActive ? "active" : ""}
                  >
                    Termini
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          <div className="auth-buttons">
            {!isLoggedIn ? (
              <NavLink 
                to="/login" 
                onClick={closeMenu}
                className="login-button"
              >
                <User size={18} />
                <span>Prijavi se</span>
              </NavLink>
            ) : (
              <div className="user-menu">
                <NavLink 
                  to="/profil" 
                  onClick={closeMenu}
                  className="profile-button"
                >
                  <User size={18} />
                  <span>Profil</span>
                </NavLink>
                <button 
                  onClick={handleLogout}
                  className="logout-button"
                >
                  <LogOut size={18} />
                  <span>Odjavi se</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}