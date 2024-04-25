import React, { useState, useEffect } from 'react';
import './GetDrivers.css'; 
import Loading from './Loading'; 
import { useDrivers } from './DriversContext'; 
import nopic from "./nopic.png"
import DriverDetails from './DriverDetails';
import {useCars } from './CarsContext';
function GetDrivers() {
  const { drivers, refreshDrivers } = useDrivers();
  const { cars, refreshCars } = useCars();
  const statuses = ['Active', 'Inactive', 'Sick', 'Holiday', 'Over Hours', 'Work Accident'];
  const [isLoading, setIsLoading] = useState(true); 
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [hoveredPipeline, setHoveredPipeline] = useState(null);

const [activeStatuses, setActiveStatuses] = useState(['Active', 'Inactive', 'Sick', 'Holiday', 'Over Hours', 'Work Accident']); 
useEffect(() => {
  refreshDrivers()
  fetchPreferences();
}, []);
const handleStatusToggle = (status) => {
  const newStatuses = activeStatuses.includes(status)
    ? activeStatuses.filter(s => s !== status)
    : [...activeStatuses, status];
  updatePreferences(newStatuses);
};
useEffect(() => {
  
  fetchPreferences(); // This will load cars when the component mounts
}, []);
const fetchPreferences = () => {
  const token = localStorage.getItem('userToken');
  fetch(`${process.env.REACT_APP_BACKEND_URL}/preferencesd`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then(response => response.json())
  
  .then(activeStatuses => { // Assuming the endpoint now correctly returns an array
    if (activeStatuses && activeStatuses.length > 0) {
      setActiveStatuses(activeStatuses);
    }
  })
  .catch(error => console.error('Error fetching preferences:', error));
  setTimeout(() => setIsLoading(false), 1000);
};
const handleCarClick = (driver) => {
  setSelectedDriver(driver); // Set the selected car to display in the modal
};
const handleCloseModal = () => {
  setSelectedDriver(null); // Close the modal by resetting the selected car
};
const updatePreferences = (newStatuses) => {
  const token = localStorage.getItem('userToken');
  fetch(`${process.env.REACT_APP_BACKEND_URL}/preferencesd`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ activeStatuses: newStatuses }),
  })
  .then(response => response.json())
  .then(() => {
    setActiveStatuses(newStatuses);
  })
  .catch(error => console.error('Error updating preferences:', error));
};


  const handleDragStart = (e, driverId) => {
    e.dataTransfer.setData("driverId", driverId);
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const driverId = e.dataTransfer.getData("driverId");
    updateDriverStatus(driverId, newStatus);
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    setHoveredPipeline(status); // Set the currently hovered pipeline.
  };
  const handleDragLeaveOrDrop = () => {
    setHoveredPipeline(null); // Reset the hovered pipeline when dragging leaves or drops.
  };
  const shouldIncreaseHeight = activeStatuses.length - 3 < 5;

  const updateDriverStatus = async (driverId, newStatus) => {
    const token = localStorage.getItem('userToken');
    try {
      // Step 1: Update the driver's current status
      let updateResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/drivers/${driverId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }), // Update the driver's status
      });
  
      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        throw new Error(`Failed to update driver status: ${errorText}`);
      }
  
      // Log successful driver update
      const updatedDriverData = await updateResponse.json();
      console.log('Driver status updated:', updatedDriverData);
  
      // Step 2: Create a new status record for the driver
      const statusResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/statusRecords/${driverId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }), // Create a new status record
      });
  
      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();
        throw new Error(`Failed to create driver status record: ${errorText}`);
      }
  
      // Log successful status record creation
      const statusRecordData = await statusResponse.json();
      console.log('New driver status record created:', statusRecordData);
  
      // Optionally, refresh the driver's data in the UI
      await refreshDrivers(); // Ensure you have a function to refresh/re-fetch driver data
  
    } catch (error) {
      console.error('Error in updating driver status and creating status record:', error);
    }
  };
  
  
  
const findAssignedCars = (driverId) => {
  const today = new Date();
  return cars.filter((car) => 
    car.drivers.some(driver =>
      driver.driverId === driverId &&
      new Date(driver.from) <= today &&
      new Date(driver.till) >= today
    )
  );
};

const driverMatchesSearchQuery = (driver) => {
  const driverNameMatch = driver.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          driver.lastName?.toLowerCase().includes(searchQuery.toLowerCase())|| 
                          driver.address?.toLowerCase().includes(searchQuery.toLowerCase());

  if (driverNameMatch) {
    return true; // If the driver's name matches the query, return true
  }

  // Check if any of the driver's cars match the search query
  const assignedCars = findAssignedCars(driver._id);
  return assignedCars.some(car => 
    car.general.internalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    car.general.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    car.area?.toLowerCase().includes(searchQuery.toLowerCase())||
    car.state?.toLowerCase().includes(searchQuery.toLowerCase())
   
    
  );
};
  return (
    <div>
           {isLoading ? 
  <Loading />
: (
  <div>
    <div className='chooseandsearch'>
    <div className="status-filters">
    {statuses.map(status => (
      <button
        key={status}
        onClick={() => handleStatusToggle(status)}
        className={`status-filter ${activeStatuses.includes(status) ? 'active' : ''}`}
      >
        {status}
      </button>
    ))}
  </div>
  <div className="search-container">
          <input
            type="text"
            placeholder="Search Drivers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        </div>
    <div className="pipeline-container">
      {statuses.filter(status => activeStatuses.includes(status)).map(status => {
         const statusCount = drivers.filter(driver => driver.status === status).length;
         return (
         <div className="totalpip" key={status}>
          <div className='jazii'>
          <h3 className='titlepipdandv'>{`${status} (${statusCount})`}</h3>
          </div>
        <div 
          key={status} 
          className={`pipeline ${hoveredPipeline === status ? 'pipeline-hover' : ''}`}
          onDrop={(e) => { handleDrop(e, status); handleDragLeaveOrDrop(); }}
          onDragOver={(e) => handleDragOver(e, status)}
          onDragLeave={handleDragLeaveOrDrop}
          style={{ height: activeStatuses.length<5 ? '900px' : '600px' }}
        >
        <div className="car-cards-container">
        {drivers.filter(driver => driver.status === status && driverMatchesSearchQuery(driver))
.map(driver => {
  const assignedCars = findAssignedCars(driver._id);
  return (
    <div 
      key={driver._id} 
      className="driver-card" 
      draggable 
      onDragStart={e => handleDragStart(e, driver._id)}
      onClick={() => handleCarClick(driver)}
    >
      <div className='didiv'>
        <div className='geeraliindiv'>
          <div className='geeraliindiv1'>
          
          <span>Name:</span> {driver.firstName} {driver.lastName}
       
         
          </div>
          <div className='filasmargin'>
          <span>Location:</span> {driver.address?driver.address:"No Location set"}
          </div>
          <div className='geeraliindiv2'>
          {assignedCars.map(car => (
            <div>
            <div key={car._id} className='geeraliindiv3'>
              <div className='doint1'> {car.general.internalName}</div>
              <div className='doint'> {car.area}</div>
              
            </div>
            <div className='ddddssx'><span>Assined Vehicle's Status:</span>  {car.state}</div>
            </div>
          ))}
        </div>
        </div>
        <div className='driver-picture'>
          {driver.picture ? (
       
           
          
                <img src={`${process.env.REACT_APP_BACKEND_URL}/uploads/${driver.picture}`} alt={`${driver.firstName} ${driver.lastName}`} />


         
          ) : <img src={nopic} alt='No picture available' />}
        </div>
      </div>
    </div>
  );
})}

        </div>
        </div>
        </div>
     );
    })}
    </div>
    </div>
     )}
          {selectedDriver && (
  <div className="modal-overlay" onClick={handleCloseModal}>
    <div onClick={e => e.stopPropagation()}> {/* Prevent click through */}
      <DriverDetails driver={selectedDriver} onClose={handleCloseModal} />
    </div>
  </div>
)}
     </div>
  );
}

export default GetDrivers;
