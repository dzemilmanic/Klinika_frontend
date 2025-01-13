import React, { useState, useRef, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./AppointmentModal.css";

const AppointmentModal = ({ isOpen, onClose, service }) => {
  const [selectedDate, setSelectedDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));
  const [selectedTime, setSelectedTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);

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

  const availableTimes = generateTimeSlots(selectedDate);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!service) return; // Don't fetch if there's no service

      try {
        const response = await fetch("https://localhost:7151/api/Appointment", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          }
        });
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        const data = await response.json();
        const filteredSlots = data
          .filter(
            (appointment) =>
              appointment.serviceId === service.id &&
              new Date(appointment.appointmentDate).toDateString() ===
                selectedDate.toDateString()
          )
          .map((appointment) =>
            new Date(appointment.appointmentDate).toTimeString().slice(0, 5)
          );
        setBookedSlots(filteredSlots);
      } catch (error) {
        console.error("Error fetching booked slots:", error);
      }
    };
  
    if (selectedDate && service) {
      fetchBookedSlots();
    }
  }, [selectedDate, service]);
  
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

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!service) {
      console.error("No service selected");
      return;
    }

    const token = localStorage.getItem("jwtToken");
    if (token) {
      try {
        const decoded = jwtDecode(token); 
        const patientId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']; 
        const patientFullName = `${decoded.FirstName} ${decoded.LastName}`;

        const appointmentData = {
          serviceId: service.id,
          serviceName: service.name,
          patientId: patientId,
          patientFullName: patientFullName,
          appointmentDate: `${
            selectedDate.toISOString().split("T")[0]
          }T${selectedTime}:00Z`,
          notes: "",
        };

        const response = await fetch("https://localhost:7151/api/Appointment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
          body: JSON.stringify(appointmentData),
        });

        if (!response.ok) {
          throw new Error("Something went wrong");
        }

        const data = await response.json();
        console.log("Appointment scheduled:", data);
        onClose();
      } catch (error) {
        console.error("Error scheduling appointment:", error);
      }
    }
  };

  if (!isOpen) return null;

  // Add early return if no service is provided
  if (!service) {
    return null;
  }

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
                onChange={handleDateChange}
                minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                maxDate={
                  new Date(new Date().setDate(new Date().getDate() + 30))
                }
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
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      type="button"
                      className={`time-slot ${
                        bookedSlots.includes(time) ? "booked" : ""
                      } ${selectedTime === time ? "selected" : ""}`}
                      onClick={() => !bookedSlots.includes(time) && setSelectedTime(time)}
                      disabled={bookedSlots.includes(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button
              type="submit"
              className="submit-button"
              disabled={!selectedDate || !selectedTime}
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