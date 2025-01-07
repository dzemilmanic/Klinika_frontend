import React, { useEffect, useState } from "react";
import RoleRequestForm from "../../components/RoleRequestForm"; // Uvoz nove komponente
import "./Staff.css"; // Uvoz CSS fajla

const Staff = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [role, setRole] = useState(""); // Stanje za ulogu korisnika
  const [showForm, setShowForm] = useState(false); // Stanje za prikaz forme
  const [requestStatus, setRequestStatus] = useState(""); // Stanje za status zahteva

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

        // Provera i dekodiranje JWT tokena za ulogu korisnika
        const token = localStorage.getItem("jwtToken");
        if (token) {
          try {
            const payload = token.split(".")[1];
            const decodedPayload = JSON.parse(atob(payload));
            const roles =
              decodedPayload[
                "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
              ] || "User";
            setRole(roles); // Postavljanje uloge
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
        setRequestStatus(data.status); // Status može biti "Pending", "Approved", "Rejected" ili null
      } catch (err) {
        setError(err.message);
      }
    };

    fetchUsers();
    fetchRequestStatus();
  }, []);

  const handleFormSubmit = async ({ biography, image }) => {
    if (requestStatus === "Pending") {
      alert("Već ste poslali zahtev. Molimo sačekajte odobrenje.");
      return;
    }

    const formData = new FormData();
    formData.append("Biography", biography);
    formData.append("Image", image);

    const token = localStorage.getItem("jwtToken");
    if (!token) {
      alert("Niste prijavljeni. Molimo vas prijavite se ponovo.");
      return;
    }

    try {
      const response = await fetch(
        "https://localhost:7151/api/RoleRequest/submit",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      alert("Zahtev je uspešno poslat!");
      setShowForm(false);
      setRequestStatus("Pending"); // Ažuriraj status zahteva
    } catch (err) {
      alert("Greška prilikom slanja zahteva: " + err.message);
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
      </div>
    </div>
  );
};

export default Staff;
