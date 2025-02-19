import React, {useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();  // Koristi se za navigaciju nakon uspešne prijave

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccessMessage("");

    const loginData = { email, password };

    try {
      const response = await axios.post("https://klinikabackend-production.up.railway.app/api/Auth/Login", loginData);
      setSuccessMessage("Uspešno ste se prijavili!");
      console.log(response.data);
      // Sačuvaj JWT token u lokalnom skladištu
      localStorage.setItem("jwtToken", response.data.jwtToken);
      
      // Preusmeri korisnika na glavnu stranu nakon uspešne prijave
      navigate("/pocetna"); // Pretpostavimo da postoji 'dashboard' stranica
      window.location.reload()
    } catch (err) {
      setError(err.response?.data?.message || "Došlo je do greške prilikom prijave.");
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
          <button type="submit" className="login-button">
            Prijavi se
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