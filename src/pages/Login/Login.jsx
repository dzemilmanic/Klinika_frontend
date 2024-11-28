import React from "react";
import { Link } from "react-router-dom";
import "./Login.css"; // Importuj CSS datoteku

export default function Login() {
  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">Prijavi se</h2>
        <form>
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
          <button type="submit" className="login-button">
            Prijavi se
          </button>
        </form>
        <div className="register-link">
          Nemate registrovan nalog? <a href="/register">Registrujte se</a>
        </div>
      </div>
    </div>
  );
}
