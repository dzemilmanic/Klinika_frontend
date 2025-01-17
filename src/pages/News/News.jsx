import React, { useState, useEffect } from "react";
import { ArrowUpDown } from "lucide-react";
import NewsCard from "../../components/NewsCard";
import AddNewsModal from "../../components/AddNewsModal";
import "./News.css";

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [editNews, setEditNews] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newsToDeleteId, setNewsToDeleteId] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc"); // "desc" for newest first, "asc" for oldest first
  const [userRole, setUserRole] = useState("User");

  useEffect(() => {
    fetchNews();
    checkUserRole();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch("https://localhost:7151/api/News");
      if (!response.ok) {
        throw new Error("Error loading news.");
      }
      const data = await response.json();
      setNews(data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const toggleSortOrder = () => {
    const newSortOrder = sortOrder === "desc" ? "asc" : "desc";
    setSortOrder(newSortOrder);
    const sortedNews = [...news].sort((a, b) => {
      const dateA = new Date(a.publishedDate).getTime();
      const dateB = new Date(b.publishedDate).getTime();
      return newSortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
    setNews(sortedNews);
  };

  const checkUserRole = () => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      try {
        const payload = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payload));
        const roles =
          decodedPayload[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ] || "User";
        setUserRole(roles);
      } catch (error) {
        setError("Error decoding token.");
      }
    }
  };

  const handleAddNews = async (title, content) => {
    if (title.length < 2 || content.length < 10) {
      setErrorMessage(
        "Title must have at least 2 characters and content at least 10 characters."
      );
      return;
    }

    const token = localStorage.getItem("jwtToken");
    try {
      const response = await fetch("https://localhost:7151/api/News", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          publishedDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Error adding news.");
      }

      const addedNews = await response.json();
      setNews([addedNews, ...news]);
      setIsModalOpen(false);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleEditNews = (id) => {
    const newsToEdit = news.find((item) => item.id === id);
    setEditNews(newsToEdit);
    setIsModalOpen(true);
  };

  const handleEditNewsSubmit = async (title, content) => {
    if (title.length < 2 || content.length < 10) {
      setErrorMessage(
        "Title must have at least 2 characters and content at least 10 characters."
      );
      return;
    }

    const token = localStorage.getItem("jwtToken");
    try {
      const response = await fetch(
        `https://localhost:7151/api/News/${editNews.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: editNews.id,
            title,
            content,
            publishedDate: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error updating news.");
      }

      const updatedNewsData = await response.json();
      setNews(
        news.map((item) =>
          item.id === updatedNewsData.id ? updatedNewsData : item
        )
      );
      setEditNews(null);
      setIsModalOpen(false);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleDeleteNewsIconClick = (id) => {
    setNewsToDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    const token = localStorage.getItem("jwtToken");
    try {
      const response = await fetch(
        `https://localhost:7151/api/News/${newsToDeleteId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error deleting news.");
      }

      setNews(news.filter((item) => item.id !== newsToDeleteId));
      alert("Vest uspešno izbrisana!");
      setShowDeleteModal(false);
      setNewsToDeleteId(null);
    } catch (error) {
      setError(error.message);
      setShowDeleteModal(false);
      setNewsToDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setNewsToDeleteId(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditNews(null);
    setErrorMessage("");
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

  const isAdmin = userRole === "Admin";

  return (
    <div className="news-page">
      <div className="news-container">
        <div className="news-header">
          <h2>Vesti</h2>
          <div className="news-controls">
            <button className="sort-button" onClick={toggleSortOrder}>
              <ArrowUpDown size={20} />
              {sortOrder === "desc" ? "Najnovije prvo" : "Najstarije prvo"}
            </button>
            {isAdmin && (
              <button className="add-news-btn" onClick={() => setIsModalOpen(true)}>
                Dodaj novu vest
              </button>
            )}
          </div>
        </div>

        <div className="news-cards">
          {news.length === 0 ? (
            <p className="no-news-message">Nema još objavljenih vesti.</p>
          ) : (
            news.map((newsItem) => (
              <NewsCard
                key={newsItem.id}
                {...newsItem}
                isAdmin={isAdmin}
                onEdit={handleEditNews}
                onDelete={() => handleDeleteNewsIconClick(newsItem.id)}
              />
            ))
          )}
        </div>

        <AddNewsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onAdd={handleAddNews}
          onEdit={handleEditNewsSubmit}
          errorMessage={errorMessage}
          editNews={editNews}
        />
      </div>
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Da li ste sigurni da želite da obrišete ovu vest?</h3>
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
    </div>
  );
};

export default News;