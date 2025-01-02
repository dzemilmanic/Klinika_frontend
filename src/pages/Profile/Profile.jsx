import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import "./Profile.css";

export default function Profile() {
  const [user, setUser] = useState({
    ime: "",
    prezime: "",
    email: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalField, setModalField] = useState(""); // 'ime' ili 'prezime'
  const [newIme, setNewIme] = useState("");
  const [newPrezime, setNewPrezime] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUser({
          ime: decodedToken.FirstName || "nepoznato",
          prezime: decodedToken.LastName || "nepoznato",
          email:
            decodedToken[
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
            ] || "nepoznato",
        });
      } catch (error) {
        console.error("Nevalidan JWT token:", error);
      }
    }
  }, []);

  const handleEdit = (field) => {
    setModalField(field);
    setIsModalOpen(true);
    setErrorMessage("");
    if (field === "ime") {
      setNewIme(user.ime);
    } else if (field === "prezime") {
      setNewPrezime(user.prezime);
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
  
    const updatedUser = {
      ...user,
      ime: modalField === "ime" ? newIme : user.ime,
      prezime: modalField === "prezime" ? newPrezime : user.prezime,
    };
  
    try {
      const token = localStorage.getItem("jwtToken");
      //console.log(token);
      const response = await fetch("https://localhost:7151/api/ChangeUserData/update", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        body: JSON.stringify({
          FirstName: updatedUser.ime,
          LastName: updatedUser.prezime,
          OldPassword: "", // Dodati ako je potrebno
          NewPassword: "", // Dodati ako je potrebno
        }),
      });
      //console.log(`Bearer ${token}`);
      if (response.ok) {
        setUser(updatedUser);
        setIsModalOpen(false);
        alert("Podaci su uspešno ažurirani!");
      } else {
        // Proverite da li je odgovor JSON
        const textResponse = await response.text();
        try {
          const errorData = JSON.parse(textResponse);
          setErrorMessage(errorData.message || "Greška prilikom ažuriranja podataka.");
        } catch (error) {
          // Ako nije validan JSON, prikažite sirovi tekst
          setErrorMessage(textResponse || "Greška prilikom ažuriranja podataka.");
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
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <div className="modal-buttons">
              <button onClick={handleSaveModal}>Sačuvaj</button>
              <button onClick={handleCloseModal}>Zatvori</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
