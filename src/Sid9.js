import React, { useEffect, useState } from 'react';
import "./Sid11.css"
import Loading from './Loading'; // Adjust the path as necessary
import CarDetails from './CarDetails'; // Import the CarDetails component
import nopic from "./nopic.png"
const Sid11 = () => {
  const [cars, setCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggingCarId, setDraggingCarId] = useState(null);
  const [dragOverPipeline, setDragOverPipeline] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const handleCarPictureClick = (event, car) => {
    event.stopPropagation();
    setSelectedCar(car);
  };


  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const createDefaultLicenseCheck = async (car) => {
      const date = car.general.activeInFleetSinceDate ? new Date(car.general.activeInFleetSinceDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/cars/${car._id}/licenseCheck`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            date,
            status: "Waiting",
            licensePhoto: ""
          }),
        });
        if (!response.ok) throw new Error('Failed to create default license check');
      } catch (error) {
        console.error("Error creating default license check:", error);
      }
    };

    const refreshCars = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/cars`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch cars');
        }

        const fetchedCars = await response.json();
        await Promise.all(fetchedCars.map(async (car) => {
          // Check if car is undefined or has no entries
          if (!car.carLicenseCheck || car.carLicenseCheck.length === 0) {
            await createDefaultLicenseCheck(car);
          }
        }));
        // Check each driver for an empty driverLicenseCheck array
        await Promise.all(fetchedCars.map(async (car) => {
          if (car.carLicenseCheck.length.length === 0) {
            await createDefaultLicenseCheck(car);
          }
        }));

        // Fetch drivers again to update the state with the new license checks
        const updatedCarsResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/cars`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const updatedCars = await updatedCarsResponse.json();
        setCars(updatedCars);
      } catch (error) {
        console.error("Error fetching drivers:", error);
      }
    };

    refreshCars();
  }, [selectedCar]); // Dependency array is empty, so this effect runs only once when the component mounts

  // The rest of your component...

  const onDragStart = (event, carId) => {
    event.dataTransfer.setData("carId", carId);
    setDraggingCarId(carId); // Track the dragged driver
  };
  

  const onDragOver = (event, status) => {
    event.preventDefault(); // Necessary to allow dropping
    setDragOverPipeline(status); // Track the pipeline being dragged over
  };
  const updateCarStatus = async (carId, licenseCheckId, newStatus) => {
   
    const token = localStorage.getItem('userToken'); // Retrieve the auth token
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/cars/${carId}/licenseCheck/${licenseCheckId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include the authorization header if your endpoint requires it
        },
        body: JSON.stringify({ status: newStatus }),
      });
  
      if (!response.ok) throw new Error('Failed to update driver status');
      return await response.json(); // Assuming the updated driver object or license check is returned
    } catch (error) {
      console.error('Error updating driver status:', error);
      throw error; // Re-throw the error to handle it in the calling function
    }
  };
  
  
  const onDrop = async (event, newStatus) => {
    event.preventDefault();
    const carId = event.dataTransfer.getData("carId");
  
    // Hypothetical way to get the licenseCheckId. This needs to be adjusted based on your app's logic.
    // It might involve looking up the driver in your state and selecting the relevant licenseCheckId.
    const car = cars.find(d => d._id === carId);
    const licenseCheckId = car.carLicenseCheck[car.carLicenseCheck.length - 1]._id;
  
    try {
      await updateCarStatus(carId, licenseCheckId, newStatus);
      // Refresh drivers to reflect the change
      const updatedCarsResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/cars`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('userToken')}`,
        },
      });
      if (!updatedCarsResponse.ok) throw new Error('Failed to fetch updated cars');
      const updatedCars = await updatedCarsResponse.json();
      setCars(updatedCars);
      setDraggingCarId(null);
  setDragOverPipeline(null);

    } catch (error) {
      console.error('Error updating driver status or refreshing cars:', error);
    }
  };
  
  useEffect(() => {
    const fetchCars = async () => {
      setIsLoading(true); // Set loading state to true while fetching data
      const token = localStorage.getItem('userToken');

      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/cars`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch cars');
        }

        const fetchedCars = await response.json();

        // Perform any additional operations you need on fetchedDrivers here

        setCars(fetchedCars); // Update state with fetched drivers
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setIsLoading(false); // Set loading state to false once data fetching is complete or fails
      }
    };

    fetchCars();
  }, []);

  // The rest of your component...

  if (isLoading) {
    return <Loading />; // Show loading component while data is being fetched
  }
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter drivers based on search query
  const filteredCars = cars.filter(car => {
    const nameMatch = car.general.internalName?.toLowerCase().includes(searchQuery.toLowerCase()) || car.general.licensePlate?.toLowerCase().includes(searchQuery.toLowerCase());
    const locationMatch = car.area?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Debugging: Log any drivers that don't have expected properties
    if (!car.general.internalName || !car.general.licensePlate || !car.area) {
      console.log('car missing expected property:', car);
    }
  
    return nameMatch || locationMatch;
  });
  
  const calculateDaysAgo = (dateString) => {
    const date = new Date(dateString);
    const currentDate = new Date();
  
    // Normalize both dates to the start of the day for accurate comparison
    date.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
  
    const differenceInTime = currentDate.getTime() - date.getTime();
    const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
  
    return differenceInDays; // Returns the number of days ago
  };

  return (
    <div className='mainlischeckpage'>
     <div className="search-bar-container">
  <input
    type="text"
    placeholder="Search for cars..."
    value={searchQuery}
    onChange={handleSearchChange} // Make sure this handler updates the searchQuery state
    className="search-inputpp"
  />
</div>
      <div className='mainpipliscmay'>
      {['No or expired inspection', 'Waiting', 'Under Inspection', 'Inspection Done', 'Rejected'].map((status) => {
        // Use filteredDrivers instead of drivers for mapping
       
        return (
          <div
              className={`PIPLINIFORLICEN ${`status-${status.replace(/\s+/g, '')}`} ${dragOverPipeline === status ? 'pipeline-drag-over' : ''}`}
              onDragOver={(event) => onDragOver(event, status)}
              onDrop={(event) => onDrop(event, status)}
              key={status}
            >
            <div className='titllicespipo'>
              <h2 className='titllicespip'>{status}</h2>
            </div>
            <div className="driverssomelicensMAIN">
            {filteredCars.filter(car => {
              const latestLicenseCheck = car.carLicenseCheck[car.carLicenseCheck.length - 1] || {};
              const latestStatus = latestLicenseCheck.statuses && latestLicenseCheck.statuses.length > 0 ? latestLicenseCheck.statuses[latestLicenseCheck.statuses.length - 1].status : null;
              return latestStatus === status;
            }).map((car) => (
              
  <div
    className={`driverssomelicens ${draggingCarId === car._id ? 'driver-dragging' : ''}`}
    draggable
    onDragStart={(event) => onDragStart(event, car._id)}
    key={car._id}
    onClick={(event) => handleCarPictureClick(event, car)}
  >
  <div className='infolices'>
  <div className='filasmarginoop'>
    <div><span>Name:</span>{car.general.internalName }</div>
    
  </div>
  <div className='filasmarginoopp'> <span>License Plate:</span> {car.general.licensePlate}</div>
  <div className='filasmarginoopp'>
    <span>Area:</span> {car.area}
  </div>
  <div className='filasmarginoop'>
    <div>
    <span>State:</span> {car.state}  
    </div>
    <div>
   {calculateDaysAgo(car.carLicenseCheck[0].date)} Days ago
    </div>
  </div>
</div>

  </div>
))}
</div>
          </div>
        );
      })}
      </div>
      {selectedCar && (
  <div className="modal-overlay" onClick={() => setSelectedCar(null)}>
    <div onClick={e => e.stopPropagation()}>
      <CarDetails car={selectedCar} onClose={() => setSelectedCar(null)} />
    </div>
  </div>
)}
    </div>
  );
  
};

export default Sid11;