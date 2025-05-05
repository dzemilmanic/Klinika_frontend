import React, { useState, useEffect } from "react";
import "./AllAppointmentsModal.css";
import { ArrowUpDown, Clock } from "lucide-react";
import { toast } from "react-toastify";

const AllAppointmentsModal = ({ isOpen, onClose, appointments }) => {
  if (!isOpen) return null;

  const [isAddNotesModalOpen, setIsAddNotesModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [note, setNote] = useState("");
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [filters, setFilters] = useState({
    sortBy: "nearest",
    status: "all",
    timeFilter: "all"
  });

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      const payload = token.split(".")[1];
      const decodedPayload = JSON.parse(atob(payload));
      const roles =
        decodedPayload[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ];
      setUserRole(roles);
    }
  }, []);
  
  useEffect(() => {
    const filterAppointments = () => {
      let initialAppointments = [...appointments];
  
      if (userRole === "User") {
        initialAppointments = initialAppointments.filter(
          (app) => app.status !== 2
        );
      }
  
      let filtered = [...initialAppointments];
      
      // Apply time filter (past or all)
      if (filters.timeFilter === "past") {
        filtered = filtered.filter(app => isAppointmentPassed(app.appointmentDate));
      } else if (filters.timeFilter === "upcoming") {
        filtered = filtered.filter(app => !isAppointmentPassed(app.appointmentDate));
      }
  
      // Apply sorting
      const now = new Date();
      if (filters.sortBy === "nearest") {
        filtered.sort((a, b) => {
          const dateA = new Date(a.appointmentDate);
          const dateB = new Date(b.appointmentDate);
          
          // If both are in the future, sort by nearest
          if (dateA > now && dateB > now) {
            return dateA - dateB;
          }
          // If both are in the past, sort by most recent
          else if (dateA < now && dateB < now) {
            return dateB - dateA;
          }
          // Future dates come before past dates
          else {
            return dateA > now ? -1 : 1;
          }
        });
      } else if (filters.sortBy === "furthest") {
        filtered.sort((a, b) => {
          const dateA = new Date(a.appointmentDate);
          const dateB = new Date(b.appointmentDate);
          
          // If both are in the future, sort by furthest
          if (dateA > now && dateB > now) {
            return dateB - dateA;
          }
          // If both are in the past, sort by oldest
          else if (dateA < now && dateB < now) {
            return dateA - dateB;
          }
          // Future dates come before past dates
          else {
            return dateA > now ? -1 : 1;
          }
        });
      }
  
      // Apply status filter
      if (filters.status !== "all") {
        filtered = filtered.filter(
          (app) => app.status === parseInt(filters.status)
        );
      }
  
      setFilteredAppointments(filtered);
    };
  
    filterAppointments();
  }, [appointments, filters, userRole]);

  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return "Čeka se dodela lekara";
      case 1:
        return "Odobren";
      case 2:
        return "Zavrsen";
      case 3:
        return "Otkazan";
      default:
        return "Nepoznato";
    }
  };

  const handleOpenAddNotesModal = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setIsAddNotesModalOpen(true);
  };

  const handleCloseAddNotesModal = () => {
    setIsAddNotesModalOpen(false);
    setSelectedAppointmentId(null);
    setNote("");
  };

  const handleSaveNotes = async () => {
    if (!note.trim()) {
      toast.error("Napomena ne može biti prazna");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `https://klinikabackend-production.up.railway.app/api/Appointment/update-notes/${selectedAppointmentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(note),
        }
      );

      if (response.ok) {
        toast.success("Beleška uspešno dodata!");
        handleCloseAddNotesModal();
      } else {
        toast.error("Greška prilikom dodavanja beleške!");
      }
    } catch (error) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isAppointmentPassed = (appointmentDate) => {
    const now = new Date();
    const appDate = new Date(appointmentDate);
    return appDate < now;
  };

  return (
    <div className="modal-appoints">
      <div className="modal-appoints-content">
        <h3>Vaši termini</h3>

        <div className="filter-section">
          <div className="filter-group">
            <label>Sortiraj po datumu:</label>
            <div className="sort-container">
              <select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
              >
                <option value="nearest">Najskoriji prvo (najbliže u budućnosti)</option>
                <option value="furthest">Najdalji prvo (najdalje u budućnosti)</option>
              </select>
              <ArrowUpDown className="sort-icon" size={20} />
            </div>
            
            {userRole && userRole.includes("Doctor") && (
              <>
                <label>Vreme:</label>
                <div className="sort-container">
                  <select
                    name="timeFilter"
                    value={filters.timeFilter}
                    onChange={handleFilterChange}
                  >
                    <option value="all">Svi termini</option>
                    <option value="past">Prošli termini</option>
                    <option value="upcoming">Budući termini</option>
                  </select>
                  <Clock className="sort-icon" size={20} />
                </div>
              </>
            )}
            
            <label>Status:</label>
            <div className="sort-container">
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="all">Svi statusi</option>
                {userRole === "User" && (
                  <option value="0">Čeka se odobrenje</option>
                )}
                <option value="1">Odobren</option>
                {userRole === "User" && <option value="3">Otkazan</option>}
                {userRole !== "User" && <option value="2">Zavrsen</option>}
              </select>
              <ArrowUpDown className="sort-icon" size={20} />
            </div>
          </div>
        </div>

        <div className="appointments-list-container">
          {filteredAppointments.length > 0 ? (
            <ul>
              {filteredAppointments.map((appointment) => {
                const date = new Date(appointment.appointmentDate);
                const formattedDate = date.toLocaleDateString("sr-RS", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                });
                const formattedTime = date.toLocaleTimeString("sr-RS", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                const appointmentPassed = isAppointmentPassed(appointment.appointmentDate);

                return (
                  <li key={appointment.id} className={appointmentPassed ? "past-appointment" : "upcoming-appointment"}>
                    <strong>Datum:</strong> {formattedDate} <br />
                    <strong>Vreme:</strong> {formattedTime} 
                    <span className={`appointment-time ${appointmentPassed ? "time-past" : "time-future"}`}>
                      {appointmentPassed ? "Prošao" : "Predstoji"}
                    </span><br />
                    <strong>Usluga:</strong> {appointment.serviceName} <br />
                    <strong>Status:</strong> {getStatusText(appointment.status)}{" "}
                    <br />
                    {userRole &&
                      userRole.includes("Doctor") &&
                      appointment.status !== 2 &&
                      appointmentPassed && (
                        <button
                          className="add-notes-btn"
                          onClick={() => handleOpenAddNotesModal(appointment.id)}
                        >
                          Dodaj belešku
                        </button>
                      )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>Nemate zakazane termine.</p>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose}>Zatvori</button>
        </div>
      </div>

      {isAddNotesModalOpen && (
        <>
          <div className="modal-overlay" onClick={handleCloseAddNotesModal} />
          <div className="notes-modal">
            <h3>Dodaj belešku</h3>
            <textarea
              placeholder="Unesite napomene..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="modal-footer">
              <button onClick={handleCloseAddNotesModal}>Zatvori</button>
              <button onClick={handleSaveNotes} disabled={loading}>
                {loading ? "Saving..." : "Spremi"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AllAppointmentsModal;