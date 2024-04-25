import React, { useState,useEffect } from 'react';
import GeneralCar from './components/GeneralCar';
import DriversOfCar from './components/DriversOfCar';

import InvoicesCar from './components/InvoicesCar';
import TaskCar from './components/TaskCar';
import EquipmentCar from './components/EquipmentCar';
import "./CarDetails.css"

const CarDetails = ({ car: initialCar, onClose }) => {
  const [activeTab, setActiveTab] = useState('GENERAL');
  const [car, setCar] = useState(initialCar);
  const stateColors = {
    Active: '#4CAF50',
    Inactive: '#9E9E9E',
    Incoming: '#2196F3',
    Outgoing: '#FF9800',
    Transferring: '#FFEB3B',
    Repairing: '#F44336',
    'No Driver': '#9C27B0',
  };
  
  const handleCarUpdate = (updatedCar) => {
    setCar(updatedCar);
  };

  useEffect(() => {
    setCar(initialCar); // Update local state when the initialCar prop changes
  }, [initialCar]);

    const renderContent = () => {
        switch (activeTab) {
            case 'GENERAL':
                return <GeneralCar car={car} onClose={onClose} onDeleted={onClose} onCarUpdate={handleCarUpdate} />;
            case 'DRIVERS':
                return <DriversOfCar car={car} onCarUpdate={handleCarUpdate} />;
            case 'INVOICES':
              return <InvoicesCar car={car} onCarUpdate={handleCarUpdate} />;                
            case 'TASKS_AND_NOTES':
                return <TaskCar car={car} onCarUpdate={handleCarUpdate} />;
            case 'EQUIPMENT':
                return <EquipmentCar car={car} onCarUpdate={handleCarUpdate}/>;
            default:
                return <GeneralCar car={car} />;
        }
    };
   
    
    return (
      <div className="car-details-modal">
         <div className="modal-header">
          <div className='cargenstatus'>
            <h2 className='statusfinali1'>{car.general.internalName} - {car.general.licensePlate}</h2>
            <div style={{ display: 'flex', alignItems: 'center',textAlign:'center' }}>
              <span style={{
                display: 'inline-block',
                width: '15px',
                height: '15px',
                fontWeight: 300,
                backgroundColor: stateColors[car.state] || '#000000',
                marginRight: '8px', // Adds some space between the square and the text
              }}></span>
              <div>
              <h2 className='statusfinali' style={{ color: stateColors[car.state] || '#000000', display: 'inline' }}>{car.state}</h2>
              </div>
              {car.area&&<div className='disicopo'>
              <h6>{car.area}</h6>
              </div>}
            </div>
          </div>
          <button onClick={onClose}>Close</button>
        </div>


          <div className="modal-tabs">
          <button className={`tab-button ${activeTab === 'GENERAL' ? 'button-active' : ''}`} onClick={() => setActiveTab('GENERAL')}>General</button>
          <button className={`tab-button ${activeTab === 'DRIVERS' ? 'button-active' : ''}`} onClick={() => setActiveTab('DRIVERS')}>Drivers</button>

          <button className={`tab-button ${activeTab === 'INVOICES' ? 'button-active' : ''}`} onClick={() => setActiveTab('INVOICES')}>Invoices</button>
          <button className={`tab-button ${activeTab === 'TASKS_AND_NOTES' ? 'button-active' : ''}`} onClick={() => setActiveTab('TASKS_AND_NOTES')}>Tasks and Notes</button>
          <button className={`tab-button ${activeTab === 'EQUIPMENT' ? 'button-active' : ''}`} onClick={() => setActiveTab('EQUIPMENT')}>Equipments</button>
          </div>
          <div className="modal-content2x">
              {renderContent()}
          </div>
      </div>
  );
};

export default CarDetails;
