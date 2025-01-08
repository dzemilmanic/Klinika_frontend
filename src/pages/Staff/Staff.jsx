import React, { useEffect, useState } from "react";
import RoleRequestForm from "../../components/RoleRequestForm";
import RoleRequests from "../../components/RoleRequests"; // Uvoz nove komponente
import "./Staff.css";

const Staff = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [role, setRole] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [requestStatus, setRequestStatus] = useState("");
  const [requests, setRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          "https://localhost:7151/api/Roles/doctors",
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch users.");
        }

        const data = await response.json();
        setUsers(data);

        const token = localStorage.getItem("jwtToken");
        if (token) {
          try {
            const payload = token.split(".")[1];
            const decodedPayload = JSON.parse(atob(payload));
            const roles =
              decodedPayload[
                "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
              ] || "User";
            setRole(roles);
          } catch (error) {
            setError("Error decoding token.");
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
        const response = await fetch(
          "https://localhost:7151/api/RoleRequest/status",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

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

  const token = localStorage.getItem("jwtToken");
  if (!token) return;

  const fetchRoleRequests = async () => {
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
        throw new Error("Failed to update request status.");
      }

      alert(`Zahtev je ${action === "approve" ? "odobren" : "odbijen"}.`);
      fetchRoleRequests();
    } catch (err) {
      alert("Greška prilikom ažuriranja statusa zahteva: " + err.message);
    }
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
                  alert("Već ste poslali zahtev. Molimo sačekajte odobrenje.");
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
              Pregledaj zahteve
            </button>
          )}
        </div>

        <div className="cards-grid">
          {users.map((user) => (
            <div key={user.id} className="staff-card">
              <h3 className="staff-name">
                {user.firstName} {user.lastName}
              </h3>
              <p className="staff-email">{user.email}</p>
            </div>
          ))}
        </div>

        {showForm && (
          <div className="modal" onClick={() => setShowForm(false)}>
            <RoleRequestForm
              onSubmit={handleFormSubmit}
              onClose={() => setShowForm(false)}
              isOpen={showForm}
            />
          </div>
        )}

        {showRequests && (
          <RoleRequests requests={requests} onAction={handleRequestAction} />
        )}
      </div>
    </div>
  );
};

export default Staff;
