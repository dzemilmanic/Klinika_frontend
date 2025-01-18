import React from "react";
import { Link } from "react-router-dom";
import { Ghost } from "lucide-react";
import "./NotFound.css";

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <div className="not-found">
          <Ghost className="ghost-icon" />
          <h1>404 - Stranica nije pronađena</h1>
          <p>Izgleda da stranica koju tražite ne postoji.</p>
          <Link to="/" className="back-home">
            Povratak na početnu stranicu
          </Link>
        </div>
      </div>
    </div>
  );
}
