import React, { useState } from 'react';
import './AllAppointmentsModal.css';

const AllAppointmentsModal = ({ isOpen, onClose, appointments }) => {
  if (!isOpen) return null;
  const [isAddNotesModalOpen, setIsAddNotesModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [note, setNote] = useState('');

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
    setNote(''); // Clear the note when closing the modal
  };

  const handleSaveNotes = async (appointmentId) => {
    if (!note.trim()) {
      alert('Napomena ne može biti prazna');
      return;
    }
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
      } else {
        alert('Failed to update notes');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-appoints">
      <div className="modal-appoints-content">
        <h3>Vaši termini</h3>
        <div className="appointments-list-container">
          {appointments.length > 0 ? (
            <ul>
              {appointments.map((appointment) => {
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
                    <button onClick={() => handleOpenAddNotesModal(appointment.id)}>
                      Dodaj napomene
                    </button>
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
        <div className="modal">
          <div className="modal-content">
            <h3>Dodaj napomene</h3>
            <textarea
              placeholder="Unesite napomene..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="modal-footer">
              <button onClick={handleCloseAddNotesModal}>Zatvori</button>
              <button onClick={handleSaveNotes}>Spremi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllAppointmentsModal;