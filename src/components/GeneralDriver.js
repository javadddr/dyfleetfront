import React,{useState,useEffect} from 'react';
import "./GeneralCar.css"
import editIcon from './edit.svg'; // Path to your edit icon
import checkIcon from './check.svg'; // Path to your check icon
import { useCars } from '../CarsContext';
import { useDrivers } from '../DriversContext'; // Import useDrivers hook
import "./GeneralDriver.css"
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Snackbar, Alert } from '@mui/material';
const GeneralDriver = ({ driver: propDriver,onDriverUpdate,onDeleted }) => {
  const [driver, setDriver] = useState(propDriver); 
  const [showConfirm, setShowConfirm] = useState(false);
  const { refreshDrivers } = useDrivers();
  const [editValues, setEditValues] = useState({});
  const startDate = new Date(driver.startDate);
  const RegistratiDate = new Date(driver.endDate);
  const sortedDriverLicenseChecks = driver.driverLicenseCheck.sort((a, b) => new Date(b.date) - new Date(a.date));
  const mostRecentLicenseCheck = sortedDriverLicenseChecks.length > 0 ? sortedDriverLicenseChecks[0] : null;
console.log(mostRecentLicenseCheck)
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbarInfo, setSnackbarInfo] = useState({
    open: false,
    severity: '', // 'success' or 'error'
    message: '',
  });
  useEffect(() => {
    setDriver(propDriver);
  }, [propDriver]);


  const token = localStorage.getItem('userToken');
  const options = { year: 'numeric', month: 'short' };
  const formattedDate = startDate.toLocaleDateString('en-US', options);
  const [isEditing, setIsEditing] = useState({});
  const formattregisterDate = RegistratiDate.toLocaleDateString('en-US', options);
  const handleDeleteClick = () => {
    setOpenDialog(true);
  };
  const currentDate = new Date();
  const differenceInMilliseconds = currentDate - startDate;
  const differenceInYears = differenceInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
  const age = Math.round(differenceInYears * 10) / 10; 



  const deleteDriver = async () => {

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/drivers/${driver._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete the car');
      }
     
      setSnackbarInfo({ open: true, severity: 'success', message: 'Driver deleted successfully.' })
      setOpenDialog(false);
      
       refreshDrivers(); // Refresh the list of cars or take any other appropriate action
       if (onDeleted) onDeleted(); // If there's a callback to handle the deletion (like closing the details view), call it
     } catch (error) {
       console.error('Error deleting car:', error);
       setSnackbarInfo({
        open: true,
        severity: 'error',
        message: 'Error deleting driver.',
      });
     
     }
  };
  const mostRecentStatusUpdate = driver.driverLicenseCheck.reduce((latest, check) => {
    return check.statuses.reduce((last, statusUpdate) => {
      const currentUpdateTime = new Date(statusUpdate.updatedAt).getTime();
      if (currentUpdateTime > last.time) {
        return { time: currentUpdateTime, status: statusUpdate.status, date: statusUpdate.updatedAt };
      }
      return last;
    }, latest);
  }, { time: 0, status: '', date: '' });

  const handleEditChange = (fieldName, value) => {
    setEditValues(prev => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], value },
    }));
  };
  


  const handleSaveClick = async () => {
    const updatedFields = Object.keys(editValues).reduce((acc, key) => {
      const editValue = editValues[key];
      acc[key] = editValue.value; // Use the value from editValues
      return acc;
    }, {});
  
    // Now, updatedFields object contains all the fields that were edited
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/drivers/${driver._id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFields),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update the driver');
      }
  
      const updatedDriver = await response.json();
      setDriver(updatedDriver); // Update local state with the updated driver info
      onDriverUpdate(updatedDriver); // Assuming this is a prop function to handle the update in a parent component
      setIsEditing({}); // Reset editing state
      setEditValues({}); // Clear edit values
      refreshDrivers(); // Refresh drivers list if necessary
    } catch (error) {
      console.error('Error updating driver:', error);
      alert('Error updating driver');
    }
  };
  
 
  const handleEditClick = (fieldName) => {
    setIsEditing({ ...isEditing, [fieldName]: true });
    if (!editValues[fieldName]) {
      // Initialize editValues with the current driver field value
      setEditValues(prev => ({
        ...prev,
        [fieldName]: { value: driver[fieldName], isGeneralField: true },
      }));
    }
  };
  


  
  return (
    <div className='fingeraterscan'>
  
      <h3>General Information</h3>
      <div className='generalgeneral'>
        <p> Name:</p>
        {isEditing.firstName ? (
          <div className='checkitemgeneral'>
          <input 
              value={editValues.firstName ? editValues.firstName.value : ''} 
              onChange={(e) => handleEditChange('firstName', e.target.value, true)} 
            />

            <img src={checkIcon} alt="Save" onClick={() => handleSaveClick('firstName')} />
          </div>
        ) : (
          <div className='generalgenerals'>
            {driver.firstName}
            <div className="edit-icon" onClick={() => handleEditClick('firstName', true)}>
              <img src={editIcon} alt="Edit" />
            </div>
          </div>
        )}
      </div>

      <div className='generalgeneral'>
        <p> Last Name:</p>
        {isEditing.lastName ? (
          <div className='checkitemgeneral'>
          <input 
              value={editValues.lastName ? editValues.lastName.value : ''} 
              onChange={(e) => handleEditChange('lastName', e.target.value, true)} 
            />

            <img src={checkIcon} alt="Save" onClick={() => handleSaveClick('lastName')} />
          </div>
        ) : (
          <div className='generalgenerals'>
            {driver.lastName || "No Last Name"}
            <div className="edit-icon" onClick={() => handleEditClick('lastName', true)}>
              <img src={editIcon} alt="Edit" />
            </div>
          </div>
        )}
      </div>
   

      <div className='generalgeneral'>
  <p>Status:</p>

    {isEditing.status ? (
      <div className='checkitemgeneral'>
   
          <select 
            value={editValues['status'] ? editValues['status'].value : driver.status} 
            onChange={(e) => handleEditChange('status', e.target.value, false)} // Note the false flag here for non-general field
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Sick">Sick</option>
            <option value="Holiday">Holiday</option>
            <option value="Over Hours">Over Hours</option>
            <option value="Work Accident">Work Accident</option>
           
          
          </select>

        <img src={checkIcon} alt="Save" onClick={() => handleSaveClick('status')} />
      </div>
    ) : (
      <div className='generalgenerals'>
      <div onClick={() => handleEditClick('status', driver.status, false)}>{driver.status}</div>
      </div>
    )}
  </div>


 
      





      
     
<div className='generalgeneral'>
  <p>Address (Location):</p>
  {isEditing.address ? (
    <div className='checkitemgeneral'>
      <input
        type="text"
        value={editValues['address'] ? editValues['address'].value : driver.address|| ''}
        onChange={(e) => handleEditChange('address', e.target.value, true)}
      />
      <img src={checkIcon} alt="Save" onClick={() => handleSaveClick('address')} />
    </div>
  ) : (
    <div className='generalgenerals' onClick={() => handleEditClick('address', driver.address, true)}>
      {driver.address || "No Location Set"}
      <div className="edit-icon">
        <img src={editIcon} alt="Edit" />
      </div>
    </div>
  )}
</div>


<div className='generalgeneral'>
        <p> Email:</p>
        {isEditing.email ? (
          <div className='checkitemgeneral'>
          <input 
              value={editValues.email ? editValues.email.value : ''} 
              onChange={(e) => handleEditChange('email', e.target.value, true)} 
            />

            <img src={checkIcon} alt="Save" onClick={() => handleSaveClick('email')} />
          </div>
        ) : (
          <div className='generalgenerals'>
            {driver.email || "No Email"}
            <div className="edit-icon" onClick={() => handleEditClick('email', true)}>
              <img src={editIcon} alt="Edit" />
            </div>
          </div>
        )}
      </div>

      <div className='generalgeneral'>
        <p> Mobile:</p>
        {isEditing.mobile ? (
          <div className='checkitemgeneral'>
          <input 
              value={editValues.mobile ? editValues.mobile.value : ''} 
              onChange={(e) => handleEditChange('mobile', e.target.value, true)} 
            />

            <img src={checkIcon} alt="Save" onClick={() => handleSaveClick('mobile')} />
          </div>
        ) : (
          <div className='generalgenerals'>
            {driver.mobile || "No Mobile"}
            <div className="edit-icon" onClick={() => handleEditClick('mobile', true)}>
              <img src={editIcon} alt="Edit" />
            </div>
          </div>
        )}
      </div>



<div className='generalgeneral'>
  <p>Start Date:</p>
  {isEditing.startDate ? (
    <div className='checkitemgeneral'>
      <input
        type="date"
        value={editValues['startDate'] ? editValues['startDate'].value : driver.startDate ? driver.startDate.substring(0, 10) : ''}
        onChange={(e) => handleEditChange('startDate', e.target.value, true)} // `true` because it's within `general`
      />
      <img src={checkIcon} alt="Save" onClick={() => handleSaveClick('startDate')} />
    </div>
  ) : (
    <div className='generalgenerals' onClick={() => handleEditClick('startDate', driver.startDate, true)}>
      {driver.startDate ? new Date(driver.startDate).toLocaleDateString() : "Set Date"}
      <div className="edit-icon">
        <img src={editIcon} alt="Edit" />
      </div>
    </div>
  )}
</div>

<div className='generalgeneral'>
  <p>End Date:</p>
  {isEditing.endDate ? (
    <div className='checkitemgeneral'>
      <input
        type="date"
        value={editValues['endDate'] ? editValues['endDate'].value : driver.endDate ? driver.endDate.substring(0, 10) : ''}
        onChange={(e) => handleEditChange('endDate', e.target.value, true)} // `true` because it's within `general`
      />
      <img src={checkIcon} alt="Save" onClick={() => handleSaveClick('endDate')} />
    </div>
  ) : (
    <div className='generalgenerals' onClick={() => handleEditClick('endDate', driver.endDate, true)}>
      {driver.endDate ? new Date(driver.endDate).toLocaleDateString() : "Set Date"}
      <div className="edit-icon">
        <img src={editIcon} alt="Edit" />
      </div>
    </div>
  )}
</div>

<div className='generalgeneral'>
        <p>Most Recent License Check:</p>
        {mostRecentStatusUpdate.date ? (
          <div className='checkitemgeneral'>
            <p>Date: {new Date(mostRecentStatusUpdate.date).toLocaleDateString()}</p>
            <span>Status: {mostRecentStatusUpdate.status}</span>
          </div>
        ) : (
          <div className='generalgenerals'>
            <p>No license checks recorded</p>
          </div>
        )}
      </div>

      <button onClick={handleDeleteClick} className="GEN-CAR-delete-button1">Delete Driver</button>
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Driver?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this driver? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={deleteDriver} autoFocus color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Alerts */}
      <Snackbar
        open={snackbarInfo.open}
        autoHideDuration={5000}
        onClose={() => setSnackbarInfo({ ...snackbarInfo, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarInfo({ ...snackbarInfo, open: false })} severity={snackbarInfo.severity} sx={{ width: '100%' }}>
          {snackbarInfo.message}
        </Alert>
      </Snackbar>
     

    </div>
  );
};



export default GeneralDriver;