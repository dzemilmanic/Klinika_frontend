import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  MapPin,
  Phone,
  Heart,
  Users,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import "./Home.css";
import ReviewSection from "../../components/Home/ReviewSection";
import { toast } from "react-toastify";

const Home = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isAddReviewModalOpen, setAddReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ rating: "", content: "" });
  const [userRole, setUserRole] = useState("");
  const [showSplash, setShowSplash] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const slides = [
    {
      url: "https://dzemil.blob.core.windows.net/slike/klinika1.jpeg",
      title: "klinika1",
    },
    {
      url: "https://dzemil.blob.core.windows.net/slike/klinika2.jpeg",
      title: "klinika2",
    },
    {
      url: "https://dzemil.blob.core.windows.net/slike/klinika5.jpg",
      title: "klinika5",
    },
    {
      url: "https://dzemil.blob.core.windows.net/slike/klinika6.jpg",
      title: "klinika6",
    },
    {
      url: "https://dzemil.blob.core.windows.net/slike/klinika7.jpg",
      title: "klinika7",
    },
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

  const checkUserRole = () => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      try {
        const payload = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payload));
        const roles =
          decodedPayload[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ] || "";
        setUserRole(roles);
      } catch (error) {
        setError("Error decoding token.");
      }
    }
  };
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://klinikabackend-production.up.railway.app/api/Service",
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Greška prilikom fetchovanja usluga.");
        }

        const data = await response.json();
        setServices(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    checkUserRole();
    fetchServices();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        "https://klinikabackend-production.up.railway.app/api/Review"
      );
      if (!response.ok) {
        throw new Error("Greška prilikom dohvatanja recenzija");
      }
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error(error.message);
    }
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
    setNewReview({ rating: "", content: "" }); // Resetuj formu
  };

  const handleAddReview = async (newReview) => {
    try {
      const response = await fetch(
        "https://klinikabackend-production.up.railway.app/api/Review",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
          body: JSON.stringify(newReview),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          toast.error(`${errorData.message}`); // Prikazuje poruku greške sa servera
        } else {
          toast.error("Došlo je do greške prilikom dodavanja recenzije.");
        }
        return;
      }

      // Ako je uspešno, dodajte recenziju i osvežite listu
      setReviews((prevReviews) => [...prevReviews, newReview]);
      fetchReviews(); // Osvežavanje liste recenzija
      toast.success("Recenzija je uspešno dodata!");
    } catch (error) {
      console.error("Greška prilikom dodavanja recenzije:", error);
      toast.error("Došlo je do greške prilikom povezivanja sa serverom.");
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteReview = (reviewId) => {
    setReviews((prevReviews) =>
      prevReviews.filter((review) => review.id !== reviewId)
    );
  };
  const workingHours = [
    { day: "Ponedeljak - Petak", hours: " 08:00 - 16:30" },
    { day: "Subota", hours: " 09:00 - 12:00" },
    { day: "Nedelja", hours: " Zatvoreno" },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setShowSplash(false);
      }, 700);
    }, 1400);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="home-page">
        <div className={`splash-container ${isExiting ? "exiting" : ""}`}>
          <img
            src="https://dzemil.blob.core.windows.net/slike/oculus.png"
            alt="Splash Logo"
            className={`splash-image ${isExiting ? "exiting" : ""}`}
          />
        </div>
      </div>
    );
  }

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
            className={`slide ${
              currentIndex === slideIndex ? "slide-active" : ""
            }`}
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
              
            </div>
          ))}
        </div>
      </div>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="section-content">
          <h2>Naša Misija</h2>
          <p>
            U Oculus očnoj klinici, naša misija je da pružimo vrhunsku
            oftalmološku negu koristeći najsavremeniju tehnologiju i stručnost
            našeg medicinskog tima. Posvećeni smo očuvanju i poboljšanju vida
            naših pacijenata kroz personalizovani pristup i kontinuiranu
            edukaciju.
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
          {loading ? (
            <p>Učitavanje usluga...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : (
            <div className="services-grid">
              {services.map((service, index) => (
                <div key={index} className="service-card">
                  <CheckCircle2 className="icon" />
                  <p>{service.name}</p>
                </div>
              ))}
            </div>
          )}
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
                <p>020/123-456</p>
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

      <ReviewSection
        reviews={reviews}
        onAddReview={handleAddReview}
        onDeleteReview={handleDeleteReview}
        role={userRole}
      />
    </div>
  );
};

export default Home;
