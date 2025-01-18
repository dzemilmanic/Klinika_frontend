import React, { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import ApproveAppointmentModal from "../../components/Appointments/ApproveAppointmentModal";
import "./Appointments.css";
import { toast } from 'react-toastify';

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
  const [doctorAppointments, setDoctorAppointments] = useState([]);

  const checkAndUpdateExpiredAppointments = async (appointments) => {
    const now = new Date();
    const expiredAppointments = appointments.filter(appointment => 
      appointment.status === 0 && new Date(appointment.appointmentDate) < now
    );

    for (const appointment of expiredAppointments) {
      try {
        const response = await fetch(
          `https://localhost:7151/api/Appointment/${appointment.id}/cancel`,
          { method: "PUT" }
        );

        if (!response.ok) {
          console.error(`Failed to cancel appointment ${appointment.id}`);
          continue;
        }

        const updatedAppointment = await response.json();
        setAppointments(prevAppointments =>
          prevAppointments.map(app =>
            app.id === appointment.id ? updatedAppointment : app
          )
        );
      } catch (err) {
        console.error(`Error canceling appointment ${appointment.id}:`, err);
      }
    }

    if (expiredAppointments.length > 0) {
      setFilteredAppointments(prevFiltered => {
        const updatedFiltered = prevFiltered.map(app => {
          if (expiredAppointments.some(expired => expired.id === app.id)) {
            return { ...app, status: 3 }; // 3 is canceled status
          }
          return app;
        });
        return updatedFiltered;
      });
    }
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch("https://localhost:7151/api/Appointment");
        if (!response.ok) throw new Error("Failed to fetch appointments");
        const data = await response.json();
        setAppointments(data);
        setFilteredAppointments(data);
        await checkAndUpdateExpiredAppointments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();

    // Set up an interval to check for expired appointments every minute
    const intervalId = setInterval(() => {
      checkAndUpdateExpiredAppointments(appointments);
    }, 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(
          "https://localhost:7151/api/Roles/doctors"
        );
        if (!response.ok)
          throw new Error("Greška prilikom fetchovanja lekara.");
        const data = await response.json();
        setDoctors(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    const fetchDoctorAppointments = async () => {
      if (selectedDoctor) {
        try {
          const response = await fetch(
            `https://localhost:7151/api/Appointment/doctor/${selectedDoctor.id}/appointments`
          );
          if (!response.ok)
            throw new Error("Failed to fetch doctor's appointments");
          const data = await response.json();
          setDoctorAppointments(data);
        } catch (err) {
          setError(err.message);
        }
      }
    };

    fetchDoctorAppointments();
  }, [selectedDoctor]);

  const checkTimeConflict = (appointmentDate) => {
    const appointmentTime = new Date(appointmentDate);
    const appointmentEnd = new Date(appointmentTime.getTime() + 30 * 60000); // Assuming 30-minute appointments

    return doctorAppointments.some((existingAppointment) => {
      const existingTime = new Date(existingAppointment.appointmentDate);
      const existingEnd = new Date(existingTime.getTime() + 30 * 60000);

      return (
        (appointmentTime >= existingTime && appointmentTime < existingEnd) ||
        (appointmentEnd > existingTime && appointmentEnd <= existingEnd) ||
        (appointmentTime <= existingTime && appointmentEnd >= existingEnd)
      );
    });
  };

  const handleAssignDoctor = async () => {
    if (!selectedDoctor || !selectedAppointment) {
      toast.error("Molimo izaberite lekara.");
      return;
    }

    // Check for time conflicts
    if (checkTimeConflict(selectedAppointment.appointmentDate)) {
      toast.error(
        "Lekar već ima zakazan termin u ovo vreme. Molimo izaberite drugog lekara."
      );
      return;
    }

    try {
      const response = await fetch(
        `https://localhost:7151/api/Appointment/${selectedAppointment.id}/assign-doctor?doctorId=${selectedDoctor.id}`,
        { method: "PUT" }
      );

      if (!response.ok) throw new Error("Greška prilikom dodele lekara.");

      const updatedAppointment = await response.json();
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.id === selectedAppointment.id
            ? updatedAppointment
            : appointment
        )
      );
      setModalOpen(false);
      setSelectedDoctor(null);
      setSelectedAppointment(null);
      toast.success("Lekar uspešno dodeljen!");
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
    setDoctorAppointments([]); // Reset doctor appointments when opening modal
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
        <h2>Registrovani korisnici</h2>
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

              {appointment.status === 0 && new Date(appointment.appointmentDate) > new Date() && (
                <button
                  className="approve-button"
                  onClick={() => openDoctorModal(appointment)}
                >
                  <UserPlus size={18} style={{ marginRight: "8px" }} />
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
                className={`doctor-item ${
                  selectedDoctor?.id === doctor.id ? "selected" : ""
                }`}
                onClick={() => setSelectedDoctor(doctor)}
              >
                {doctor.firstName} {doctor.lastName}
                {selectedDoctor?.id === doctor.id &&
                  checkTimeConflict(selectedAppointment?.appointmentDate) && (
                    <div className="conflict-warning">
                      ⚠️ Ima zakazan termin u ovo vreme
                    </div>
                  )}
              </div>
            ))}
          </div>

          <div className="modal-actions">
            <button
              className="cancel-button"
              onClick={() => setModalOpen(false)}
            >
              Otkaži
            </button>
            <button
              className="assign-button"
              onClick={handleAssignDoctor}
              disabled={!selectedDoctor}
            >
              Dodeli lekara
            </button>
          </div>
        </ApproveAppointmentModal>
      </div>
    </div>
  );
};

export default Appointments;