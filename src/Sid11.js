import React, { useEffect, useState } from 'react';
import "./Sid11.css"
import Loading from './Loading'; // Adjust the path as necessary
import DriverDetails from './DriverDetails';
import nopic from "./nopic.png"
const Sid11 = () => {
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggingDriverId, setDraggingDriverId] = useState(null);
  const [dragOverPipeline, setDragOverPipeline] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const handleDriverPictureClick = (event, driver) => {
    event.stopPropagation();
    setSelectedDriver(driver);
  };



  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const createDefaultLicenseCheck = async (driver) => {
      const date = driver.startDate ? new Date(driver.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/drivers/${driver._id}/licenseCheck`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            date,
            status: "Not Enrolled",
            licensePhoto: ""
          }),
        });
        if (!response.ok) throw new Error('Failed to create default license check');
      } catch (error) {
        console.error("Error creating default license check:", error);
      }
    };

    const refreshDrivers = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/drivers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch drivers');
        }

        const fetchedDrivers = await response.json();
        await Promise.all(fetchedDrivers.map(async (driver) => {
          // Check if driverLicenseCheck is undefined or has no entries
          if (!driver.driverLicenseCheck || driver.driverLicenseCheck.length === 0) {
            await createDefaultLicenseCheck(driver);
          }
        }));
        // Check each driver for an empty driverLicenseCheck array
        await Promise.all(fetchedDrivers.map(async (driver) => {
          if (driver.driverLicenseCheck.length === 0) {
            await createDefaultLicenseCheck(driver);
          }
        }));

        // Fetch drivers again to update the state with the new license checks
        const updatedDriversResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/drivers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const updatedDrivers = await updatedDriversResponse.json();
        setDrivers(updatedDrivers);
      } catch (error) {
        console.error("Error fetching drivers:", error);
      }
    };

    refreshDrivers();
  }, [selectedDriver]); // Dependency array is empty, so this effect runs only once when the component mounts

  // The rest of your component...

  const onDragStart = (event, driverId) => {
    event.dataTransfer.setData("driverId", driverId);
    setDraggingDriverId(driverId); // Track the dragged driver
  };
  

  const onDragOver = (event, status) => {
    event.preventDefault(); // Necessary to allow dropping
    setDragOverPipeline(status); // Track the pipeline being dragged over
  };
  const updateDriverStatus = async (driverId, licenseCheckId, newStatus) => {
    const token = localStorage.getItem('userToken'); // Retrieve the auth token
    try {
      // Construct the URL with the driverId and licenseCheckId
      const url = `${process.env.REACT_APP_BACKEND_URL}/drivers/${driverId}/licenseCheck/${licenseCheckId}/status`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include the authorization header
        },
        body: JSON.stringify({ status: newStatus }), // Send the new status
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error('Failed to update driver status: ' + error.message);
      }
  
      return await response.json(); // Assuming the updated driver object or license check is returned
    } catch (error) {
      console.error('Error updating driver status:', error);
      throw error; // Re-throw the error to handle it in the calling function
    }
  };
  
  
  
  const onDrop = async (event, newStatus) => {
    event.preventDefault();
    const driverId = event.dataTransfer.getData("driverId");
    
    // Find the driver based on the ID
    const driver = drivers.find(d => d._id === driverId);
    if (!driver || driver.driverLicenseCheck.length === 0) {
      console.error("Driver or driver's license check not found.");
      return;
    }
  
    // Assuming the driverLicenseCheck array is sorted or we're interested in the latest entry
    const licenseCheckId = driver.driverLicenseCheck[driver.driverLicenseCheck.length - 1]._id;
    
    try {
      await updateDriverStatus(driverId, licenseCheckId, newStatus);
      // Refresh drivers to reflect the change
      const updatedDriversResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/drivers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('userToken')}`,
        },
      });
      if (!updatedDriversResponse.ok) throw new Error('Failed to fetch updated drivers');
      const updatedDrivers = await updatedDriversResponse.json();
      setDrivers(updatedDrivers);
      setDraggingDriverId(null);
  setDragOverPipeline(null);

    } catch (error) {
      console.error('Error updating driver status or refreshing drivers:', error);
    }
  };
  
  useEffect(() => {
    const fetchDrivers = async () => {
      setIsLoading(true); // Set loading state to true while fetching data
      const token = localStorage.getItem('userToken');

      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/drivers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch drivers');
        }

        const fetchedDrivers = await response.json();

        // Perform any additional operations you need on fetchedDrivers here

        setDrivers(fetchedDrivers); // Update state with fetched drivers
      } catch (error) {
        console.error("Error fetching drivers:", error);
      } finally {
        setIsLoading(false); // Set loading state to false once data fetching is complete or fails
      }
    };

    fetchDrivers();
  }, []);

  // The rest of your component...

  if (isLoading) {
    return <Loading />; // Show loading component while data is being fetched
  }
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter drivers based on search query
  const filteredDrivers = drivers.filter(driver => {
    const nameMatch = driver.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) || driver.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
    const locationMatch = driver.address?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Debugging: Log any drivers that don't have expected properties
    if (!driver.firstName || !driver.lastName || !driver.address) {
      console.log('Driver missing expected property:', driver);
    }
  
    return nameMatch || locationMatch;
  });
  


  return (
    <div className='mainlischeckpage'>
     <div className="search-bar-container">
  <input
    type="text"
    placeholder="Search for drivers..."
    value={searchQuery}
    onChange={handleSearchChange} // Make sure this handler updates the searchQuery state
    className="search-inputpp"
  />
</div>
      <div className='mainpipliscmay'>
      {['Not Enrolled', 'Setup', 'Driver Check', 'Pending Review', 'Valid Licenses'].map((status) => {
        // Use filteredDrivers instead of drivers for mapping
        const statusClassName = `status-${status.replace(/\s+/g, '')}`;
        return (
          <div
            className={`PIPLINIFORLICEN ${statusClassName} ${dragOverPipeline === status ? 'pipeline-drag-over' : ''}`}
            onDragOver={(event) => onDragOver(event, status)}
            onDrop={(event) => onDrop(event, status)}
            key={status}
          >
            <div className='titllicespipo'>
              <h2 className='titllicespip'>{status}</h2>
            </div>
            <div className="driverssomelicensMAIN">
            {filteredDrivers.filter(driver => {
  // Assuming driverLicenseCheck is sorted or we're only interested in the latest entry
  const latestLicenseCheck = driver.driverLicenseCheck[driver.driverLicenseCheck.length - 1] || {};
  // Now, we get the latest status from this latest license check
  const latestStatus = latestLicenseCheck.statuses[latestLicenseCheck.statuses.length - 1] || {};
  return latestStatus.status === status;
            }).map((driver) => (
              
              <div
              className={`driverssomelicensp ${draggingDriverId === driver._id ? 'driver-dragging' : ''}`}
              draggable
              onDragStart={(event) => onDragStart(event, driver._id)}
              key={driver._id}
              onClick={(event) => handleDriverPictureClick(event, driver)}
            >
  <div className='infolices'>
  <div className='geeraliindiv1dfr'>
    <div><span>Name:</span></div>
    <div className='dlhalle'>{driver.firstName} {driver.lastName}</div>
  </div>
  <div className='filasmargin'>
    <span>Location:</span> {driver.address}
  </div>
</div>

    <div className='driver-picture'>
      {driver.picture ? (
        <img src={`${process.env.REACT_APP_BACKEND_URL}/uploads/${driver.picture}`} alt={`${driver.firstName} ${driver.lastName}`} />
      ) : <img src={nopic} alt='No picture available' />}
     <div className={`status-indicator ${driver.status?.toLowerCase().replace(/\s+/g, '-')}`} style={{ position: 'absolute', bottom: 0, right: 0, width: '15px', height: '15px', borderRadius: '50%', border: '2px solid white' }}></div>

    </div>
   
  </div>
))}
</div>
          </div>
        );
      })}
      </div>
      {selectedDriver && (
  <div className="modal-overlay" onClick={() => setSelectedDriver(null)}>
    <div onClick={e => e.stopPropagation()}>
      <DriverDetails driver={selectedDriver} onClose={() => setSelectedDriver(null)} />
    </div>
  </div>
)}
    </div>
  );
  
};

export default Sid11;