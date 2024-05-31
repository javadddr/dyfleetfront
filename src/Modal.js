import React from 'react';
import './Modal.css';

const Modal = ({ show, message, onClose }) => {
  if (!show) {
    return null;
  }

  return (
    <div className='modal-backdrop custom-backdrop'>
      <div className="modal-contentert">
        <p>{message}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );

};

export default Modal;
