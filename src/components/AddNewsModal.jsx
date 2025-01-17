import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify';

const AddNewsModal = ({
  isOpen,
  onClose,
  onAdd,
  onEdit,
  errorMessage,
  editNews
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (editNews) {
      setTitle(editNews.title);
      setContent(editNews.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [editNews]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editNews) {
      onEdit(title, content);
      toast.success("Vest uspešno ažurirana");
    } else {
      onAdd(title, content);
      toast.success("Vest uspešno dodata");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>{editNews ? "Uredi vest" : "Dodaj novu vest"}</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Naslov"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {errorMessage && title.length < 2 && (
            <p className="error-message">Naslov mora imati najmanje 2 slova.</p>
          )}
          <textarea
            placeholder="Sadržaj"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          {errorMessage && content.length < 10 && (
            <p className="error-message">Sadržaj mora imati najmanje 10 slova.</p>
          )}
          <div className="modal-users-actions">
            <button type="submit" className="submit-btn">
              {editNews ? "Spremi" : "Dodaj"}
            </button>
            <button type="button" onClick={onClose} className="cancel-btn">
              Zatvori
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddNewsModal