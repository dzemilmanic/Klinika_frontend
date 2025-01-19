import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Check, X } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";
import "./Register.css";

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    roles: ["User"],
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasNumber: false,
  });

  useEffect(() => {
    const password = formData.password;
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    });
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!Object.values(passwordValidation).every(Boolean)) {
      setError("Molimo vas da ispunite sve zahteve za lozinku.");
      return;
    }

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

  const ValidationIcon = ({ isValid }) => {
    return isValid ? (
      <Check className="validation-icon valid" size={16} />
    ) : (
      <X className="validation-icon invalid" size={16} />
    );
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
            <div className="password-input-container relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                placeholder="Unesite vašu lozinku"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="password-toggle-button"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-500" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
            {(passwordFocused || formData.password) && (
              <div className="password-requirements">
                <h4>Lozinka mora sadržati:</h4>
                <ul>
                  <li
                    className={
                      passwordValidation.minLength ? "valid" : "invalid"
                    }
                  >
                    <ValidationIcon isValid={passwordValidation.minLength} />
                    Najmanje 8 karaktera
                  </li>
                  <li
                    className={
                      passwordValidation.hasUpperCase ? "valid" : "invalid"
                    }
                  >
                    <ValidationIcon isValid={passwordValidation.hasUpperCase} />
                    Jedno veliko slovo
                  </li>
                  <li
                    className={
                      passwordValidation.hasNumber ? "valid" : "invalid"
                    }
                  >
                    <ValidationIcon isValid={passwordValidation.hasNumber} />
                    Jedan broj
                  </li>
                </ul>
              </div>
            )}
          </div>
          <button
            type="submit"
            className="register-button"
            disabled={!Object.values(passwordValidation).every(Boolean)}
          >
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
