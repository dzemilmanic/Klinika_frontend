import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import "./PasswordReset.css";
import { useLocation } from "react-router-dom";

export default function PasswordResetForm() {
  const location = useLocation();
  const token = decodeURIComponent(
    location.pathname.replace("/reset-password/", "")
  );
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isTokenValid, setIsTokenValid] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsTokenValid(false);
        setError("Token za resetovanje lozinke nije pronađen.");
        return;
      }

      try {
        await axios.get(
          `https://klinikabackend-production.up.railway.app/api/Auth/ValidateResetToken`,
          { params: { token } }
        );
        setIsTokenValid(true);
      } catch (err) {
        setIsTokenValid(false);
        setError("Link za resetovanje lozinke nije validan ili je istekao.");
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      setError("Lozinka mora imati najmanje 8 karaktera.");
      return;
    }

    if (!/(?=.*[A-Z])/.test(newPassword)) {
      setError("Lozinka mora sadržati najmanje jedno veliko slovo.");
      return;
    }

    if (!/(?=.*\d)/.test(newPassword)) {
      setError("Lozinka mora sadržati najmanje jedan broj.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Lozinke se ne podudaraju.");
      return;
    }

    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        "https://klinikabackend-production.up.railway.app/api/Auth/ResetPassword",
        {
          token,
          newPassword,
        }
      );
      setSuccessMessage(
        "Vaša lozinka je uspešno promenjena! Preusmerićemo vas na stranicu za prijavu."
      );

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Došlo je do greške. Pokušajte ponovo kasnije."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isTokenValid) {
    return (
      <div className="password-reset-page">
        <div className="password-reset-container">
          <h2 className="password-reset-title">Nevažeći link</h2>
          <p className="error-message">
            Link za resetovanje lozinke nije validan ili je istekao.
          </p>
          <div className="back-to-login">
            <Link to="/reset-password">Zatražite novi link</Link> ili{" "}
            <Link to="/login">vratite se na prijavu</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="password-reset-page">
      <div className="password-reset-container">
        <h2 className="password-reset-title">Postavi novu lozinku</h2>
        <p className="password-reset-description">
          Unesite vašu novu lozinku. Lozinka mora sadržati najmanje 8 karaktera,
          jedno veliko slovo i jedan broj.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword">Nova lozinka</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Unesite novu lozinku"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-button"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-500" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Potvrdite lozinku</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Potvrdite novu lozinku"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle-button"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-500" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          <div className="password-requirements">
            <p>Lozinka mora sadržati:</p>
            <ul>
              <li className={newPassword.length >= 8 ? "valid" : "invalid"}>
                Najmanje 8 karaktera
              </li>
              <li
                className={
                  /(?=.*[A-Z])/.test(newPassword) ? "valid" : "invalid"
                }
              >
                Najmanje jedno veliko slovo
              </li>
              <li
                className={/(?=.*\d)/.test(newPassword) ? "valid" : "invalid"}
              >
                Najmanje jedan broj
              </li>
            </ul>
          </div>

          <button
            type="submit"
            className="password-reset-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Čuvanje..." : "Sačuvaj novu lozinku"}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
      </div>
    </div>
  );
}
