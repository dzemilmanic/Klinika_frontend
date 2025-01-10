import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, MapPin, Phone, Heart, Users, Calendar, CheckCircle2 } from "lucide-react";
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

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      goToNext();
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const workingHours = [
    { day: "Ponedeljak - Petak", hours: " 08:00 - 16:00" },
    { day: "Subota", hours: " 09:00 - 12:00" },
    { day: "Nedelja", hours: " Zatvoreno" }
  ];

  const services = [
    "Kompletan oftalmološki pregled",
    "Laserske intervencije",
    "Operacija katarakte",
    "Dijagnostika očnih bolesti",
    "Korekcija vida",
    "Dečija oftalmologija"
  ];

  return (
    <div className="home-container">
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

      {/* Mission Section */}
      <section className="mission-section">
        <div className="section-content">
          <h2>Naša Misija</h2>
          <p>
            U Oculus očnoj klinici, naša misija je da pružimo vrhunsku oftalmološku negu 
            koristeći najsavremeniju tehnologiju i stručnost našeg medicinskog tima. 
            Posvećeni smo očuvanju i poboljšanju vida naših pacijenata kroz personalizovani 
            pristup i kontinuiranu edukaciju.
          </p>
          <div className="mission-points">
            <div className="mission-point">
              <Heart className="icon" />
              <h3>Briga o pacijentima</h3>
              <p>Individualni pristup svakom pacijentu</p>
            </div>
            <div className="mission-point">
              <Users className="icon" />
              <h3>Stručni tim</h3>
              <p>Iskusni oftalmolozi i medicinsko osoblje</p>
            </div>
            <div className="mission-point">
              <CheckCircle2 className="icon" />
              <h3>Kvalitet</h3>
              <p>Najviši standardi medicinske nege</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="section-content">
          <h2>Naše Usluge</h2>
          <div className="services-grid">
            {services.map((service, index) => (
              <div key={index} className="service-card">
                <CheckCircle2 className="icon" />
                <p>{service}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Working Hours Section */}
      <section className="working-hours-section">
        <div className="section-content">
          <h2>Radno Vreme</h2>
          <div className="working-hours-container">
            <div className="hours-list">
              {workingHours.map((schedule, index) => (
                <div key={index} className="hours-item">
                  <Clock className="icon" />
                  <div className="hours-text">
                    <strong>{schedule.day}</strong>
                    <span>{schedule.hours}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="section-content">
          <h2>Kontakt Informacije</h2>
          <div className="contact-grid">
            <div className="contact-item">
              <MapPin className="icon" />
              <div>
                <h3>Adresa</h3>
                <p>Pešterska 17, Tutin</p>
              </div>
            </div>
            <div className="contact-item">
              <Phone className="icon" />
              <div>
                <h3>Telefon</h3>
                <p>021/123-456</p>
                <p>060/123-4567</p>
              </div>
            </div>
            <div className="contact-item">
              <Calendar className="icon" />
              <div>
                <h3>Zakazivanje</h3>
                <button 
                  className="appointment-button"
                  onClick={() => navigate("/usluge")}
                >
                  Zakaži pregled
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;