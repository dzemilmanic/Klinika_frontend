import React, { useState, useEffect } from 'react';
import './AllAppointmentsModal.css';
import './MedicalRecordModal.css';
import { ArrowUpDown } from "lucide-react";


const MedicalRecordModal = ({ isOpen, onClose, appointments }) => {
  if (!isOpen) return null;

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filteredAppointments, setFilteredAppointments] = useState([]);

  useEffect(() => {
    let filtered = appointments.filter(app => app.status === 2);

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.doctorFullName?.toLowerCase().includes(searchLower) ||
        app.serviceName?.toLowerCase().includes(searchLower)
      );
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.appointmentDate);
      const dateB = new Date(b.appointmentDate);
      return sortBy === 'newest' 
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });

    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, sortBy]);

  return (
    <div className="modal-appoints">
      <div className="modal-appoints-content">
        <h3>Vaš Karton</h3>

        <div className="filter-section">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Pretraži po lekaru ili usluzi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-medical"
            />
            <div className="sort-container">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select-medical"
            > 
              <option value="none">Sortiraj po...</option>
              <option value="newest">Najskoriji prvo</option>
              <option value="oldest">Najstariji prvo</option>
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
                    {appointment.notes && (
                      <>
                        <strong>Beleška:</strong> {appointment.notes}<br />
                      </>
                    )}
                    <strong>Lekar:</strong> {appointment.doctorFullName} <br />
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>Nemate završenih termina.</p>
          )}
        </div>
        <div className="modal-footer">
          <button onClick={onClose}>Zatvori</button>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordModal;