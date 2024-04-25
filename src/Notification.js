// Notification.js
import React from 'react';
import './Notification.css'; // Assume you have some basic styling for the notification

const Notification = ({ message, onClose }) => {
  return (
    <div className="notification-container">
      <p>{message}</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default Notification;
