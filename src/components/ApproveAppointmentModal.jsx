import React from 'react';
import { X } from 'lucide-react';
import './ApproveAppointmentModal.css';
import { toast } from 'react-toastify';

const ApproveAppointmentModal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-all-appointments-overlay">
      <div className="modal-all-appointments-content">
        <div className="modal-all-appointments-header">
          <h2>{title}</h2>
          <button className="modal-all-appointments-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default ApproveAppointmentModal;