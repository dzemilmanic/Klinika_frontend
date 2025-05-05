import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isResetLinkSent, setIsResetLinkSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    const loginData = { email, password };

    try {
      const response = await axios.post("https://klinikabackend-production.up.railway.app/api/Auth/Login", loginData);
      setSuccessMessage("Uspešno ste se prijavili!");
      localStorage.setItem("jwtToken", response.data.jwtToken);
      
      navigate("/pocetna");
      window.location.reload()
    } catch (err) {
      setError(err.response?.data?.message || "Došlo je do greške prilikom prijave.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError("Molimo unesite vašu email adresu.");
      return;
    }

    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        "https://klinikabackend-production.up.railway.app/api/Auth/ForgotPassword", 
        { email }
      );
      setSuccessMessage("Link za resetovanje lozinke je poslat na vašu email adresu.");
      setIsResetLinkSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Došlo je do greške. Proverite da li je email ispravan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">Prijavi se</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Unesite vaš email"
              required
            />
            {email && (
              <div className="forgot-password-link">
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  disabled={isLoading || isResetLinkSent}
                  className={isResetLinkSent ? "link-disabled" : ""}
                >
                  {isResetLinkSent ? "Link poslat" : "Zaboravljena lozinka?"}
                </button>
              </div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="password">Lozinka</label>
            <div className="password-input-container relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={handlePasswordChange}
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
          </div>
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? "Učitavanje..." : "Prijavi se"}
          </button>
        </form>
        {error && <p className="error-message-login">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        <div className="register-link">
          Nemate registrovan nalog? <a href="/register">Registrujte se</a>
        </div>
      </div>
    </div>
  );
}