import React, { useState, useEffect } from "react";
import axios from "axios";
import "./News.css";

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [userRole, setUserRole] = useState("User"); // Pretpostavljamo da korisnik ima ulogu 'User' po defaultu

  useEffect(() => {
    // Funkcija za dobijanje svih vesti
    const fetchNews = async () => {
      try {
        const response = await axios.get("https://localhost:7151/api/News");
        setNews(response.data);
        setLoading(false);
      } catch (error) {
        setError("Došlo je do greške pri učitavanju vesti.");
        setLoading(false);
      }
    };

    fetchNews();

    // Pretpostavljamo da je ulogovan korisnik sa određenom rolom
    // Ovo bi trebalo da bude implementirano u zavisnosti od autentifikacije
    //setUserRole("Admin"); // Možeš ovo zameniti sa stvarnom logikom za autentifikaciju
    const token = localStorage.getItem("jwtToken");
    if (token) {
      try {
        // Token je u formatu: header.payload.signature
        const payload = token.split(".")[1]; // Uzmi payload deo tokena
        const decodedPayload = atob(payload); // Dekodiraj payload
        const userRole = JSON.parse(decodedPayload).role; // Pretpostavljamo da je 'role' deo payloada
        setUserRole(userRole); // Postavljamo ulogu korisnika
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
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(
        "https://localhost:7151/api/News",
        newNews,
        config
      );
      setNews([response.data, ...news]); // Dodajemo novu vest na početak liste
      setIsModalOpen(false); // Zatvaramo modal
    } catch (error) {
      setError("Došlo je do greške pri dodavanju vesti.");
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
            <button onClick={handleAddNews}>Dodaj vestu</button>
            <button onClick={() => setIsModalOpen(false)}>Zatvori</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default News;
