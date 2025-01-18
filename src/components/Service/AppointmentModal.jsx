import React, { useState, useRef, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./AppointmentModal.css";
import { toast } from 'react-toastify';

const AppointmentModal = ({ isOpen, onClose, service }) => {
  const [selectedDate, setSelectedDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));
  const [selectedTime, setSelectedTime] = useState("");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const modalRef = useRef(null);

  const generateTimeSlots = (date) => {
    if (!date) return [];

    const day = date.getDay();

    // Sunday (0) is not available
    if (day === 0) return [];

    // Saturday (6) has different hours
    if (day === 6) {
      return generateHalfHourSlots("09:00", "12:00");
    }

    // Monday to Friday
    return generateHalfHourSlots("08:00", "16:00");
  };

  const generateHalfHourSlots = (start, end) => {
    const slots = [];
    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);

    let currentHour = startHour;
    let currentMinute = startMinute;

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMinute <= endMinute)
    ) {
      slots.push(
        `${currentHour.toString().padStart(2, "0")}:${currentMinute
          .toString()
          .padStart(2, "0")}`
      );

      currentMinute += 30;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }

    return slots;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (selectedDate) {
      checkAvailableTimes();
    }
  }, [selectedDate]);

  const checkAvailableTimes = async () => {
    if (!selectedDate || !service) return;

    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setError("Niste prijavljeni");
      return;
    }

    setLoading(true);
    try {
      const timeSlots = generateTimeSlots(selectedDate);
      const availableSlots = [];

      for (const time of timeSlots) {
        const [hours, minutes] = time.split(':');
        const appointmentDate = new Date(selectedDate);
        appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        try {
          const response = await fetch(
            `https://localhost:7151/api/Appointment/check-availability`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify(appointmentDate.toISOString())
            }
          );

          if (response.ok) {
            availableSlots.push(time);
          } else if (response.status === 401) {
            setError("Sesija je istekla. Molimo prijavite se ponovo.");
            return;
          }
        } catch (err) {
          console.error(`Error checking availability for time ${time}:`, err);
        }
      }

      setAvailableTimes(availableSlots);
    } catch (err) {
      setError("Greška prilikom provere dostupnih termina");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!service || !selectedDate || !selectedTime) {
      setError("Molimo izaberite datum i vreme");
      return;
    }

    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setError("Niste prijavljeni");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const patientId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
      const patientFullName = `${decoded.FirstName} ${decoded.LastName}`;

      // Create appointment date
      const [hours, minutes] = selectedTime.split(':');
      const appointmentDate = new Date(selectedDate);
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Final availability check
      const availabilityResponse = await fetch(
        `https://localhost:7151/api/Appointment/check-availability`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(appointmentDate.toISOString())
        }
      );

      if (!availabilityResponse.ok) {
        if (availabilityResponse.status === 401) {
          setError("Sesija je istekla. Molimo prijavite se ponovo.");
        } else {
          setError("Izabrani termin više nije dostupan");
        }
        return;
      }

      const appointmentData = {
        serviceId: service.id,
        serviceName: service.name,
        patientId: patientId,
        patientFullName: patientFullName,
        appointmentDate: appointmentDate.toISOString(),
        notes: "",
      };

      const response = await fetch("https://localhost:7151/api/Appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sesija je istekla. Molimo prijavite se ponovo.");
        }
        throw new Error("Greška prilikom zakazivanja termina");
      }

      toast.success("Termin uspešno zakazan!");
      onClose();
    } catch (err) {
      setError(err.message || "Greška prilikom zakazivanja termina");
      console.error(err);
    }
  };

  if (!isOpen || !service) return null;

  return (
    <div className="modal-appointment">
      <div ref={modalRef} className="modal-appointment-content appointment-modal">
        <div className="modal-appointment-header">
          <h3>Zakazivanje termina</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-appointment-body">
          <form onSubmit={handleSubmit} className="appointment-form">
            <div className="service-info">
              <h4>{service.name}</h4>
              <p className="price">{service.price} RSD</p>
            </div>

            <div className="date-picker">
              <div className="calendar-header">
                <Calendar className="icon" />
                <h4>Izaberite datum</h4>
              </div>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                maxDate={new Date(new Date().setDate(new Date().getDate() + 30))}
                filterDate={(date) => date.getDay() !== 0}
                dateFormat="dd/MM/yyyy"
                className="date-picker"
                placeholderText="Izaberite datum"
              />
            </div>

            {selectedDate && (
              <div className="time-picker">
                <div className="time-header">
                  <Clock className="icon" />
                  <h4>Izaberite vreme</h4>
                </div>
                <div className="time-slots">
                  {loading ? (
                    <p>Učitavanje dostupnih termina...</p>
                  ) : availableTimes.length === 0 ? (
                    <p>Nema dostupnih termina za izabrani datum</p>
                  ) : (
                    availableTimes.map((time) => (
                      <button
                        key={time}
                        type="button"
                        className={`time-slot ${selectedTime === time ? "selected" : ""}`}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="submit-button"
              disabled={!selectedDate || !selectedTime || loading}
            >
              Potvrdi termin
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;