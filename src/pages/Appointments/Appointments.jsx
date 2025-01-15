import React, { useEffect, useState } from "react";
import { UserPlus } from 'lucide-react';
import ApproveAppointmentModal from '../../components/ApproveAppointmentModal';
import "./Appointments.css";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch("https://localhost:7151/api/Appointment");
        if (!response.ok) throw new Error("Failed to fetch appointments");
        const data = await response.json();
        setAppointments(data);
        setFilteredAppointments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch("https://localhost:7151/api/Roles/doctors");
        if (!response.ok) throw new Error("Failed to fetch doctors");
        const data = await response.json();
        setDoctors(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchDoctors();
  }, []);

  const handleAssignDoctor = async () => {
    if (!selectedDoctor || !selectedAppointment) {
      alert("Please select a doctor.");
      return;
    }

    try {
      const response = await fetch(
        `https://localhost:7151/api/Appointment/${selectedAppointment.id}/assign-doctor?doctorId=${selectedDoctor.id}`,
        { method: "PUT" }
      );

      if (!response.ok) throw new Error("Failed to assign doctor");

      const updatedAppointment = await response.json();
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.id === selectedAppointment.id ? updatedAppointment : appointment
        )
      );
      setModalOpen(false);
      setSelectedDoctor(null);
      setSelectedAppointment(null);
      alert("Doctor assigned successfully!");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusChange = (event) => {
    const selectedStatus = event.target.value;
    setStatusFilter(selectedStatus);

    if (selectedStatus === "") {
      setFilteredAppointments(appointments);
    } else {
      const filtered = appointments.filter(
        (appointment) => appointment.status === parseInt(selectedStatus)
      );
      setFilteredAppointments(filtered);
    }
  };

  const openDoctorModal = (appointment) => {
    setSelectedAppointment(appointment);
    setSelectedDoctor(null);
    setModalOpen(true);
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      0: "status-pending",
      1: "status-approved",
      2: "status-completed",
      3: "status-canceled",
    };
    return `status-badge ${statusClasses[status] || ""}`;
  };

  const statusMap = {
    0: "Za dodelu lekara",
    1: "Odobren",
    2: "Završen",
    3: "Otkazan",
  };

  if (loading) {
    return (
      <div className="news-page">
        <div className="loader">
          <div className="loader-spinner"></div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="users-page">
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
    <div className="appointments-page">
    <div className="container">
      <div className="filter">
        <label htmlFor="statusFilter">Prikaži po statusu: </label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={handleStatusChange}
        >
          <option value="">Svi</option>
          <option value="0">Za dodelu lekara</option>
          <option value="1">Odobren</option>
          <option value="2">Završen</option>
          <option value="3">Otkazan</option>
        </select>
      </div>

      <div className="appointments-grid">
        {filteredAppointments.map((appointment) => (
          <div key={appointment.id} className="card">
            <h3>{appointment.serviceName}</h3>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(appointment.appointmentDate).toLocaleString()}
            </p>
            <div className={getStatusBadgeClass(appointment.status)}>
              {statusMap[appointment.status] || "Nepoznato"}
            </div>
            
            {appointment.status === 0 && (
              <button 
                className="approve-button"
                onClick={() => openDoctorModal(appointment)}
              >
                <UserPlus size={18} style={{ marginRight: '8px' }} />
                Dodeli lekaru
              </button>
            )}
          </div>
        ))}
      </div>

      <ApproveAppointmentModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        title="Izaberi lekara"
      >
        <div className="doctor-list">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className={`doctor-item ${selectedDoctor?.id === doctor.id ? 'selected' : ''}`}
              onClick={() => setSelectedDoctor(doctor)}
            >
              {doctor.firstName} {doctor.lastName}
            </div>
          ))}
        </div>
        <button
          className="approve-button"
          onClick={handleAssignDoctor}
          disabled={!selectedDoctor}
        >
          Odobri i dodeli lekara
        </button>
      </ApproveAppointmentModal>
    </div>
    </div>
  );
};

export default Appointments;