import React from "react";
import "./RoleRequests.css"; // CSS za stilizaciju

const RoleRequests = ({ requests, onAction }) => {
  console.log(requests);
  return (
    <div className="requests-modal">
      <h3>Zahtevi za pridruživanje</h3>
      {requests.map((request) => (
        <div key={request.id} className="request-item">
          <div className="user-info">
            <img
              src={request.imageUrl} // Default slika ako nema profilne
              alt={`${request.FirstName} ${request.LastName}`}
              className="profile-image"
            />
            <div className="user-details">
              <p className="user-name">
                {request.firstName} {request.lastName}
              </p>
              <p className="user-biography">{request.biography}</p>
            </div>
          </div>
          <div className="request-actions">
            <button
              onClick={() => onAction(request.id, "approve")}
              className="icon-btn approve-btn"
              title="Odobri"
            >
              ✔️
            </button>
            <button
              onClick={() => onAction(request.id, "reject")}
              className="icon-btn reject-btn"
              title="Odbij"
            >
              ❌
            </button>
          </div>
        </div>
      ))}
    </div>
    
  );
  

};

export default RoleRequests;
