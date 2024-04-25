
import React, { useState, useEffect } from 'react';
import './DriversOfCar.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDrivers } from '../DriversContext'; // Import useDrivers hook
import { useCars } from '../CarsContext';
import CustomDateTimePicker from './CustomDateTimePickerd';
import editIcon from './edit.svg'; // Path to your edit icon
import del from './del.svg'; // Path to your edit icon
import checkIcon from './check.svg'; // Path to your check icon
import cancelIcon from './can.svg';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Snackbar, Alert } from '@mui/material';
import plusi from "../plusi.svg"
const DriversOfCar = ({ car: propCar,onCarUpdate }) => {
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [selectedDriverForDeletion, setSelectedDriverForDeletion] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
const [snackbarInfo, setSnackbarInfo] = useState({ open: false, severity: '', message: '' });

  const [car, setCar] = useState(propCar); // New state to manage car data
  const [assigning, setAssigning] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [currentDrivers, setCurrentDrivers] = useState([]);
  const [historyDrivers, setHistoryDrivers] = useState([]);
  const [editFromDate, setEditFromDate] = useState(new Date());
  const [editTillDate, setEditTillDate] = useState(new Date());
  const [editingDriverId, setEditingDriverId] = useState(null);
  const [fromDate, setFromDate] = useState(new Date());
  const [tillDate, setTillDate] = useState(new Date());
  const { drivers, refreshDrivers } = useDrivers();
  const [driversList, setDriversList] = useState([]);
  const {cars, refreshCars } = useCars();
  const [alreadyAssigned, setAlreadyAssigned] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [futureDrivers, setFutureDrivers] = useState([]);

  useEffect(() => {
    const now = new Date();
    const future = car.drivers
    .filter(driverAssignment => {
      const from = new Date(driverAssignment.from);
      return from > now;
    }).map(assignment => {
      const driverDetails = drivers.find(driver => driver._id === assignment.driverId);
  
     
      if (!driverDetails) return null;
      // Assuming driverDetails.driverArea is the correct path and it exists
      const futureAreas = driverDetails?.driverArea?.filter(area => {
        const areaFrom = new Date(area.from);
        const areaTo = new Date(area.to);
        return areaFrom <= now && areaTo >= now;
      }).map(area => area.area) || ["No area assigned yet"]; // Default message if no areas
  
      const areasString = futureAreas.length > 0 ? futureAreas.join(', ') : "No area assigned yet";
    
  
      return {
        ...assignment,
        name: `${driverDetails.firstName} ${driverDetails.lastName}`,
        status: driverDetails?.status || 'Status unknown',
        area: areasString // Ensure this matches your table's expected data key
      };
    }).filter(driver => driver !== null)
    .sort((a, b) => new Date(a.from) - new Date(b.from));
  
    setFutureDrivers(future);
  }, [car, drivers]);
  
  
  
  useEffect(() => {
    // Loop through drivers and create a new array with names
    const namesList = drivers.map(driver => ({
      id: driver._id, // Include the id if you need to uniquely identify drivers later
      name: `${driver.firstName} ${driver.lastName}`
    }));
    setDriversList(namesList);
  }, [drivers]); // This effect runs whenever the 'drivers' data changes

 

  useEffect(() => {
    // Map over cars to access each car's drivers array and flatten the result
    const assignments = cars.flatMap(car => 
      car.drivers.map(driver => ({
        driverId: driver.driverId,
        from: driver.from,
        till: driver.till,
        _id: driver._id
      }))
    );
    setAlreadyAssigned(assignments);
  }, [cars]); // This effect runs whenever the 'cars' data changes



  useEffect(() => {
    const isDriverAvailable = (driverId) => {
      return !alreadyAssigned.some(assignment => {
        const assignmentStart = new Date(assignment.from);
        const assignmentEnd = new Date(assignment.till);
        const from = new Date(fromDate);
        const till = new Date(tillDate);
        return (
          driverId === assignment.driverId &&
          ((assignmentStart <= from && assignmentEnd >= from) ||
           (assignmentStart <= till && assignmentEnd >= till) ||
           (assignmentStart >= from && assignmentEnd <= till))
        );
      });
    };

    // Filter drivers based on their availability during the selected period
    const filteredDrivers = drivers.filter(driver => isDriverAvailable(driver._id));
    setAvailableDrivers(filteredDrivers);

  }, [drivers, alreadyAssigned, fromDate, tillDate]);




  const toggleAssigning = () => {
    setAssigning(!assigning);
    if (!assigning) {
      // Delay scrolling slightly to allow for the start of the animation
      setTimeout(() => {
        document.querySelector('.assign-driver-form').scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  

//
const startEdit = (driverId) => {
  // Try to find the driver in currentDrivers first
  let driverToEdit = currentDrivers.find(driver => driver._id === driverId);

  // If not found in currentDrivers, try to find in futureDrivers
  if (!driverToEdit) {
    driverToEdit = futureDrivers.find(driver => driver._id === driverId);
  }

  // If found, proceed to set state for editing
  if (driverToEdit) {
    setEditFromDate(new Date(driverToEdit.from));
    setEditTillDate(driverToEdit.till ? new Date(driverToEdit.till) : new Date());
    setEditingDriverId(driverId);
  } else {
    console.error('Driver not found for editing');
  }
};

function formatDate(date) {
  const options = { month: 'long' };
  const month = new Intl.DateTimeFormat('en-US', options).format(date);
  const day = date.getDate();
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');

  // Determine the date suffix correctly
  const suffix = ((day) => {
    const j = day % 10,
          k = day % 100;
    if (j === 1 && k !== 11) {
      return "st";
    }
    if (j === 2 && k !== 12) {
      return "nd";
    }
    if (j === 3 && k !== 13) {
      return "rd";
    }
    return "th";
  })(day);

  return `${day}${suffix} of ${month}, ${hour}:${minute}`;
}


const cancelEdit = () => {
  setEditingDriverId(null);
};

const submitEdit = async () => {
  const token = localStorage.getItem('userToken');
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/cars/${car._id}/drivers/${editingDriverId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        from: editFromDate.toISOString(),
        till: editTillDate.toISOString(),
      }),
    });
    if (!response.ok) throw new Error('Failed to update driver assignment');
    setSnackbarInfo({ open: true, severity: 'success', message: 'Driver edit submitted successfully.' });
    setEditingDriverId(null);
   
    // Refresh car data and update state
    const updatedCarsList = await refreshCars();
    const updatedCar = updatedCarsList.find(c => c._id === car._id);
    if (updatedCar) {
      setCar(updatedCar);
      onCarUpdate(updatedCar);
    }
  } catch (error) {
    setSnackbarInfo({ open: true, severity: 'error', message: 'Failed to submit driver edit.' });
  }
};
//

const handleAssignDriver = async () => {
  const token = localStorage.getItem('userToken');
  const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/cars/${car._id}/driver`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      driverId: selectedDriverId,
      from: fromDate.toISOString(),
      till: tillDate.toISOString(),
    }),
  });

  if (response.ok) {
    setSnackbarInfo({ open: true, severity: 'success', message: 'Driver assigned successfully.' });
    setAssigning(false);

    // Wait for the cars list to refresh and get the updated list
    const updatedCarsList = await refreshCars(); // Assuming refreshCars now returns the updated cars list

    // Find the updated car by ID
    const updatedCar = updatedCarsList.find(c => c._id === car._id);

    if (updatedCar) {
      // Assuming you have a way to update the local state or notify parent components
      // For example, if you have a callback like onCarUpdate from a parent component
      setCar(updatedCar); // Update the local state with the updated car
      onCarUpdate(updatedCar);
      
    } else {
      console.error("Failed to find the updated car in the refreshed list.");
    }
  } else {
    const errorMsg = await response.text(); // Attempt to read server error message
   
    setSnackbarInfo({ open: true, severity: 'error', message: 'Failed to assign driver.' });
  }
};


// Pagination state
const [currentPage, setCurrentPage] = useState(1);
const [rowsPerPage, setRowsPerPage] = useState(3);

// Function to classify drivers - unchanged

// Pagination handlers
const nextPage = () => {
  setCurrentPage(currentPage + 1);
};

const prevPage = () => {
  setCurrentPage(currentPage - 1);
};

const firstPage = () => {
  setCurrentPage(1);
};

const lastPage = () => {
  const totalDrivers = historyDrivers.length;
  const lastPage = Math.ceil(totalDrivers / rowsPerPage);
  setCurrentPage(lastPage);
};


const indexOfLastDriver = currentPage * rowsPerPage;
const indexOfFirstDriver = indexOfLastDriver - rowsPerPage;
const currentHistoryDrivers = historyDrivers.slice(indexOfFirstDriver, indexOfLastDriver);



  const fromDateStr = fromDate.toISOString().split('T')[0];
  const tillDateStr = tillDate.toISOString().split('T')[0];

  // Modify the date setters to handle input events
  const handleFromDateChange = (event) => {
    setFromDate(new Date(event.target.value));
  };

  const handleTillDateChange = (event) => {
    setTillDate(new Date(event.target.value));
  };


  useEffect(() => {
    // Determine current drivers based on the selected car's driver assignments
    const now = new Date();
    const current = car.drivers.filter(driverAssignment => {
      const from = new Date(driverAssignment.from);
      const till = driverAssignment.till ? new Date(driverAssignment.till) : new Date();

      return from <= now && till >= now;
    }).map(assignment => {
      // Find the driver's details in the drivers list
      const driverDetails = drivers.find(driver => driver._id === assignment.driverId);
      if (!driverDetails) return null;
      return {
        ...assignment,
        name: `${driverDetails.firstName} ${driverDetails.lastName}`,
        status: driverDetails ? `${driverDetails.status}` : 'Status unknown', 
      
      };
    }).filter(driver => driver !== null)
    .sort((a, b) => new Date(a.from) - new Date(b.from));

    setCurrentDrivers(current);
  }, [car, drivers]);





  useEffect(() => {
    const now = new Date();
    const current = [];
    const history = [];
  
    car.drivers.forEach(driverAssignment => {
    
      const from = new Date(driverAssignment.from);
      const till = new Date(driverAssignment.till);
      const driverDetails = drivers.find(driver => driver._id === driverAssignment.driverId);
      
      if (driverDetails) {
        const pastAreas = driverDetails?.driverArea?.filter(area => {
          const areaTo = new Date(area.to);
          return areaTo < now; // Checking if the area's 'to' date is in the past
        }).map(area => area.area).join(", ") || "No area assigned"; // Joining areas or providing a fallback
    
        const driverInfo = {
          ...driverAssignment,
          name: `${driverDetails.firstName} ${driverDetails.lastName}`,
          status: driverDetails.status, 
          area: pastAreas, 
          picture: driverDetails.picture,
        };

      if (from <= now && till >= now) {
        current.push(driverInfo);
      } else if (till < now) {
        history.push(driverInfo);
      }
    }
  });
  
    setCurrentDrivers(current);
    setHistoryDrivers(history.map(driver => ({
      ...driver,
      from: formatDate(new Date(driver.from)),
      till: driver.till ? formatDate(new Date(driver.till)) : 'Present',
      status: drivers.find(d => d._id === driver.driverId)?.status || 'Unknown',
      area: driver.area, // Ensure to include the area here
    })));
  }, [car, drivers]);
  
  

  const handleEditFromDateChange = (date) => {
    setEditFromDate(date);
  };

  const handleEditTillDateChange = (date) => {
    setEditTillDate(date);
  };
  const prepareForDeletion = (driver) => {
    setSelectedDriverForDeletion(driver); // Assuming 'driver' has an '_id' property
    setOpenDeleteDialog(true);
  };
  
  
  
  const confirmDeleteDriver = async () => {
    if (!selectedDriverForDeletion) return;
  
    await handleDeleteDriver(selectedDriverForDeletion._id);
    // Clear the state after deletion attempt
    setSelectedDriverForDeletion(null);
    setOpenDeleteDialog(false);
  };
  
  

  const handleDeleteDriver = async (assignmentId) => {
    if (!selectedDriverForDeletion || !selectedDriverForDeletion._id) return;
    const token = localStorage.getItem('userToken');
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/cars/${car._id}/drivers/assignment/${assignmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to update/delete driver assignment');
  
      setSnackbarInfo({ open: true, severity: 'success', message: 'Driver deleted successfully.' });
      // Refresh the car data to reflect changes
      const updatedCarsList = await refreshCars();
      const updatedCar = updatedCarsList.find(c => c._id === car._id);
      if (updatedCar) {
        setCar(updatedCar);
        onCarUpdate(updatedCar);
      }
    } catch (error) {
      setSnackbarInfo({ open: true, severity: 'error', message: 'Failed to delete driver.' });
    } finally {
      setOpenDeleteDialog(false);
      setSelectedDriverForDeletion(null); // Clear the deletion target
    }
  };
  

  
  
  return (
    <div className="modal-content2x">
      <div className='containerPPOLmm'>
      <button className="add-equipment-btn" onClick={toggleAssigning}>
      <img src={plusi} alt="Add" style={{width:'12%',marginRight: "8px" }} />
      Assign New Driver
    </button>
      </div>
      
      <div className={`assign-driver-form ${assigning ? 'assign-driver-form-visible' : ''}`}>
     
          <div className='driverassititleanddate'>
          
          <CustomDateTimePicker
              initialFromDate={fromDate}
              initialTillDate={tillDate}
              onFromDateChange={setFromDate}
              onTillDateChange={setTillDate}
            />

        
            <div class="custom-select-wrapper1">
              <select class="custom-select1" value={selectedDriverId} onChange={e => setSelectedDriverId(e.target.value)}>
                <option value="">Select a driver</option>
                {availableDrivers.map(driver => (
                  <option key={driver._id} value={driver._id}>{driver.firstName} {driver.lastName}</option>
                ))}
              </select>
            </div>
            <div className='basigni'>
          <button id='subassigndri' onClick={handleAssignDriver}>Submit</button>
          <button id='subcanceldri' onClick={() => setAssigning(false)}>Cancel</button>
          </div>
          
          </div>
        </div>

   
    
      <h2 className='titlcure'>Current Drivers</h2>
<table className='drivers-table'>
  <thead>
    <tr>
      <th>Name</th>
      <th>From</th>
      <th>Till</th>
      <th>Status</th> {/* Added Status column */}
    
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {currentDrivers.map((driver) => (
      <tr key={driver._id}>
        <td>{driver.name}</td>
        <td>
          {editingDriverId === driver._id ? (
            <DatePicker
              selected={editFromDate}
              onChange={handleEditFromDateChange}
              showTimeSelect
              dateFormat="Pp"
              className='dteedidri'
            />
          ) : (
            formatDate(new Date(driver.from))
          )}
        </td>
        <td>
          {editingDriverId === driver._id ? (
            <DatePicker
              selected={editTillDate}
              onChange={handleEditTillDateChange}
              showTimeSelect
              dateFormat="Pp"
              className='dteedidri'
            />
          ) : (
            driver.till ? formatDate(new Date(driver.till)) : 'Present'
          )}
        </td>
        <td>{driver.status}</td> {/* Displaying Status */}
      
        <td>
          {editingDriverId === driver._id ? (
            <>
              <div className='buttonsinside'>
              <img src={checkIcon} alt="Submit" style={{ cursor: 'pointer', width: '12%' }} onClick={submitEdit} />
            <img src={cancelIcon} alt="Cancel" style={{ cursor: 'pointer', width: '12%', marginLeft: '10px' }} onClick={() => cancelEdit()} />
              </div>
            </>
          ) : (
            <>
            <div className='buttonsinside'>
              <img src={editIcon} alt="Edit" style={{ cursor: 'pointer',width:'12%' }} onClick={() => startEdit(driver._id)} />
              <img src={del} alt="Delete" style={{ cursor: 'pointer', width: '12%', marginLeft: '10px' }} onClick={() => prepareForDeletion(driver)} />

              </div>
            </>
          )}
        </td>
      </tr>
    ))}
  </tbody>
</table>


      
       <h2 className='titlcure'>Future Drivers</h2>
<table className='drivers-table'>
  <thead>
    <tr>
      <th>Name</th>
      <th>From</th>
      <th>Till</th>
      <th>Status</th> {/* Added Status column */}
   
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {futureDrivers.map((driver) => (
      <tr key={driver._id}>
        <td>{driver.name}</td>
        <td>
          {editingDriverId === driver._id ? (
            <DatePicker
              selected={editFromDate}
              onChange={(date) => setEditFromDate(date)}
              showTimeSelect
              dateFormat="Pp"
              className='dteedidri'
            />
          ) : (
            formatDate(new Date(driver.from))
          )}
        </td>
        <td>
          {editingDriverId === driver._id ? (
            <DatePicker
              selected={editTillDate}
              onChange={(date) => setEditTillDate(date)}
              showTimeSelect
              dateFormat="Pp"
              className='dteedidri'
            />
          ) : (
            driver.till ? formatDate(new Date(driver.till)) : 'Present'
          )}
        </td>
        <td>{driver.status}</td>
        
        <td>
          {editingDriverId === driver._id ? (
            <>
            <div className='buttonsinside'>
                   <img src={checkIcon} alt="Submit" style={{ cursor: 'pointer', width: '13%' }} onClick={submitEdit} />
            <img src={cancelIcon} alt="Cancel" style={{ cursor: 'pointer', width: '13%', marginLeft: '10px' }} onClick={() => cancelEdit()} />
            </div>
            </>
          ) : (
            <>
               <div className='buttonsinside'>
              <img src={editIcon} alt="Edit" style={{ cursor: 'pointer',width:'13%' }} onClick={() => startEdit(driver._id)} />
              <img src={del} alt="Delete" style={{ cursor: 'pointer', width: '13%', marginLeft: '10px' }} onClick={() => prepareForDeletion(driver)} />
              </div>
            </>
          )}
        </td>
       
      </tr>
    ))}
  </tbody>
</table>

     <h2 className='titlcure'>Driver History</h2>
    <table>
      <thead>
        <tr>
          <th>Driver name</th>
          <th>From</th>
          <th>To</th>
          <th>Status</th>
         
        </tr>
      </thead>
      <tbody>
        {historyDrivers.map((driver, index) => (
          <tr key={index}>
            <td>{driver.name}</td>
            <td>{driver.from}</td>
            <td>{driver.till}</td>
            <td>{driver.status}</td>
           
          </tr>
        ))}
      </tbody>
    </table>
      
 {/* Delete Confirmation Dialog */}
<Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
  <DialogTitle>{"Confirm Deletion"}</DialogTitle>
  <DialogContent>
    <DialogContentText>
      Are you sure you want to delete this driver from the car?
    </DialogContentText>
  </DialogContent>
  <DialogActions>
  <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
  <Button onClick={() => confirmDeleteDriver()} color="error">
    Delete
  </Button>
</DialogActions>

</Dialog>

{/* Snackbar for Feedback Messages */}
<Snackbar open={snackbarInfo.open} autoHideDuration={5000} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} onClose={() => setSnackbarInfo({ ...snackbarInfo, open: false })}>
  <Alert onClose={() => setSnackbarInfo({ ...snackbarInfo, open: false })} severity={snackbarInfo.severity}>
    {snackbarInfo.message}
  </Alert>
</Snackbar>

    </div>
  );
};

export default DriversOfCar;