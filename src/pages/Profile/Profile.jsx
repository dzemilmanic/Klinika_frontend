import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { Lock } from "lucide-react"; // Import Lock icon
import AllAppointmentsModal from "../../components/AllAppointmentsModal";
import MedicalRecordModal from "../../components/MedicalRecordModal";
import "./Profile.css";

export default function Profile() {
  const [user, setUser] = useState({
    ime: "",
    prezime: "",
    email: "",
    biography: "",
    profileImagePath: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalField, setModalField] = useState(""); // 'ime', 'prezime', 'biography', or 'password'
  const [newIme, setNewIme] = useState("");
  const [newPrezime, setNewPrezime] = useState("");
  const [newBiography, setNewBiography] = useState("");
  const [newOldPassword, setNewOldPassword] = useState("");
  const [newNewPassword, setNewNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [role, setRole] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [appointmentsModalOpen, setAppointmentsModalOpen] = useState(false);
  const [isMedicalRecordModalOpen, setIsMedicalRecordModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const response = await fetch(
          "https://localhost:7151/api/Auth/GetUserData",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUser({
            ime: data.firstName || "nepoznato",
            prezime: data.lastName || "nepoznato",
            email: data.email || "nepoznato",
            biography: data.biography || "",
            profileImagePath: data.profileImagePath || "",
          });
        } else {
          console.error("Greška prilikom učitavanja podataka o korisniku");
        }
        if (token) {
          const payload = token.split(".")[1];
          const decodedPayload = JSON.parse(atob(payload));
          const roles =
            decodedPayload[
              "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            ];
          setRole(roles);
          if (roles.includes("Doctor")) {
            const doctorId =
              decodedPayload[
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
              ];
            setDoctorId(doctorId);
          }
        }
      } catch (error) {
        console.error("Greška prilikom poziva API-ja:", error);
      }
    };

    fetchUserData();
  }, []);

  const fetchAppointments = async () => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const patientId =
          decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ];

        let response;
        if (role.includes("Doctor") && doctorId) {
          response = await fetch(
            `https://localhost:7151/api/Appointment/doctor/${doctorId}/appointments`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } else {
          response = await fetch(
            `https://localhost:7151/api/Appointment/user/${patientId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }

        if (response.ok) {
          const data = await response.json();
          setAppointments(data);
        } else {
          console.error("Greška prilikom dohvatanja termina.");
        }
      } catch (error) {
        console.error("Greška prilikom poziva API-ja:", error);
      }
    }
  };

  const handleOpenAppointmentsModal = async () => {
    await fetchAppointments();
    setAppointmentsModalOpen(true);
  };

  const handleCloseAppointmentsModal = () => {
    setAppointmentsModalOpen(false);
  };

  const handleEdit = (field) => {
    setModalField(field);
    setIsModalOpen(true);
    setErrorMessage("");
    if (field === "ime") {
      setNewIme(user.ime);
    } else if (field === "prezime") {
      setNewPrezime(user.prezime);
    } else if (field === "biography") {
      setNewBiography(user.biography);
    } else if (field === "password") {
      setNewOldPassword("");
      setNewNewPassword("");
    }
  };

  const validatePasswordChange = () => {
    if (!newOldPassword) {
      setErrorMessage("Stara lozinka je obavezna.");
      return false;
    }
    if (!newNewPassword) {
      setErrorMessage("Nova lozinka je obavezna.");
      return false;
    }
    if (newNewPassword.length < 6) {
      setErrorMessage("Nova lozinka mora imati najmanje 6 karaktera.");
      return false;
    }
    return true;
  };

  const handleSaveModal = async () => {
    if (modalField === "ime" && newIme.length < 2) {
      setErrorMessage("Ime mora imati najmanje 2 karaktera.");
      return;
    }
    if (modalField === "prezime" && newPrezime.length < 2) {
      setErrorMessage("Prezime mora imati najmanje 2 karaktera.");
      return;
    }
    if (modalField === "biography" && newBiography.length < 2) {
      setErrorMessage("Biografija mora imati najmanje 2 karaktera.");
      return;
    }
    if (modalField === "password" && !validatePasswordChange()) {
      return;
    }

    const updatedUser = {
      ...user,
      ime: modalField === "ime" ? newIme : user.ime,
      prezime: modalField === "prezime" ? newPrezime : user.prezime,
      biography: modalField === "biography" ? newBiography : user.biography,
    };

    try {
      const token = localStorage.getItem("jwtToken");
      const response = await fetch(
        "https://localhost:7151/api/ChangeUserData/update",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            FirstName: updatedUser.ime,
            LastName: updatedUser.prezime,
            Biography: updatedUser.biography,
            OldPassword: newOldPassword || "",
            NewPassword: newNewPassword || "",
          }),
        }
      );

      if (response.ok) {
        setUser(updatedUser);
        setIsModalOpen(false);
        if (modalField === "password") {
          alert("Lozinka je uspešno promenjena!");
        } else {
          alert("Podaci su uspešno ažurirani!");
        }
        // Reset password fields
        setNewOldPassword("");
        setNewNewPassword("");
      } else {
        const textResponse = await response.text();
        try {
          const errorData = JSON.parse(textResponse);
          setErrorMessage(
            errorData.message || "Greška prilikom ažuriranja podataka."
          );
        } catch (error) {
          setErrorMessage(
            textResponse || "Greška prilikom ažuriranja podataka."
          );
        }
      }
    } catch (error) {
      console.error("Greška:", error);
      setErrorMessage("Došlo je do greške. Pokušajte ponovo.");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setErrorMessage("");
    setNewOldPassword("");
    setNewNewPassword("");
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h2 className="profile-title">Moj profil</h2>
        {user.profileImagePath && (
          <img
            src={user.profileImagePath}
            alt="Profilna slika"
            className="profile-image"
          />
        )}
        <div className="profile-field">
          <label>Ime:</label>
          <div className="input-container">
            <input type="text" value={user.ime} disabled />
            <span className="edit-icon" onClick={() => handleEdit("ime")}>
              ✏️
            </span>
          </div>
        </div>
        <div className="profile-field">
          <label>Prezime:</label>
          <div className="input-container">
            <input type="text" value={user.prezime} disabled />
            <span className="edit-icon" onClick={() => handleEdit("prezime")}>
              ✏️
            </span>
          </div>
        </div>
        <div className="profile-field">
          <label>Email:</label>
          <input type="email" value={user.email} disabled />
        </div>
        {user.biography && (
          <div className="profile-field">
            <label>Biografija:</label>
            <div className="input-container">
              <input type="text" value={user.biography} disabled />
              <span className="edit-icon" onClick={() => handleEdit("biography")}>
                ✏️
              </span>
            </div>
          </div>
        )}
        <div className="profile-field">
          <label>Lozinka:</label>
          <div className="input-container">
            <input type="password" value="••••••••" disabled />
            <span className="edit-icon" onClick={() => handleEdit("password")}>
              <Lock size={16} />
            </span>
          </div>
        </div>
        {!role.includes("Admin") && (
          <button
            className="appointments-button"
            onClick={handleOpenAppointmentsModal}
          >
            Vaši termini
          </button>
        )}
        {role.includes('User') && !role.includes("Doctor") && (
          <button
            onClick={async () => {
              await fetchAppointments(); 
              setIsMedicalRecordModalOpen(true);
            }}
            className="appointments-button"
          >
            Vaš karton
          </button>
        )}
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>
              {modalField === "password"
                ? "Promena lozinke"
                : "Ažuriraj podatke"}
            </h3>
            {modalField === "ime" && (
              <div>
                <label>Ime:</label>
                <input
                  type="text"
                  value={newIme}
                  onChange={(e) => setNewIme(e.target.value)}
                />
              </div>
            )}

            {modalField === "prezime" && (
              <div>
                <label>Prezime:</label>
                <input
                  type="text"
                  value={newPrezime}
                  onChange={(e) => setNewPrezime(e.target.value)}
                />
              </div>
            )}

            {modalField === "biography" && (
              <div>
                <label>Biografija:</label>
                <input
                  type="text"
                  value={newBiography}
                  onChange={(e) => setNewBiography(e.target.value)}
                />
              </div>
            )}

            {modalField === "password" && (
              <div>
                <div className="password-field">
                  <label>Stara lozinka:</label>
                  <input
                    type="password"
                    value={newOldPassword}
                    onChange={(e) => setNewOldPassword(e.target.value)}
                  />
                </div>
                <div className="password-field">
                  <label>Nova lozinka:</label>
                  <input
                    type="password"
                    value={newNewPassword}
                    onChange={(e) => setNewNewPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <div className="modal-buttons">
              <button onClick={handleSaveModal}>Sačuvaj</button>
              <button onClick={handleCloseModal}>Zatvori</button>
            </div>
          </div>
        </div>
      )}
      <AllAppointmentsModal
        isOpen={appointmentsModalOpen}
        onClose={handleCloseAppointmentsModal}
        appointments={appointments}
      />
      <MedicalRecordModal
        isOpen={isMedicalRecordModalOpen}
        onClose={() => setIsMedicalRecordModalOpen(false)}
        appointments={appointments}
      />
    </div>
  );
}