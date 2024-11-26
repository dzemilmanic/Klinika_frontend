import React from "react";
import { Link } from "react-router-dom";
import "./Register.css"; // Importuj CSS datoteku

export default function Register() {
  return (
    <div className="register-page">
      <div className="register-container">
        <h2 className="register-title">Registruj se</h2>
        <form>
          <div className="form-group">
            <label htmlFor="first-name">Vaše ime</label>
            <input type="text" id="first-name" placeholder="Unesite vaše ime" />
          </div>
          <div className="form-group">
            <label htmlFor="last-name">Vaše prezime</label>
            <input
              type="text"
              id="last-name"
              placeholder="Unesite vaše prezime"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" placeholder="Unesite vaš email" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Lozinka</label>
            <input
              type="password"
              id="password"
              placeholder="Unesite vašu lozinku"
            />
          </div>
          <button type="submit" className="register-button">
            Registruj se
          </button>
        </form>
        <div className="register-link">
          Već imate nalog? <Link to="/login">Prijavite se</Link>
        </div>
      </div>
    </div>
  );
}
