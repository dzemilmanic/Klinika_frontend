import React, { useState, useEffect } from 'react';
import './AllAppointmentsModal.css';
import { ArrowUpDown } from "lucide-react";


const AllAppointmentsModal = ({ isOpen, onClose, appointments }) => {
  if (!isOpen) return null;

  const [isAddNotesModalOpen, setIsAddNotesModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [note, setNote] = useState('');
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [filters, setFilters] = useState({
    sortBy: 'newest',
    status: 'all'
  });

  useEffect(() => {
    // Get user role from JWT token
    const token = localStorage.getItem("jwtToken");
    if (token) {
      const payload = token.split(".")[1];
      const decodedPayload = JSON.parse(atob(payload));
      const roles = decodedPayload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      setUserRole(roles);
    }

    // First filter out completed appointments for regular users
    let initialAppointments = [...appointments];
    if (userRole === 'User') {
      initialAppointments = initialAppointments.filter(app => app.status !== 2);
    }

    // Apply filters
    let filtered = [...initialAppointments];

    // Sort by date
    if (filters.sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
    } else {
      filtered.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
    }

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(app => app.status === parseInt(filters.status));
    }

    setFilteredAppointments(filtered);
  }, [appointments, filters, userRole]);

  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return 'Čeka se dodela lekara';
      case 1:
        return 'Odobren';
      case 2:
        return 'Zavrsen';
      default:
        return 'Nepoznato';
    }
  };

  const handleOpenAddNotesModal = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setIsAddNotesModalOpen(true);
  };

  const handleCloseAddNotesModal = () => {
    setIsAddNotesModalOpen(false);
    setSelectedAppointmentId(null);
    setNote('');
  };

  const handleSaveNotes = async () => {
    if (!note.trim()) {
      alert('Napomena ne može biti prazna');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`https://localhost:7151/api/Appointment/update-notes/${selectedAppointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(note),
      });

      if (response.ok) {
        alert('Notes successfully updated');
        handleCloseAddNotesModal();
      } else {
        alert('Failed to update notes');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
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
              
              <option value="none">Sortiraj po...</option>
              <option value="newest">Najdalji prvo</option>
              <option value="oldest">Najskoriji prvo</option>
            </select>
            <ArrowUpDown className="sort-icon" size={20} />
            </div>
            <label>Status:</label>
            <div className="sort-container">

            
            <select 
              name="status" 
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="all">Svi statusi</option>
              <option value="0">Čeka se dodela lekara</option>
              <option value="1">Odobren</option>
              {userRole !== 'User' && <option value="2">Zavrsen</option>}
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

                return (
                  <li key={appointment.id}>
                    <strong>Datum:</strong> {formattedDate} <br />
                    <strong>Vreme:</strong> {formattedTime} <br />
                    <strong>Usluga:</strong> {appointment.serviceName} <br />
                    <strong>Status:</strong> {getStatusText(appointment.status)} <br />
                    {userRole === 'Doctor' && (
                      <button 
                        className="add-notes-btn"
                        onClick={() => handleOpenAddNotesModal(appointment.id)}
                      >
                        Dodaj napomene
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
        <div className="notes-modal">
          <h3>Dodaj napomene</h3>
          <textarea
            placeholder="Unesite napomene..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="modal-footer">
            <button onClick={handleCloseAddNotesModal}>Zatvori</button>
            <button onClick={handleSaveNotes} disabled={loading}>
              {loading ? 'Saving...' : 'Spremi'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllAppointmentsModal;