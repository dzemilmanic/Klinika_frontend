import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("jwtToken");

  if (!token) {
    // Ako nema tokena, korisnik nije autentifikovan
    return <Navigate to="/login" replace />;
  }

  try {
    // Dekodiranje tokena
    const payload = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payload));

    // Ekstrakcija role iz tokena
    let userRoles =
      decodedPayload[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ];

    // Ako je uloga string, podeli je na niz; ako je već niz, koristi ga direktno
    if (typeof userRoles === "string") {
      userRoles = userRoles.split(",");
    } else if (!Array.isArray(userRoles)) {
      // Ako nije ni string ni niz, podesi na prazan niz
      userRoles = [];
    }

    // Provera da li korisnik ima makar jednu od dozvoljenih uloga
    const hasAccess = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace />;
    }

    // Ako je sve u redu, prikaži decu
    return children;
  } catch (error) {
    console.error("Greška prilikom dekodiranja tokena:", error);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
