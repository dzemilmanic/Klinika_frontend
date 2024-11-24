import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <header>
      <nav className="navbar">
        <ul className="nav-items">
          <li>
            <Link to="/pocetna">Početna</Link>
          </li>
          <li>
            <Link to="/usluge">Usluge</Link>
          </li>
          <li>
            <Link to="/osoblje">Osoblje</Link>
          </li>
          <li>
            <Link to="/vesti">Vesti</Link>
          </li>
          <li>
            <Link to="/login">Login</Link>
          </li>
        </ul>
        <div className="search-container">
          <input type="text" placeholder="Pretraži..." className="search-bar" />
          <button className="button-search">Pretraži</button>
        </div>
      </nav>
    </header>
  );
}
