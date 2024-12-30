import React, { useState, useEffect } from "react";
import "./News.css";

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [userRole, setUserRole] = useState("User"); // Default uloga

  useEffect(() => {
    // Funkcija za dobijanje svih vesti
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

    // Provera tokena i postavljanje uloge
    const token = localStorage.getItem("jwtToken");
    if (token) {
      try {
        // Ekstraktujemo payload iz tokena
        const payload = token.split(".")[1]; // Srednji deo tokena
        const decodedPayload = JSON.parse(atob(payload)); // Dekodiramo payload
        const roles = decodedPayload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "User"; // Ako nema uloge, postavljamo "User"
        setUserRole(roles); // Postavljamo ulogu korisnika
       } catch (error) {
        setError("Greška pri dekodiranju tokena.");
      }
    }
  }, []);

  const handleAddNews = async () => {
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
      setNews([addedNews, ...news]); // Dodajemo novu vest na početak liste
      setIsModalOpen(false); // Zatvaramo modal
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) return <h2>Učitavanje...</h2>;
  if (error) return <h2>{error}</h2>;

  return (
    <div className="news-container">
      <h2>Vesti</h2>

      {userRole === "Admin" && (
        <button className="add-news-btn" onClick={() => setIsModalOpen(true)}>
          Dodaj novu vest
        </button>
      )}

      <div className="news-cards">
        {news.map((newsItem) => (
          <div key={newsItem.id} className="news-card">
            <h3>{newsItem.title}</h3>
            <p>{newsItem.content}</p>
            <small>
              {new Date(newsItem.publishedDate).toLocaleDateString()}
            </small>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Dodaj novu vest</h3>
            <input
              type="text"
              placeholder="Naslov"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <textarea
              placeholder="Sadržaj"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            />
            <button onClick={handleAddNews}>Dodaj vest</button>
            <button onClick={() => setIsModalOpen(false)}>Zatvori</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default News;
