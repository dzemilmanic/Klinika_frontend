import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css"; 

const Home = () => {
  const navigate = useNavigate();

  const slides = [
    { url: "https://apolonocnaklinika.com/wp-content/uploads/2023/12/onama3-min.png", title: "beach" },
    { url: "https://apolonocnaklinika.com/wp-content/uploads/2023/12/zasto6-min.png", title: "boat" },
    { url: "https://apolonocnaklinika.com/wp-content/uploads/2023/12/zasto3-min.png", title: "boat" },
    { url: "https://apolonocnaklinika.com/wp-content/uploads/2023/12/zasto7-min.png", title: "boat" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Funkcija za prebacivanje na prethodni slajd
  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  // Funkcija za prebacivanje na sledeći slajd
  const goToNext = () => {
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  // Funkcija za prebacivanje na specifičan slajd
  const goToSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
  };

  // Automatsko slajdovanje slika
  useEffect(() => {
    const interval = setInterval(() => {
      goToNext();
    }, 3000); // Prebaci na sledeći slajd svakih 3 sekunde

    // Čisti interval kada komponenta bude demontirana
    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <div>
      <div className="slider">
        <div className="welcome-text">Dobrodošli u Oculus</div>
        <div className="reserve-appointment">
        <button
          className="reserve-button"
          onClick={() => navigate("/usluge")}
        >
          Rezerviši svoj termin na vreme!
        </button>
      </div>
        <div>
          <div className="arrow arrow-left" onClick={goToPrevious}>
            ❰
          </div>
          <div className="arrow arrow-right" onClick={goToNext}>
            ❱
          </div>
        </div>
        {/* Renderovanje slajdova sa klasom za aktivni slajd */}
        {slides.map((slide, slideIndex) => (
          <div
            key={slideIndex}
            className={`slide ${currentIndex === slideIndex ? "slide-active" : ""}`}
            style={{ backgroundImage: `url(${slide.url})` }}
          ></div>
        ))}
        <div className="dots-container">
          {slides.map((slide, slideIndex) => (
            <div
              className="dot"
              key={slideIndex}
              onClick={() => goToSlide(slideIndex)}
            >
              ●
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
