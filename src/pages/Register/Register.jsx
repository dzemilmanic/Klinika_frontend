import React, { useState } from "react"; // Popravljen import
import { Link } from "react-router-dom";
import axios from "axios";
import "./Register.css"; // Importuj CSS datoteku

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    roles: ["User"], // Podrazumevana uloga
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      const response = await axios.post(
        "https://localhost:7151/api/Auth/Register",
        formData
      );
      setSuccessMessage(response.data.message || "Uspešna registracija!");
      setFormData({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        roles: ["User"],
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Došlo je do greške prilikom registracije."
      );
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h2 className="register-title">Registruj se</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="first-name">Vaše ime</label>
            <input
              type="text"
              id="first-name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Unesite vaše ime"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="last-name">Vaše prezime</label>
            <input
              type="text"
              id="last-name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Unesite vaše prezime"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Unesite vaš email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Lozinka</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Unesite vašu lozinku"
              required
            />
          </div>
          <button type="submit" className="register-button">
            Registruj se
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        <div className="register-link">
          Već imate nalog? <Link to="/login">Prijavite se</Link>
        </div>
      </div>
    </div>
  );
}
