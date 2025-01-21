import React, { useState, useRef, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { Trash2, ChevronLeft, ChevronRight, Star } from "lucide-react";
import "./ReviewSection.css";
import { toast } from "react-toastify";

const ReviewSection = ({ reviews, onAddReview, onDeleteReview, role }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isAddReviewModalOpen, setAddReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, content: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [userHasReview, setUserHasReview] = useState(false);

  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleCloseModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  const handlePrevSlide = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === 0 ? reviews.length - 1 : prevIndex - 1
    );
  };

  const handleNextSlide = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
    );
  };

  const getSlideClassName = (index) => {
    if (index === activeIndex) return "review-item active";
    if (index === (activeIndex - 1 + reviews.length) % reviews.length)
      return "review-item prev";
    if (index === (activeIndex + 1) % reviews.length) return "review-item next";
    return "review-item";
  };

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
    setNewReview({ rating: 0, content: "" });
    setHoverRating(0);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("jwtToken");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const authorName = `${decodedToken.FirstName || "nepoznato"} ${
          decodedToken.LastName || "nepoznato"
        }`;
        const reviewWithAuthor = { ...newReview, authorName };
        try {
          const response = await onAddReview(reviewWithAuthor);

          if (response && response.status === 201) {
            handleCloseAddReviewModal();
            setNewReview({ rating: 0, content: "" });
            setErrorMessage("");
            toast.success("Recenzija je uspešno kreirana!");
          }
        } catch (error) {
          if (error.response && error.response.data) {
            const { error: isError, message } = error.response.data;

            if (isError && message) {
              toast.error(message); // Prikazuje poruku sa backend-a
            } else {
              toast.error("Došlo je do greške pri slanju recenzije.");
            }
          } else {
            toast.error("Došlo je do greške pri slanju recenzije.");
          }
        }
      } catch (error) {
        toast.error("Došlo je do greške pri dekodiranju tokena.");
      }
    } else {
      toast.error("Korisnik nije prijavljen.");
    }
  };

  const checkIfUserHasReview = async () => {
    try {
      const response = await fetch(
        "https://klinikabackend-production.up.railway.app/api/Review/user-review",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserHasReview(data.hasReview);
      } else {
        console.error("Greška pri proveri recenzije.");
      }
    } catch (error) {
      console.error("Greška pri komunikaciji sa serverom:", error);
    }
  };

  useEffect(() => {
    checkIfUserHasReview();
  }, []);

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
        const response = await fetch(
          `https://klinikabackend-production.up.railway.app/api/Review/${reviewToDelete}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          onDeleteReview(reviewToDelete);
          setDeleteModalOpen(false);
          setReviewToDelete(null);
          toast.success("Recenzija uspešno izbrisana!");
        } else {
          const errorData = await response.json();
          toast.error(
            errorData.Message || "Došlo je do greške pri brisanju recenzije."
          );
        }
      } catch (error) {
        console.error("Greška pri brisanju recenzije:", error);
        toast.error("Došlo je do greške. Pokušajte ponovo.");
      }
    }
  };

  const StarRating = ({ rating }) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className="star">
          {i < rating ? "★" : "☆"}
        </span>
      );
    }
    return <div className="stars-container">{stars}</div>;
  };

  return (
    <section className="reviews-section">
      <div className="section-content">
        <h2>Recenzije</h2>

        <div className="reviews-carousel">
          <button className="carousel-button prev" onClick={handlePrevSlide}>
            <ChevronLeft size={24} />
          </button>

          {reviews.map((review, index) => (
            <div key={review.id} className={getSlideClassName(index)}>
              <div className="review-rating">
                <StarRating rating={review.rating} />
              </div>
              <p className="review-content">{review.content}</p>
              <p className="review-author">Autor: {review.authorName}</p>
              <p className="review-date">
                Datum: {new Date(review.createdOn).toLocaleDateString()}
              </p>
              {role === "Admin" && (
                <button
                  className="delete-button"
                  title="Obriši recenziju"
                  onClick={() => handleShowDeleteModal(review.id)}
                >
                  <Trash2
                    size={18}
                    className="text-red-500 hover:text-red-700"
                  />
                </button>
              )}
            </div>
          ))}

          <button className="carousel-button next" onClick={handleNextSlide}>
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="review-actions">
          {role === "User" && !userHasReview && (
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
            <div
              ref={modalRef}
              className="modal-review-content modal-content-wide"
            >
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
                      <div className="review-rating">
                        <StarRating rating={review.rating} />
                      </div>
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
                    <label>Ocena:</label>
                    <div className="stars-interactive">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="star-button"
                          onClick={() =>
                            setNewReview({ ...newReview, rating: star })
                          }
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                        >
                          <Star
                            size={24}
                            className={`${
                              star <= (hoverRating || newReview.rating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
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
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={newReview.rating === 0}
                  >
                    Pošalji
                  </button>
                </form>
                {errorMessage && (
                  <p className="error-message">{errorMessage}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {deleteModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Potvrda brisanja</h3>
                <button
                  className="close-button"
                  onClick={handleCloseDeleteModal}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <p>Da li ste sigurni da želite da obrišete ovu recenziju?</p>
                <div className="modal-actions">
                  <button
                    className="cancel-button"
                    onClick={handleCloseDeleteModal}
                  >
                    Odustani
                  </button>
                  <button
                    className="confirm-button"
                    onClick={handleDeleteReview}
                  >
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
