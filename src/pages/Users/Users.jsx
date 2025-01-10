import React, { useState, useEffect } from "react";
import { UserCircle2, Mail, Trash } from "lucide-react";
import "./Users.css";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
const [newUser, setNewUser] = useState({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  roles: ["User"], // Podrazumevana uloga
});


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          "https://localhost:7151/api/Auth/GetUsers",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = (id) => {
    setUserToDelete(id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(
        `https://localhost:7151/api/Auth/${userToDelete}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Message || "Greška prilikom brisanja korisnika.");
      }

      // Ažuriraj stanje korisnika
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== userToDelete)
      );
      alert("Korisnik je uspešno obrisan.");
    } catch (err) {
      alert(err.message);
    } finally {
      setShowModal(false);
      setUserToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowModal(false);
    setUserToDelete(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleAddUser = async () => {
    try {
      const response = await fetch("https://localhost:7151/api/Auth/Register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newUser),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Message || "Greška prilikom dodavanja korisnika.");
      }
  
      const addedUser = await response.json();
      setUsers((prevUsers) => [...prevUsers, addedUser]);
      alert("Korisnik je uspešno dodat!");
      setIsModalOpen(false);
      setNewUser({ firstName: "", lastName: "", email: "", password: "", roles: ["User"] });
    } catch (err) {
      alert(err.message);
    }
  };
  

  if (loading) {
    return (
      <div className="loader">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <div className="error-content">
          <strong>Error: </strong>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="users-container">
        <h2>Registrovani korisnici</h2>
        <button className="add-user-btn" onClick={() => setIsModalOpen(true)}>
            Dodaj novog korisnika
          </button>
        <div className="card-container">
          {users.map((user) => (
            <div key={user.id} className="card">
              <div className="card-content">
                <div className="avatar-container">
                  <UserCircle2 size={24} />
                </div>
                <div className="user-info">
                  <h3 className="user-name">
                    {user.firstName} {user.lastName}
                  </h3>
                  <div className="user-details">
                    <div className="detail-item">
                      <Mail size={16} />
                      <span>{user.email}</span>
                    </div>
                  </div>
                </div>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(user.id)}
                >
                  <Trash size={16} />
                  Izbriši
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-users">
            <h3>Da li ste sigurni da želite da obrišete ovog korisnika?</h3>
            <div className="modal-users-actions">
              <button className="confirm-button" onClick={confirmDelete}>
                Da
              </button>
              <button className="cancel-button" onClick={cancelDelete}>
                Ne
              </button>
            </div>
          </div>
        </div>
      )}

{isModalOpen && (
  <div className="modal-overlay">
    <div className="modal-users">
      <h3>Dodaj novog korisnika</h3>
      <div className="modal-users-form">
        <input
          type="text"
          name="firstName"
          placeholder="Ime"
          value={newUser.firstName}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="lastName"
          placeholder="Prezime"
          value={newUser.lastName}
          onChange={handleInputChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={newUser.email}
          onChange={handleInputChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Lozinka"
          value={newUser.password}
          onChange={handleInputChange}
        />
        <button className="confirm-button" onClick={handleAddUser}>
          Dodaj
        </button>
        <button className="cancel-button" onClick={() => setIsModalOpen(false)}>
          Otkaži
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Users;
