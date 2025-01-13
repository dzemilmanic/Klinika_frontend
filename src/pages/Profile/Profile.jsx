import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
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
  const [modalField, setModalField] = useState(""); // 'ime', 'prezime', ili 'biography'
  const [newIme, setNewIme] = useState("");
  const [newPrezime, setNewPrezime] = useState("");
  const [newBiography, setNewBiography] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [appointmentsModalOpen, setAppointmentsModalOpen] = useState(false);

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
        //console.log(decoded);
        const patientId =
          decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ];

        const response = await fetch(
          `https://localhost:7151/api/Appointment/user/${patientId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

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
    }
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
            OldPassword: "",
            NewPassword: "",
          }),
        }
      );

      if (response.ok) {
        setUser(updatedUser);
        setIsModalOpen(false);
        alert("Podaci su uspešno ažurirani!");
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
              <span
                className="edit-icon"
                onClick={() => handleEdit("biography")}
              >
                ✏️
              </span>
            </div>
          </div>
        )}
        <button
          className="appointments-button"
          onClick={handleOpenAppointmentsModal}
        >
          Vaši termini
        </button>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Ažuriraj podatke</h3>
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

            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <div className="modal-buttons">
              <button onClick={handleSaveModal}>Sačuvaj</button>
              <button onClick={handleCloseModal}>Zatvori</button>
            </div>
          </div>
        </div>
      )}
      {appointmentsModalOpen && (
  <div className="modal-appoints">
    <div className="modal-appoints-content">
      <h3>Vaši termini</h3>
      {appointments.length > 0 ? (
        <ul>
          {appointments.map((appointment) => {
            const date = new Date(appointment.appointmentDate);
            const formattedDate = date.toLocaleDateString('sr-RS', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });
            const formattedTime = date.toLocaleTimeString('sr-RS', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <li key={appointment.id}>
                <strong>Datum:</strong> {formattedDate} <br />
                <strong>Vreme:</strong> {formattedTime} <br />
                <strong>Usluga:</strong> {appointment.serviceName} <br />
              </li>
            );
          })}
        </ul>
      ) : (
        <p>Nemate zakazane termine.</p>
      )}
      <button onClick={handleCloseAppointmentsModal}>Zatvori</button>
    </div>
  </div>
)}

    </div>
  );
}
