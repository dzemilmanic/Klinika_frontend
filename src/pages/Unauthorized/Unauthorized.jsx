import React from "react";
import { Link } from "react-router-dom";
import { ShieldBan } from "lucide-react";
import "./Unauthorized.css";

const Unauthorized = () => {
  return (
    <div className="unauthorized-page">
      <div className="unauthorized-container">
        <div className="unauthorized-content">
          <ShieldBan className="shield-icon" />
          <h1>Nemate dozvolu za pristup ovoj stranici</h1>
          <p>Molimo vas da se vratite na <Link to="/" className="home-link">početnu stranicu</Link>.</p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;