import React, { useState } from "react";

const RoleRequestForm = ({ onSubmit, onClose, isOpen }) => {
  const [biography, setBiography] = useState("");
  const [image, setImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (biography.length < 10) {
      setErrorMessage("Biography must be at least 10 characters long.");
      return;
    }
    if (!image) {
      setErrorMessage("Please select an image.");
      return;
    }

    // Create FormData and append only biography and image
    const formData = new FormData();
    formData.append("biography", biography);
    formData.append("image", image);

    // The firstName and lastName will be extracted from the token on the server side
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h3>Pošalji zahtev</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <textarea
            placeholder="Biografija"
            value={biography}
            onChange={(e) => setBiography(e.target.value)}
          />
          {errorMessage && biography.length < 10 && (
            <p className="error-message">{errorMessage}</p>
          )}
        </div>
        <div className="form-group">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
          {errorMessage && !image && (
            <p className="error-message">{errorMessage}</p>
          )}
        </div>
        <div className="button-group">
          <button type="submit" className="submit-btn">
            Pošalji
          </button>
          <button type="button" onClick={onClose} className="cancel-btn">
            Zatvori
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoleRequestForm;