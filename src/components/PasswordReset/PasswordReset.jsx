import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './PasswordReset.css';

export default function PasswordReset() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Molimo unesite vašu email adresu.');
      return;
    }
    
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);
    
    try {
      const response = await axios.post(
        'https://klinikabackend-production.up.railway.app/api/Auth/ForgotPassword',
        { email }
      );
      setSuccessMessage('Link za resetovanje lozinke je poslat na vašu email adresu.');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Došlo je do greške. Proverite da li je email ispravan.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="password-reset-page">
      <div className="password-reset-container">
        <h2 className="password-reset-title">Resetovanje lozinke</h2>
        <p className="password-reset-description">
          Unesite email adresu povezanu sa vašim nalogom, i poslaćemo vam link za resetovanje lozinke.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email adresa</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Unesite vašu email adresu"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="password-reset-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Slanje...' : 'Pošalji link za resetovanje'}
          </button>
        </form>
        
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        
        <div className="back-to-login">
          <Link to="/login">Nazad na prijavu</Link>
        </div>
      </div>
    </div>
  );
}