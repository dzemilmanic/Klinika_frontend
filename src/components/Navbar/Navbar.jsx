import React from "react";
import "./Navbar.css";

export default function Navbar() {
  return (
    <header>
      <nav className="navbar">
        <ul className="nav-items">
          <li>
            <a href="">Početna</a>
          </li>
          <li>
            <a href="">Naše usluge</a>
          </li>
          <li>
            <a href="">Cenovnik</a>
          </li>
          <li>
            <a href="">Naš tim</a>
          </li>
          <li>
            <a href="">Vesti</a>
          </li>
          <li>
            <a href="">Login</a>
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
