import React, { useEffect, useState } from "react";
import RoleRequestForm from "../../components/Staff/RoleRequestForm";
import RoleRequests from "../../components/Staff/RoleRequests";
import "./Staff.css";
import { toast } from "react-toastify";

const Staff = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [requestStatus, setRequestStatus] = useState("");
  const [requests, setRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://klinikabackend-production.up.railway.app/api/Roles/doctors",
          {
            method: "GET",
            credentials: "include",
          }
        );

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
            const roles =
              decodedPayload[
                "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
              ] || "User";
            setRole(roles);
          } catch (error) {
            setError("Greška prilikom dekodovanja tokena.");
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchRequestStatus = async () => {
      const token = localStorage.getItem("jwtToken");
      if (!token) return;

      try {
        const response = await fetch(
          "https://klinikabackend-production.up.railway.app/api/RoleRequest/status",
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
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    fetchRequestStatus();
  }, []);

  const fetchRoleRequests = async () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) return;

    try {
      const response = await fetch(
        "https://klinikabackend-production.up.railway.app/api/RoleRequest/all",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
        `https://klinikabackend-production.up.railway.app/api/RoleRequest/${action}/${requestId}`,
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

      toast.success(
        `Zahtev je ${action === "approve" ? "odobren" : "odbijen"}.`
      );
      fetchRoleRequests();
    } catch (err) {
      toast.error("Greška pri ažuriranju statusa zahteva: " + err.message);
    }
  };

  const handleFormSubmit = async (formData) => {
    const token = localStorage.getItem("jwtToken");
    if (!token) return;

    try {
      const response = await fetch(
        "https://klinikabackend-production.up.railway.app/api/RoleRequest/submit",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit role request.");
      }

      toast.success("Zahtev je uspešno poslan.");
      setShowForm(false);
    } catch (err) {
      toast.error("Greška pri slanju zahteva: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="news-page">
        <div className="loader">
          <div className="loader-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-page">
        <div className="error">
          <div className="error-content">
            <strong>Error: </strong>
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
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
                  toast.success(
                    "Već imate zahtev na čekanju. Molimo pričekajte rezultat."
                  );
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

        {users.length === 0 ? (
          <p className="no-users">Nema dodatih lekara.</p>
        ) : (
          <div className="cards-grid">
            {users.map((user) => (
              <div
                key={user.id}
                className="staff-card"
                onClick={() => setSelectedDoctor(user)}
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
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="modal" onClick={() => setShowForm(false)}>
            <div onClick={(e) => e.stopPropagation()}>
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
            <div
              className="modal-staff-content"
              onClick={(e) => e.stopPropagation()}
            >
              {requests.length === 0 ? (
                <p className="no-requests-message">Nema pristiglih zahteva</p>
              ) : (
                <RoleRequests
                  requests={requests}
                  onAction={handleRequestAction}
                />
              )}
            </div>
          </div>
        )}

        {selectedDoctor && (
          <div className="modal" onClick={() => setSelectedDoctor(null)}>
            <div
              className="doctor-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="doctor-modal-header">
                <img
                  src={
                    selectedDoctor.profileImagePath ||
                    "https://apotekasombor.rs/wp-content/uploads/2020/12/izabrani-lekar-730x365.jpg"
                  }
                  alt={`${selectedDoctor.firstName} ${selectedDoctor.lastName}`}
                  className="doctor-modal-image"
                />
                <div className="doctor-modal-title">
                  <h3>
                    {selectedDoctor.firstName} {selectedDoctor.lastName}
                  </h3>
                  <p className="doctor-modal-email">{selectedDoctor.email}</p>
                </div>
              </div>
              <div className="doctor-modal-body">
                <div className="doctor-modal-biography">
                  <h4>Biografija</h4>
                  <p>{selectedDoctor.biography}</p>
                </div>
              </div>
              <button
                className="doctor-modal-close"
                onClick={() => setSelectedDoctor(null)}
              >
                Zatvori
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Staff;
