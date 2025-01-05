import React, { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import "./News.css";

const NewsCard = ({
  id,
  title,
  content,
  publishedDate,
  isAdmin,
  onEdit,
  onDelete,
}) => (
  <div className="news-card">
    <div className="news-card-header">
      <h3>{title}</h3>
      {isAdmin && (
        <div className="news-card-actions">
          <button
            className="icon-button"
            title="Izmeni vest"
            onClick={() => onEdit(id)}
          >
            <Pencil size={18} className="text-blue-500 hover:text-blue-700" />
          </button>
          <button
            className="icon-button"
            title="Obriši vest"
            onClick={() => onDelete(id)}
          >
            <Trash2 size={18} className="text-red-500 hover:text-red-700" />
          </button>
        </div>
      )}
    </div>
    <p>{content}</p>
    <small>{new Date(publishedDate).toLocaleDateString()}</small>
  </div>
);

const AddNewsModal = ({
  isOpen,
  onClose,
  onAdd,
  title,
  setTitle,
  content,
  setContent,
  errorMessage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Dodaj novu vest</h3>
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
        <button onClick={onAdd}>Dodaj vest</button>
        <button onClick={onClose}>Zatvori</button>
      </div>
    </div>
  );
};

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [userRole, setUserRole] = useState("User");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch("https://localhost:7151/api/News");
        if (!response.ok) {
          throw new Error("Došlo je do greške pri učitavanju vesti.");
        }
        const data = await response.json();
        setNews(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchNews();

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
        setError("Greška pri dekodiranju tokena.");
      }
    }
  }, []);

  const handleAddNews = async () => {
    if (newTitle.length < 2 || newContent.length < 10) {
      setErrorMessage(
        "Naslov mora imati najmanje 2 slova, a sadržaj najmanje 10 slova."
      );
      return;
    }

    const token = localStorage.getItem("jwtToken");
    try {
      const newNews = {
        title: newTitle,
        content: newContent,
        publishedDate: new Date().toISOString(),
      };

      const response = await fetch("https://localhost:7151/api/News", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newNews),
      });

      if (!response.ok) {
        throw new Error("Došlo je do greške pri dodavanju vesti.");
      }

      const addedNews = await response.json();
      setNews([addedNews, ...news]);
      setIsModalOpen(false);
      setNewTitle("");
      setNewContent("");
      setErrorMessage(""); // Resetovanje greške nakon uspešnog dodavanja
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
        throw new Error("Došlo je do greške pri brisanju vesti.");
      }

      setNews(news.filter((newsItem) => newsItem.id !== id));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditNews = (id) => {
    // Implementacija otvaranja modalnog prozora za izmenu vesti
    console.log("Izmeni vest sa ID:", id);
  };

  if (loading) return <h2>Učitavanje...</h2>;
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
                id={newsItem.id}
                title={newsItem.title}
                content={newsItem.content}
                publishedDate={newsItem.publishedDate}
                isAdmin={isAdmin}
                onEdit={handleEditNews}
                onDelete={handleDeleteNews}
              />
            ))
          )}
        </div>

        <AddNewsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddNews}
          title={newTitle}
          setTitle={setNewTitle}
          content={newContent}
          setContent={setNewContent}
          errorMessage={errorMessage}
        />
      </div>
    </div>
  );
};

export default News;
