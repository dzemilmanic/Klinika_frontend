import React, { useEffect, useState } from "react";
import './AddServiceModal.css';
const AddServiceModal = ({
  newService,
  setNewService,
  handleAddService,
  setShowModal,
}) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Funkcija za preuzimanje kategorija sa API-ja
  const fetchCategories = async () => {
    try {
      const response = await fetch("https://localhost:7151/api/ServiceCategory", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Greška prilikom preuzimanja kategorija.");
      }
      const data = await response.json();
      setCategories(data); // Postavi preuzete kategorije
    } catch (err) {
      console.error("Greška:", err.message);
    }
  };

  // Funkcija za preuzimanje podataka o selektovanoj kategoriji
  const fetchCategoryData = async (categoryId) => {
    try {
      const response = await fetch(
        `https://localhost:7151/api/ServiceCategory/${categoryId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Greška prilikom preuzimanja podataka o kategoriji.");
      }
      const data = await response.json();
      setSelectedCategory(data); // Postavi preuzete podatke o kategoriji
    } catch (err) {
      console.error("Greška:", err.message);
    }
  };

  // Učitavanje kategorija prilikom montaže komponente
  useEffect(() => {
    fetchCategories();
  }, []);

  // Funkcija za dodavanje nove usluge
  const handleFormSubmit = async (e) => {
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
          category: selectedCategory, 
        }),
      });

      if (!response.ok) {
        throw new Error("Greška prilikom dodavanja usluge.");
      }

      const data = await response.json();
      //console.log("Uspešno dodata usluga:", data);
      setShowModal(false); // Zatvaranje modala
      setNewService({
        name: "",
        description: "",
        price: "",
        categoryId: "",
      }); // Resetovanje forme
      setSelectedCategory(null);
      alert("Usluga je uspešno dodata!");
      window.location.reload()
    } catch (err) {
      console.error("Greška:", err.message);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Dodaj novu uslugu</h3>
        <form onSubmit={handleFormSubmit}>
          <div>
            <label>Naziv:</label>
            <input
              type="text"
              value={newService.name}
              onChange={(e) =>
                setNewService({ ...newService, name: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label>Opis:</label>
            <textarea
              value={newService.description}
              onChange={(e) =>
                setNewService({ ...newService, description: e.target.value })
              }
              required
            ></textarea>
          </div>
          <div>
            <label>Cena:</label>
            <input
              type="number"
              value={newService.price}
              onChange={(e) =>
                setNewService({ ...newService, price: e.target.value })
              }
              required
            />
          </div>
          <div className="service-category">
            <label>Kategorija:</label>
            <select
              value={newService.categoryId}
              onChange={(e) => {
                const selectedCategoryId = e.target.value;
                setNewService({ ...newService, categoryId: selectedCategoryId });
                fetchCategoryData(selectedCategoryId); // Preuzimanje podataka o selektovanoj kategoriji
              }}
              required
            >
              <option value="">Izaberite kategoriju</option>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              ) : (
                <option value="">Nema dostupnih kategorija</option>
              )}
            </select>
          </div>
          <button type="submit">Dodaj</button>
          <button type="button" onClick={() => setShowModal(false)}>
            Otkaži
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddServiceModal;