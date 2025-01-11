import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";
import "./ReviewSection.css";

const ReviewSection = ({ reviews, onAddReview, role }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isAddReviewModalOpen, setAddReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ rating: "", content: "" });
  const [errorMessage, setErrorMessage] = useState("");
  
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
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Sve recenzije</h3>
                <button className="close-button" onClick={handleCloseModal}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                {reviews.map((review) => (
                  <div key={review.id} className="review-item">
                    <div className="review-rating">⭐ {review.rating}/5</div>
                    <p className="review-content">{review.content}</p>
                    <p className="review-author">
                      Autor: {review.author?.firstName || "Nepoznato"}
                    </p>
                    <p className="review-date">
                      Datum: {new Date(review.createdOn).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {isAddReviewModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
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
      </div>
    </section>
  );
};

export default ReviewSection;
