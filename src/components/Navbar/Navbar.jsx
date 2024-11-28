import React from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <header>
      <nav className="navbar">
        <ul className="nav-items">
            <NavLink to="/pocetna">Početna</NavLink>
            <NavLink to="/usluge">Usluge</NavLink>
            <NavLink to="/osoblje">Osoblje</NavLink>
            <NavLink to="/vesti">Vesti</NavLink>
            <NavLink to="/login">Prijavi se</NavLink>
        </ul>
        <div className="search-container">
          <input type="text" placeholder="Pretraži..." className="search-bar" />
          <button className="button-search">Pretraži</button>
        </div>
      </nav>
    </header>
  );
}
