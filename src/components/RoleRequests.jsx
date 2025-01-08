import React from "react";
import "./RoleRequests.css"; // Opcionalno: Dodajte CSS za ovu komponentu

const RoleRequests = ({ requests, onAction }) => {
  return (
    <div className="requests-modal">
      <h3>Zahtevi za pridruživanje</h3>
      {requests.map((request) => (
        <div key={request.id} className="request-item">
          {/* Prikazivanje slike korisnika */}
          <div className="user-info">
            <img
              src={request.profileImagePath || "/default-profile.png"} // Ako nema slike, koristi default
              alt={`${request.firstName} ${request.lastName}`}
              className="profile-image"
            />
            <div className="user-details">
              <p className="user-name">
                {request.FirstName} {request.LastName}
              </p>
              <p className="user-biography">{request.biography}</p>
            </div>
          </div>
          <div className="request-actions">
            <button
              onClick={() => onAction(request.id, "approve")}
              className="approve-btn"
            >
              Odobri
            </button>
            <button
              onClick={() => onAction(request.id, "reject")}
              className="reject-btn"
            >
              Odbij
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoleRequests;
