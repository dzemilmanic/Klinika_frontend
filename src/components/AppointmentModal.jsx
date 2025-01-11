import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import './AppointmentModal.css';

const AppointmentModal = ({ isOpen, onClose, service }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const modalRef = useRef(null);

  const availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00'
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle appointment submission here
    console.log('Appointment scheduled:', {
      service: service.name,
      date: selectedDate,
      time: selectedTime
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div ref={modalRef} className="modal-content appointment-modal">
        <div className="modal-header">
          <h3>Zakazivanje termina</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
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
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => handleDateChange(new Date(e.target.value))}
                min={new Date().toISOString().split('T')[0]}
                className="date-input"
              />
            </div>

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
                    className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

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