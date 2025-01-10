import React, { useEffect, useState } from "react";
import RoleRequestForm from "../../components/RoleRequestForm";
import RoleRequests from "../../components/RoleRequests";
import "./Staff.css";
const Staff = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [role, setRole] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [requestStatus, setRequestStatus] = useState("");
  const [requests, setRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("https://localhost:7151/api/Roles/doctors", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Greška prilikom fetchovanja lekara.");
        }

        const data = await response.json();
        setUsers(data);

        const token = localStorage.getItem("jwtToken");
        if (token) {
          try {
            const payload = token.split(".")[1];
            const decodedPayload = JSON.parse(atob(payload));
            const roles = decodedPayload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "User";
            setRole(roles);
          } catch (error) {
            setError("Greška prilikom dekodovanja tokena.");
          }
        }
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchRequestStatus = async () => {
      const token = localStorage.getItem("jwtToken");
      if (!token) return;

      try {
        const response = await fetch("https://localhost:7151/api/RoleRequest/status", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch request status.");
        }

        const data = await response.json();
        setRequestStatus(data.status);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchUsers();
    fetchRequestStatus();
  }, []);

  const fetchRoleRequests = async () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) return;

    try {
      const response = await fetch("https://localhost:7151/api/RoleRequest/all", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch role requests.");
      }

      const data = await response.json();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRequestAction = async (requestId, action) => {
    const token = localStorage.getItem("jwtToken");
    if (!token) return;

    try {
      const response = await fetch(
        `https://localhost:7151/api/RoleRequest/${action}/${requestId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Ažuriranje statusa zahteva nije uspelo.");
      }

      alert(`Zahtev je ${action === "approve" ? "odobren" : "odbijen"}.`);
      fetchRoleRequests();
    } catch (err) {
      alert("Greška pri ažuriranju statusa zahteva: " + err.message);
    }
  };

  const handleFormSubmit = async (formData) => {
    const token = localStorage.getItem("jwtToken");
    if (!token) return;

    try {
      const response = await fetch("https://localhost:7151/api/RoleRequest/submit", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit role request.");
      }

      alert("Zahtev je uspešno poslan.");
      setShowForm(false);
    } catch (err) {
      alert("Greška pri slanju zahteva: " + err.message);
    }
  };

  const handleCardClick = (userId) => {
    setExpandedCard(expandedCard === userId ? null : userId); // Prebacujemo stanje između otvorenog i zatvorenog
  };

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div className="staff-page">
      <div className="staff-container">
        <div className="header-section">
          <h2>Naš stručni tim</h2>
          {role === "User" && (
            <button
              onClick={() => {
                if (requestStatus === "Pending") {
                  alert("Već imate zahtev na čekanju. Molimo pričekajte rezultat.");
                } else {
                  setShowForm(!showForm);
                }
              }}
              className="be-member-btn"
            >
              Postani jedan od nas
            </button>
          )}
          {role === "Admin" && (
            <button
              onClick={() => {
                setShowRequests(!showRequests);
                if (!showRequests) fetchRoleRequests();
              }}
              className="view-requests-btn"
            >
              Vidi zahteve
            </button>
          )}
        </div>

        <div className="cards-grid">
          {users.map((user) => (
            <div
              key={user.id}
              className="staff-card"
              onClick={() => handleCardClick(user.id)} // Dodajemo funkciju na klik
            >
              <img
                src={
                  user.profileImagePath ||
                  "https://apotekasombor.rs/wp-content/uploads/2020/12/izabrani-lekar-730x365.jpg"
                }
                alt={`${user.firstName} ${user.lastName}`}
                className="staff-image"
              />
              <h3 className="staff-name">
                {user.firstName} {user.lastName}
              </h3>

              {expandedCard === user.id && (
                <div className="staff-details">
                  <p className="staff-email">{user.email}</p>
                  <p className="staff-biography">{user.biography}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {showForm && (
          <div className="modal" onClick={() => setShowForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <RoleRequestForm
                onSubmit={handleFormSubmit}
                onClose={() => setShowForm(false)}
                isOpen={showForm}
              />
            </div>
          </div>
        )}

        {showRequests && (
          <div className="modal-staff" onClick={() => setShowRequests(false)}>
            <div className="modal-staff-content" onClick={(e) => e.stopPropagation()}>
              {requests.length === 0 ? (
                <p className="no-requests-message">Nema pristiglih zahteva</p>
              ) : (
                <RoleRequests requests={requests} onAction={handleRequestAction} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Staff;