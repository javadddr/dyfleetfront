
import React, { useState, useEffect } from 'react';
import './GetCars.css';
import Loading from './Loading'; 
import {useCars } from './CarsContext';
import CarDetails from './CarDetails'; // Import the CarDetails component
import { useDrivers } from './DriversContext'; 
import nopic from "./nopic.png"
import DriverDetails from './DriverDetails';
function GetCars() {
  const [hoveredPipeline, setHoveredPipeline] = useState(null);
  const { drivers, refreshDrivers } = useDrivers();
  const [activeStatuses, setActiveStatuses] = useState(['Active', 'Inactive', 'Incoming', 'Outgoing', 'Transferring', 'Repairing', 'No Driver']); // Initialize with all statuses

const [selectedDriver, setSelectedDriver] = useState(null);
  const [isLoading, setIsLoading] = useState(true); 
  const { cars,updateCarStatusInContext, refreshCars } = useCars();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCar, setSelectedCar] = useState(null);
  const handleCarClick = (car) => {
    setSelectedCar(car); // Set the selected car to display in the modal
  };
  useEffect(() => {
    refreshDrivers()
    
  }, []);
  const handleCloseModal = () => {
    setSelectedCar(null); // Close the modal by resetting the selected car
  };
  useEffect(() => {
    refreshCars();
    fetchPreferences(); // This will load cars when the component mounts
  }, []);

  const fetchPreferences = () => {
    const token = localStorage.getItem('userToken');
    fetch(`${process.env.REACT_APP_BACKEND_URL}/preferences`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(response => response.json())
    .then(activeStatuses => { 
      if (activeStatuses && activeStatuses.length > 0) {
        setActiveStatuses(activeStatuses);
      }
    })
    .catch(error => console.error('Error fetching preferences:', error));
    setTimeout(() => setIsLoading(false), 1000);
  };
  

  const updatePreferences = (newStatuses) => {
    console.log(newStatuses)
    const token = localStorage.getItem('userToken');
    fetch(`${process.env.REACT_APP_BACKEND_URL}/preferences`, {
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

  const handleStatusToggle = (status) => {
    const newStatuses = activeStatuses.includes(status)
      ? activeStatuses.filter(s => s !== status)
      : [...activeStatuses, status];
    updatePreferences(newStatuses);
  };

  const handleDragStart = (e, carId) => {
    e.dataTransfer.setData("carId", carId);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const carId = e.dataTransfer.getData("carId");
    
    // Update local state first for immediate UI response
    // const updatedCars = cars.map(car => {
    //   if (car._id === carId) {
    //     return { ...car, state: newStatus };
    //   }
    //   return car;
    // });
    updateCarStatusInContext(carId, newStatus);
    
    // Update car status in the database
    await updateCarStatus(carId, newStatus);
  };

  const handleDragOver = (e, status) => {
    e.preventDefault(); // This is necessary to allow for the drop to occur.
    setHoveredPipeline(status); // Set the currently hovered pipeline.
  };
  const handleDragLeaveOrDrop = () => {
    setHoveredPipeline(null); // Reset the hovered pipeline when dragging leaves or drops.
  };
 // Adjust updateCarStatus to use PATCH and handle status recording
 const updateCarStatus = async (carId, newStatus) => {
  const token = localStorage.getItem('userToken');
  try {
    // First, update the car's current status
    let response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/cars/${carId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ state: newStatus }),
    });
    if (!response.ok) {
      throw new Error('Failed to update car status');
    }

    // Assuming a successful car status update, now add a status record
    // This requires a new endpoint to be available for adding a status record
    response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/carStatusRecords/${carId}`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: newStatus,
        // `from` is automatically set to now in the schema
        // Optionally, `to` can be added here if needed
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create status record');
    }

  } catch (error) {
    console.error('Error updating car status or creating status record:', error);
  }
};

  const statuses = ['Active', 'Inactive', 'Incoming', 'Outgoing', 'Transferring', 'Repairing', 'No Driver'];



  // Helper function to find drivers currently assigned to a car
const findCurrentDriversForCar = (carDrivers) => {
  const currentDate = new Date();
  return carDrivers.filter(driver => 
    new Date(driver.from) <= currentDate && currentDate <= new Date(driver.till)
  ).map(driver => driver.driverId);
};
const handleDriverPictureClick = (event, driver) => {
  event.stopPropagation();
  setSelectedDriver(driver);
};
const carMatchesSearchQuery = (car) => {
  if (!car.general) {
    console.error('Car.general is undefined for car:', car);
    return false; // Skip this car if .general is undefined
  }
  // Check if car's properties match the search query
  const carMatch = car.general.internalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   car.general.licensePlate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   car.general.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   car.area?.toLowerCase().includes(searchQuery.toLowerCase());

  if (carMatch) {
    return true; // If the car matches the query, return true
  }

  // Check if any of the currently assigned drivers match the search query
  const currentDriverIds = findCurrentDriversForCar(car.drivers).map(driver => driver.driverId);
  const currentDrivers = drivers.filter(driver => currentDriverIds.includes(driver._id));
  return currentDrivers.some(driver => 
    driver.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  );
};
const stateCounts = cars.reduce((acc, car) => {
  acc[car.state] = (acc[car.state] || 0) + 1;
  return acc;
}, {});

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
            placeholder="Search cars..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        </div>
        <div className="pipeline-container">
  {statuses.filter(status => activeStatuses.includes(status)).map(status => (
    <div className="totalpip" key={status}>
      <div className='jazii'>
      <h3 className='titlepipdandv'>{`${status} ${stateCounts[status]? `(${stateCounts[status]})`: ''}`}</h3>

      </div>
      <div
        className={`pipeline ${hoveredPipeline === status ? 'pipeline-hover' : ''}`}
        onDrop={(e) => { handleDrop(e, status); handleDragLeaveOrDrop(); }}
        onDragOver={(e) => handleDragOver(e, status)}
        onDragLeave={handleDragLeaveOrDrop}
        style={{ height: activeStatuses.length<5 ? '720px' : '400px' }}
      >
        <div className="car-cards-container">
        {cars.filter(car => car.state === status && carMatchesSearchQuery(car)).map(car => {
  // Find the IDs of drivers currently assigned to this car
  const currentDriverIds = findCurrentDriversForCar(car.drivers);
  // Find the corresponding driver objects
  const currentDrivers = drivers.filter(driver => currentDriverIds.includes(driver._id));

  return (
    <div
      key={car._id}
      className="car-card"
      draggable
      onDragStart={(e) => handleDragStart(e, car._id)}
      onClick={() => handleCarClick(car)}
    >
      <div className='generaloinofmain'>

        <div className='generalandmore'>
          <div className='generaloinof'>
            <div className='infoveryriz'>
              <div className='titleliandfonti'>
                <strong>{car.general.internalName}</strong> {car.general.licensePlate}<br></br>
              </div>
              <div className='justlocation'>
                Location:<span> {car.general.location}</span>
     
              </div>
              <div className='justlocation'>
               
                Area: <span> {car.area?car.area:"No Area Assigned"}</span>
              </div>
            </div>
          </div>
          <div className='morecarinfosis'>
            <p>More info</p>
          </div>
        </div>

{currentDrivers.length>0 && <div className='picsinfogeneral' style={{
  height: currentDrivers.length === 1 ? '72px' : currentDrivers.length === 2 ? '104px' : '112px',
  alignItems:'center',
  marginRight:currentDrivers.length === 1 ? '32px' : currentDrivers.length === 2 ? '20px' : '12px',
  }}>
{currentDrivers.slice(0, 2).map((driver, index) => (
  <div 
    key={driver._id} 
    className="driver-picture-container" 
    onClick={(event) => handleDriverPictureClick(event, driver)}
  >
    {driver.picture ? (
      <img 
        src={`${process.env.REACT_APP_BACKEND_URL}/uploads/${driver.picture}`} 
        alt={`${driver.firstName} ${driver.lastName}`} 
        style={{ 
          width: currentDrivers.length === 1 ? '72px' : currentDrivers.length === 2 ? '48px' : '40px', 
          height: currentDrivers.length === 1 ? '72px' : currentDrivers.length === 2 ? '48px' : '40px', 
          borderRadius: '50%', 
          position: 'relative' 
        }} 
      />
    ) : (
      <img 
        src={nopic} 
        alt="No picture available" 
        style={{ 
          width: currentDrivers.length === 1 ? '72px' : currentDrivers.length === 2 ? '48px' : '40px', 
          height: currentDrivers.length === 1 ? '72px' : currentDrivers.length === 2 ? '48px' : '40px', 
          borderRadius: '50%', 
          marginRight:'20px',
          position: 'relative' 
        }} 
      />
    )}
    {/* Status indicator */}
    <div 
      className={`status-indicatorqw ${driver.status.toLowerCase().replace(/\s+/g, '-')}`} 
    
      style={{ 
        position: 'absolute', 
        bottom: currentDrivers.length === 1 ? -2.4 : currentDrivers.length === 2 ? 4 : 2.6, 
        right: currentDrivers.length === 1 ? -2 : currentDrivers.length === 2 ? 14 : 26.6, 
        width: currentDrivers.length === 1 ? '20px' : currentDrivers.length === 2 ? '16px' : '12px', 
        height: currentDrivers.length === 1 ? '20px' : currentDrivers.length === 2 ? '16px' : '12px', 
        borderRadius: '50%', 
        border: '2px solid white' 
      }}
    ></div>
  </div>
))}

  {currentDrivers.length > 2 && (
    <div className="extra-drivers-indicator" style={{ textAlign: 'center' }}>
      +{currentDrivers.length - 2}
    </div>
  )}
</div>}
{currentDrivers.length===0 && <div className='picsinfogeneral' style={{
  height: currentDrivers.length === 1 ? '72px' : currentDrivers.length === 2 ? '120px' : '140px',
  alignItems:'center',
  marginRight:currentDrivers.length === 1 ? '24px' : currentDrivers.length === 2 ? '0px' : '0px',
  marginTop:currentDrivers.length === 1 ? '24px' : currentDrivers.length === 2 ? '0px' : '0px',
  }}>
<h6 className='nodhsdse'>No Driver Assigned</h6>
</div>}


      </div>
    </div>
  );
})}

        </div>
      </div>
    </div>
  ))}
</div>

      </div>
      )}
     {selectedCar && (
  <div className="modal-overlay" onClick={handleCloseModal}>
    <div onClick={e => e.stopPropagation()}> {/* Prevent click through */}
      <CarDetails car={selectedCar} onClose={handleCloseModal} />
    </div>
  </div>
)}
{selectedDriver && (
  <div className="modal-overlay" onClick={() => setSelectedDriver(null)}>
    <div onClick={e => e.stopPropagation()}>
      <DriverDetails driver={selectedDriver} onClose={() => setSelectedDriver(null)} />
    </div>
  </div>
)}

    </div>
    
  );
  
}

export default GetCars;


