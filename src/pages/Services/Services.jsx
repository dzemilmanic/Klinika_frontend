import React, { useEffect, useState } from "react";
import "./Services.css";
import AddServiceModal from "../../components/AddServiceModal";
import AppointmentModal from "../../components/AppointmentModal";
import { Pencil, Trash2, Search, ArrowUpDown } from "lucide-react";

const Services = () => {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
  });
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [newPrice, setNewPrice] = useState("");
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState("none"); // none, priceAsc, priceDesc, nameAsc, nameDesc

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const response = await fetch("https://localhost:7151/api/Service", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Greška prilikom fethovanja usluga.");
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
  const fetchCategories = async () => {
    try {
      const response = await fetch("https://localhost:7151/api/ServiceCategory", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        throw new Error("Greška prilikom učitavanja kategorija.");
      }
    } catch (error) {
      console.error("Greška:", error);
    }
  };
  

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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData?.errors
            ? Object.values(errorData.errors).flat().join(", ")
            : "Greška pri dodavanju usluge."
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
      alert("Usluga uspešno dodata!");
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteClick = (id) => {
    setSelectedServiceId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`https://localhost:7151/api/Service/${selectedServiceId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setServices((prevServices) =>
          prevServices.filter((service) => service.id !== selectedServiceId)
        );
        setShowDeleteModal(false);
        alert("Usluga uspešno izbrisana!")
      } else {
        throw new Error("Greška pri brisanju usluge.");
      }
    } catch (err) {
      alert("Greška pri brisanju usluge.");
    }
  };

  const cancelDelete = () => {
    setSelectedServiceId(null);
    setShowDeleteModal(false);
  };

  const handleReserveClick = (service) => {
    if (role === ""){ 
      alert("Morate biti prijavljeni da biste rezervisali termin.");
      return;
    }
    if (!service) {
      console.error("Service is null or undefined");
      return;
    }
    setSelectedService(service);
    setIsAppointmentModalOpen(true);
  };

  const handlePriceChangeClick = (id) => {
    setSelectedServiceId(id);
    setShowPriceModal(true);
  };

  const handleUpdatePrice = async () => {
    if (!newPrice || isNaN(newPrice)) {
      alert("Unesite validnu cenu.");
      return;
    }

    try {
      const response = await fetch(
        `https://localhost:7151/api/Service/${selectedServiceId}/price`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
          body: JSON.stringify({ 
            id: selectedServiceId, 
            price: parseFloat(newPrice)  
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Greška pri ažuriranju cene usluge.");
      }

      setServices((prevServices) =>
        prevServices.map((service) =>
          service.id === selectedServiceId
            ? { ...service, price: parseFloat(newPrice) }
            : service
        )
      );

      alert("Cena uspešno ažurirana!");
      setShowPriceModal(false);
      setNewPrice("");
      setSelectedServiceId(null);
    } catch (err) {
      alert("Greška prilikom ažuriranja cene.");
    }
  };

  const handleAddCategory = async () => {
    if (!name || !description) {
      alert("Molimo popunite sva polja.");
      return;
    }
  
    try {
      const checkResponse = await fetch(`https://localhost:7151/api/ServiceCategory/exists?name=${encodeURIComponent(name)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      });
  
      if (!checkResponse.ok) {
        throw new Error("Greška prilikom provere postojanja kategorije.");
      }
  
      const categoryExists = await checkResponse.json();
      if (categoryExists) {
        alert("Kategorija sa ovim imenom već postoji.");
        return;
      }
  
      const response = await fetch("https://localhost:7151/api/ServiceCategory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
        body: JSON.stringify({ name, description }),
      });
  
      if (response.ok) {
        const newCategory = await response.json();
        onAddCategory(newCategory);
        setShowModal2(false);
        setName("");
        setDescription("");
        alert("Kategorija uspešno dodata!");
      } else {
        alert("Greška prilikom dodavanja kategorije.");
      }
    } catch (error) {
      console.error("Greška:", error);
    }
  };
  

  const onAddCategory = (newCategory) => {
    setCategories((prevCategories) => [...prevCategories, newCategory]);
  };

  useEffect(() => {
    fetchCategories();
  }, []);


  const handleSortChange = (newSortType) => {
    setSortType(newSortType);
  };

  const filteredAndSortedServices = services
    .filter((service) => {
      const searchTerm = searchQuery.toLowerCase();
      return (
        service.name.toLowerCase().includes(searchTerm) ||
        service.description.toLowerCase().includes(searchTerm)
      );
    })
    .sort((a, b) => {
      switch (sortType) {
        case "priceAsc":
          return a.price - b.price;
        case "priceDesc":
          return b.price - a.price;
        case "nameAsc":
          return a.name.localeCompare(b.name);
        case "nameDesc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

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
          <div className="filters-section">
            <div className="search-container">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Pretraži usluge..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="sort-container">
              <select
                value={sortType}
                onChange={(e) => handleSortChange(e.target.value)}
                className="sort-select"
              >
                <option value="none">Sortiraj po...</option>
                <option value="priceAsc">Cena (rastuće)</option>
                <option value="priceDesc">Cena (opadajuće)</option>
                <option value="nameAsc">Naziv (A-Z)</option>
                <option value="nameDesc">Naziv (Z-A)</option>
              </select>
              <ArrowUpDown className="sort-icon" size={20} />
            </div>
          </div>
          {role === "Admin" && (
            <button
              onClick={() => setShowModal(true)}
              className="add-service-btn"
            >
              Dodaj novu uslugu
            </button>
          )}
          {role === "Admin" && (
        <button
          onClick={() => setShowModal2(true)}
          className="add-service-btn"
        >
          Dodaj novu kategoriju
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

        {filteredAndSortedServices.length === 0 ? (
          <p className="no-services">Nema pronađenih usluga.</p>
        ) : (
          <div className="services-grid">
            {filteredAndSortedServices.map((service) => (
              <div key={service.id} className="service-card">
                <div className="service-card-header">
                  <h3>{service.name}</h3>
                  {role === "Admin" && (
                    <div className="service-card-actions">
                      <button
                        className="icon-button"
                        title="Promeni cenu"
                        onClick={() => handlePriceChangeClick(service.id)}
                      >
                        <Pencil
                          size={18}
                          className="text-blue-500 hover:text-blue-700"
                        />
                      </button>
                      <button
                        className="icon-button"
                        title="Obriši uslugu"
                        onClick={() => handleDeleteClick(service.id)}
                      >
                        <Trash2
                          size={18}
                          className="text-red-500 hover:text-red-700"
                        />
                      </button>
                    </div>
                  )}
                </div>
                <p>{service.description}</p>
                <p>Price: {service.price} RSD</p>
                {role !== "Admin" && (
                <button className="reserve-button" onClick={() => handleReserveClick(service)}>
                  Rezerviši termin
                </button>
                )}
              </div>
            ))}
          </div>
        )}
        <AppointmentModal
          isOpen={isAppointmentModalOpen}
          onClose={() => setIsAppointmentModalOpen(false)}
          service={selectedService}
        />
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Da li ste sigurni da želite da obrišete ovu uslugu?</h3>
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
      {showPriceModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Ažuriraj cenu</h3>
            <input
              type="number"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="Unesite novu cenu"
            />
            <div className="modal-actions">
              <button className="confirm-button" onClick={handleUpdatePrice}>
                Sačuvaj
              </button>
              <button
                className="cancel-button"
                onClick={() => setShowPriceModal(false)}
              >
                Otkaži
              </button>
            </div>
          </div>
        </div>
      )}
      {showModal2 && (
        <div className="modal">
          <div className="modal-content">
            <h2>Dodaj novu kategoriju usluge</h2>
            <input
              type="text"
              placeholder="Naziv"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <textarea
              placeholder="Opis"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <button onClick={handleAddCategory}>Dodaj</button>
            <button onClick={() => setShowModal2(false)}>Zatvori</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;