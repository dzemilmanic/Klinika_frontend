import React, { useEffect, useState } from "react";
import "./Services.css";
import AddServiceModal from "../../components/AddServiceModal";

const Services = () => {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const response = await fetch("https://localhost:7151/api/Service", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Greška prilikom fetchovanja usluga.");
        }

        const data = await response.json();
        setServices(data);

        const token = localStorage.getItem("jwtToken");
        if (token) {
          const payload = token.split(".")[1];
          const decodedPayload = JSON.parse(atob(payload));
          const roles =
            decodedPayload[
              "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            ] || "User";
          setRole(roles);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://localhost:7151/api/Service", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
        body: JSON.stringify({
            name: newService.name,
            price: parseFloat(newService.price),
            description: newService.description,
            categoryId: newService.categoryId,
            category: {
                id: newService.categoryId, // Dodavanje celog objekta kategorije
              },
          }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData?.errors
            ? Object.values(errorData.errors).flat().join(", ")
            : "Greška prilikom dodavanja usluge."
        );
      }

      const data = await response.json();
      setServices((prevServices) => [...prevServices, data]);
      setShowModal(false);
      setNewService({
        name: "",
        description: "",
        price: "",
        categoryId: "",
      });
    } catch (err) {
        alert(`Greška: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="services-page">
        <div className="loader">
          <div className="loader-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="services-page">
        <div className="error">
          <div className="error-content">
            <strong>Error: </strong>
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="services-page">
      <div className="services-container">
        <div className="header-section">
          <h2>Naše usluge</h2>
          {role === "Admin" && (
            <button
              onClick={() => setShowModal(true)}
              className="add-service-btn"
            >
              Dodaj novu uslugu
            </button>
          )}
        </div>

        {showModal && (
          <AddServiceModal
            newService={newService}
            setNewService={setNewService}
            handleAddService={handleAddService}
            setShowModal={setShowModal}
          />
        )}

        {services.length === 0 ? (
          <p className="no-services">Nema dodatih usluga.</p>
        ) : (
          <div className="services-grid">
            {services.map((service) => (
              <div key={service.id} className="service-card">
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <p>Cena: {service.price} RSD</p>
                {service.category && <p>Kategorija: {service.category.name}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
