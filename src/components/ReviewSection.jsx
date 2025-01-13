import React, { useState, useRef, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { Trash2 } from "lucide-react";
import "./ReviewSection.css";

const ReviewSection = ({ reviews, onAddReview, onDeleteReview, role }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isAddReviewModalOpen, setAddReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ rating: "", content: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleCloseModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  const handleShowAllReviews = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleShowAddReviewModal = () => {
    setAddReviewModalOpen(true);
  };

  const handleCloseAddReviewModal = () => {
    setAddReviewModalOpen(false);
    setNewReview({ rating: "", content: "" });
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("jwtToken");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const authorName = `${decodedToken.FirstName || "nepoznato"} ${decodedToken.LastName || "nepoznato"}`;
  
        // Dodaj authorName u telo recenzije
        const reviewWithAuthor = { ...newReview, authorName };
  
        // Pozivanje funkcije za dodavanje recenzije
        onAddReview(reviewWithAuthor)
          .then(() => {
            handleCloseAddReviewModal();
            setNewReview({ rating: "", content: "" });
            setErrorMessage("");
          })
          .catch((error) => {
            setErrorMessage("Došlo je do greške pri slanju recenzije.");
          });
      } catch (error) {
        console.error("Nevalidan JWT token:", error);
        setErrorMessage("Došlo je do greške pri dekodiranju tokena.");
      }
    } else {
      setErrorMessage("Korisnik nije prijavljen.");
    }
  };
  const handleShowDeleteModal = (reviewId) => {
    setReviewToDelete(reviewId);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setReviewToDelete(null);
  };

  const handleDeleteReview = async () => {
    if (reviewToDelete) {
      try {
        const token = localStorage.getItem("jwtToken");
        const response = await fetch(`https://localhost:7151/api/Review/${reviewToDelete}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          onDeleteReview(reviewToDelete); // Ažuriraj prikaz recenzija nakon brisanja
          setDeleteModalOpen(false);
          setReviewToDelete(null);
        } else {
          const errorData = await response.json();
          alert(errorData.Message || "Došlo je do greške pri brisanju recenzije.");
        }
      } catch (error) {
        console.error("Greška pri brisanju recenzije:", error);
        alert("Došlo je do greške. Pokušajte ponovo.");
      }
    }
  };

  return (
    
    <section className="reviews-section">
      <div className="section-content">
        <h2>Recenzije</h2>
        <div className="reviews-grid">
          {reviews.slice(0, 3).map((review) => (
            <div key={review.id} className="review-item">
              <div className="review-rating">⭐ {review.rating}/5</div>
              <p className="review-content">{review.content}</p>
              <p className="review-author">
                Autor: {review.authorName}
                
              </p>
              <p className="review-date">
                Datum: {new Date(review.createdOn).toLocaleDateString()}
              </p>
              {role === "Admin" && (
                <button
                  className="delete-button"
                  title="Obriši recenziju"
                  onClick={() => {
                    setReviewToDelete(review.id);
                    setDeleteModalOpen(true);
                  }}
                >
                  <Trash2 size={18} className="text-red-500 hover:text-red-700" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="review-actions">
          <button className="show-all-button" onClick={handleShowAllReviews}>
            Prikaži sve recenzije
          </button>
          {role === "User" && (
            <button
              className="add-review-button"
              onClick={handleShowAddReviewModal}
            >
              Napiši recenziju
            </button>
          )}
        </div>

        {isModalOpen && (
        <div className="modal-review">
          <div ref={modalRef} className="modal-review-content modal-content-wide">
            <div className="modal-review-header">
              <h3>Sve recenzije</h3>
              <button className="close-button" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="reviews-grid-modal">
                {reviews.map((review) => (
                  <div key={review.id} className="review-item">
                    <div className="review-rating">⭐ {review.rating}/5</div>
                    <p className="review-content">{review.content}</p>
                    <p className="review-author">
                      Autor: {review.authorName || "Nepoznato"}
                    </p>
                    <p className="review-date">
                      Datum: {new Date(review.createdOn).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

        {isAddReviewModalOpen && (
          <div className="modal-review">
            <div className="modal-review-content">
              <div className="modal-review-header">
                <h3>Dodaj recenziju</h3>
                <button
                  className="close-button"
                  onClick={handleCloseAddReviewModal}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <form className="review-form" onSubmit={handleSubmitReview}>
                  <div className="form-group">
                    <label>Ocena (1-5):</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={newReview.rating}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value >= 1 && value <= 5) {
                          setNewReview({ ...newReview, rating: value });
                        }
                      }}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Komentar:</label>
                    <textarea
                      value={newReview.content}
                      onChange={(e) =>
                        setNewReview({ ...newReview, content: e.target.value })
                      }
                      required
                    />
                  </div>
                  <button type="submit" className="submit-button">
                    Pošalji
                  </button>
                </form>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
              </div>
            </div>
          </div>
        )}

{deleteModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Potvrda brisanja</h3>
                <button className="close-button" onClick={handleCloseDeleteModal}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <p>Da li ste sigurni da želite da obrišete ovu recenziju?</p>
                <div className="modal-actions">
                  <button className="cancel-button" onClick={() => {
              setDeleteModalOpen(false);
              setReviewToDelete(null);
            }}>
                    Odustani
                  </button>
                  <button className="confirm-button" onClick={handleDeleteReview}>
                    Obriši
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default ReviewSection;
