import React, { useState, useEffect } from "react";
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

  const checkUserRole = () => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      try {
        const payload = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payload));
        const roles = decodedPayload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "User";
        setUserRole(roles);
      } catch (error) {
        setError("Error decoding token.");
      }
    }
  };

  const handleAddNews = async (title, content) => {
    if (title.length < 2 || content.length < 10) {
      setErrorMessage("Title must have at least 2 characters and content at least 10 characters.");
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
      setErrorMessage("Title must have at least 2 characters and content at least 10 characters.");
      return;
    }

    const token = localStorage.getItem("jwtToken");
    try {
      const response = await fetch(`https://localhost:7151/api/News/${editNews.id}`, {
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
      });

      if (!response.ok) {
        throw new Error("Error updating news.");
      }

      const updatedNewsData = await response.json();
      setNews(news.map((item) => (item.id === updatedNewsData.id ? updatedNewsData : item)));
      setTitle("");
    setContent("");
    setEditNews(null);
    setIsModalOpen(false);
    setErrorMessage("");

    console.log("News updated successfully!");
      //window.location.reload();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleDeleteNews = async (id) => {
    const token = localStorage.getItem("jwtToken");
    try {
      const response = await fetch(`https://localhost:7151/api/News/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error deleting news.");
      }

      setNews(news.filter((item) => item.id !== id));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditNews(null);
    setErrorMessage("");
  };

  if (loading) return <h2>Loading...</h2>;
  if (error) return <h2>{error}</h2>;

  const isAdmin = userRole === "Admin";

  return (
    <div className="news-page">
      <div className="news-container">
        <h2>Vesti</h2>

        {isAdmin && (
          <button className="add-news-btn" onClick={() => setIsModalOpen(true)}>
            Dodaj novu vest
          </button>
        )}

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
                onDelete={handleDeleteNews}
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
    </div>
  );
};

export default News;