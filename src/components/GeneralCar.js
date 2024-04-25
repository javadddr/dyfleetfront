import React,{useState,useEffect} from 'react';
import "./GeneralCar.css"
import editIcon from './edit.svg'; // Path to your edit icon
import checkIcon from './check.svg'; // Path to your check icon
import { useCars } from '../CarsContext';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Snackbar, Alert } from '@mui/material';

const GeneralCar = ({ car: propCar,onCarUpdate,onDeleted }) => {
  const [car, setCar] = useState(propCar); // New state to manage car data
  const { refreshCars } = useCars();
  const [showConfirm, setShowConfirm] = useState(false);
  const startDate = new Date(car.general.activeInFleetSinceDate);
  const RegistratiDate = new Date(car.general.registrationDate);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbarInfo, setSnackbarInfo] = useState({
    open: false,
    severity: '', // 'success' or 'error'
    message: '',
  });
  
 
  const [editValues, setEditValues] = useState({});
 
  useEffect(() => {
    setCar(propCar);
  }, [propCar]);

  const [areas, setAreas] = useState([]);
  const token = localStorage.getItem('userToken');
  const options = { year: 'numeric', month: 'short' };
  const formattedDate = startDate.toLocaleDateString('en-US', options);
  const [isEditing, setIsEditing] = useState({});
  const formattregisterDate = RegistratiDate.toLocaleDateString('en-US', options);

  const handleDeleteClick = () => {
    setOpenDialog(true);
  };
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/areas`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch areas');
        }
        const areasData = await response.json();
        setAreas(areasData.map(area => area.areaName)); // Assuming you just need the area names
      } catch (error) {
        console.error('Error fetching areas:', error);
      }
    };

    fetchAreas();
  }, [token]); // Re-fetch if token changes
  const currentDate = new Date();
  const differenceInMilliseconds = currentDate - startDate;
  const differenceInYears = differenceInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
  const age = Math.round(differenceInYears * 10) / 10; // Round to one decimal place
  const deleteCar = async () => {
  

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/cars/${car._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete the car');
      }

      setSnackbarInfo({ open: true, severity: 'success', message: 'Car deleted successfully.' });
      setOpenDialog(false);
       refreshCars(); // Refresh the list of cars or take any other appropriate action
       if (onDeleted) onDeleted(); // If there's a callback to handle the deletion (like closing the details view), call it
     } catch (error) {
       console.error('Error deleting car:', error);
       setSnackbarInfo({ open: true, severity: 'error', message: 'Error deleting car.' });
       setOpenDialog(false);
     }
  };


  const handleEditChange = (fieldName, value, isGeneralField = true) => {
    // Directly storing value and isGeneralField flag without nesting them
    setEditValues({ ...editValues, [fieldName]: { value, isGeneralField } });
  };
const handleSaveClick = async (fieldName) => {
  setIsEditing({ ...isEditing, [fieldName]: false });
  let updateData;
  if (editValues[fieldName].isGeneralField) {
    updateData = { general: { ...car.general, [fieldName]: editValues[fieldName].value } };
  } else {
    // For top-level fields like 'state'
    updateData = { [fieldName]: editValues[fieldName].value };
  }
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/cars/${car._id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error('Failed to update the car');
    }
    const updatedCar = await response.json();
    setCar(updatedCar); //
    onCarUpdate(updatedCar);
    setSnackbarInfo({ open: true, severity: 'success', message: 'Car saved successfully.' });
    refreshCars();
  } catch (error) {
    console.error('Error updating car:', error);
    setSnackbarInfo({ open: true, severity: 'error', message: 'Error saving car details.' });
  }
};

  // Example for editing internalName
  const handleEditClick = (fieldName, isGeneralField = true) => {
    setIsEditing({ ...isEditing, [fieldName]: true });
    // Correctly pre-fill the current value on edit based on whether the field is within 'general' or top-level
    const currentValue = isGeneralField ? car.general[fieldName] : car[fieldName];
    setEditValues({ ...editValues, [fieldName]: { value: currentValue, isGeneralField } });
  };
  

  
  return (
    <div>
      <h3>General Information</h3>
      <div className='generalgeneral'>
        <p>Internal Name:</p>
        {isEditing.internalName ? (
          <div className='checkitemgeneral'>
          <input 
              value={editValues.internalName ? editValues.internalName.value : ''} 
              onChange={(e) => handleEditChange('internalName', e.target.value, true)} 
            />

            <img src={checkIcon} alt="Save" onClick={() => handleSaveClick('internalName')} />
          </div>
        ) : (
          <div className='generalgenerals'>
            {car.general.internalName}
            <div className="edit-icon" onClick={() => handleEditClick('internalName', true)}>
              <img src={editIcon} alt="Edit" />
            </div>
          </div>
        )}
      </div>


      <div className='generalgeneral'>
  <p>State:</p>

    {isEditing.state ? (
      <div className='checkitemgeneral'>
   
          <select 
            value={editValues['state'] ? editValues['state'].value : car.state} 
            onChange={(e) => handleEditChange('state', e.target.value, false)} // Note the false flag here for non-general field
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Incoming">Incoming</option>
            <option value="Outgoing">Outgoing</option>
            <option value="Transferring">Transferring</option>
            <option value="Repairing">Repairing</option>
            <option value="No Driver">No Driver</option>
          
          </select>

        <img src={checkIcon} alt="Save" onClick={() => handleSaveClick('state')} />
      </div>
    ) : (
      <div className='generalgenerals'>
      <div onClick={() => handleEditClick('state', car.state, false)}>{car.state}</div>
      </div>
    )}
  </div>


  <div className='generalgeneral'>
        <p>License Plate:</p>
        {isEditing.licensePlate ? (
          <div className='checkitemgeneral'>
           <input 
           
            value={editValues['licensePlate'] ? editValues['licensePlate'].value : car.licensePlate} 

            onChange={(e) => handleEditChange('licensePlate', e.target.value,true)} 
          />
            <img src={checkIcon} alt="Save" onClick={() => handleSaveClick('licensePlate')} />
          </div>
        ) : (
          <div className='generalgenerals'>
          {car.general.licensePlate || <span className="placeholder">No License Plate</span>}
          <div className="edit-icon" onClick={() => handleEditClick('licensePlate', true)}>
            <img src={editIcon} alt="Edit" />
          </div>
        </div>
        
        )}
      </div>
      



      <div className='generalgeneral'>
  <p>Vehicle Type:</p>
  {isEditing.vehicleType ? (
    <div className='checkitemgeneral'>
      <select 
        value={editValues['vehicleType'] ? editValues['vehicleType'].value : car.general.vehicleType} 
        onChange={(e) => handleEditChange('vehicleType', e.target.value, true)} // Note the true flag here for general field
      >
        <option value="Car">Car</option>
        <option value="Transporter">Transporter</option>
        <option value="Two-wheeler">Two-wheeler</option>
        <option value="Truck">Truck</option>
        <option value="Bus">Bus</option>
        <option value="Build up">Build up</option>
        <option value="Excavator">Excavator</option>
        <option value="Tractor">Tractor</option>
        <option value="Trailer">Trailer</option>
        <option value="Special vehicle">Special vehicle</option>
        <option value="Swap body">Swap body</option>
      </select>
      <img src={checkIcon} alt="Save" onClick={() => handleSaveClick('vehicleType')} />
    </div>
  ) : (
    <div className='generalgenerals' onClick={() => handleEditClick('vehicleType', car.general.vehicleType, true)}>
      {car.general.vehicleType || "Select vehicle type"} {/* Show "Select vehicle type" if no vehicleType is set */}
      <div className="edit-icon">
        <img src={editIcon} alt="Edit" />
      </div>
    </div>
  )}
</div>


      
     
<div className='generalgeneral'>
  <p>Location:</p>
  {isEditing.location ? (
    <div className='checkitemgeneral'>
      <input
        type="text"
        value={editValues['location'] ? editValues['location'].value : car.general.location || ''}
        onChange={(e) => handleEditChange('location', e.target.value, true)}
      />
      <img src={checkIcon} alt="Save" onClick={() => handleSaveClick('location')} />
    </div>
  ) : (
    <div className='generalgenerals' onClick={() => handleEditClick('location', car.general.location, true)}>
      {car.general.location || "No Location Set"}
      <div className="edit-icon">
        <img src={editIcon} alt="Edit" />
      </div>
    </div>
  )}
</div>

<div className='generalgeneral'>
  <p>Area:</p>
  {isEditing.area ? (
    <div className='checkitemgeneral'>
     <select 
  value={editValues['area'] ? editValues['area'].value : car.area || ''}
  onChange={(e) => handleEditChange('area', e.target.value, false)}
  style={{ minWidth: '150px' }} // Set minimum width to 300px
>
<option value="" >Select Area</option>
  {areas.map((areaName, index) => (
    // Use the area name directly for both the value and display text
    <option key={index} value={areaName}>{areaName}</option>
  ))}
</select>

      <img src={checkIcon} alt="Save" style={{ cursor: 'pointer' }} onClick={() => handleSaveClick('area')} />
    </div>
  ) : (
    <div className='generalgenerals' onClick={() => handleEditClick('area', false)}>
      {car.area || "Select Area"}
      <div className="edit-icon">
        <img src={editIcon} alt="Edit" style={{ cursor: 'pointer' }} />
      </div>
    </div>
  )}
</div>

<div className='generalgeneral'>
  <p>Registered In:</p>
  {isEditing.registeredIn ? (
    <div className='checkitemgeneral'>
      <input
        type="text"
        value={editValues['registeredIn'] ? editValues['registeredIn'].value : car.general.registeredIn || ''}
        onChange={(e) => handleEditChange('registeredIn', e.target.value, true)} // `true` because it's within `general`
      />
      <img src={checkIcon} alt="Save" onClick={() => handleSaveClick('registeredIn')} />
    </div>
  ) : (
    <div className='generalgenerals' onClick={() => handleEditClick('registeredIn', car.general.registeredIn, true)}>
      {car.general.registeredIn || "No Affiliated Company"}
      <div className="edit-icon">
        <img src={editIcon} alt="Edit" />
      </div>
    </div>
  )}
</div>




<div className='generalgeneral'>
  <p>Registration Date:</p>
  {isEditing.registrationDate ? (
    <div className='checkitemgeneral'>
      <input
        type="date"
        value={editValues['registrationDate'] ? editValues['registrationDate'].value : car.general.registrationDate ? car.general.registrationDate.substring(0, 10) : ''}
        onChange={(e) => handleEditChange('registrationDate', e.target.value, true)} // `true` because it's within `general`
      />
      <img src={checkIcon} alt="Save" onClick={() => handleSaveClick('registrationDate')} />
    </div>
  ) : (
    <div className='generalgenerals' onClick={() => handleEditClick('registrationDate', car.general.registrationDate, true)}>
      {car.general.registrationDate ? new Date(car.general.registrationDate).toLocaleDateString() : "Set Date"}
      <div className="edit-icon">
        <img src={editIcon} alt="Edit" />
      </div>
    </div>
  )}
</div>

<div className='generalgeneral'>
  <p>Active In Fleet Since:</p>
  {isEditing.activeInFleetSinceDate ? (
    <div className='checkitemgeneral'>
      <input
        type="date"
        value={editValues['activeInFleetSinceDate'] ? editValues['activeInFleetSinceDate'].value : car.general.activeInFleetSinceDate ? car.general.activeInFleetSinceDate.substring(0, 10) : ''}
        onChange={(e) => handleEditChange('activeInFleetSinceDate', e.target.value, true)} // `true` for nested within `general`
      />
      <img src={checkIcon} alt="Save" onClick={() => handleSaveClick('activeInFleetSinceDate')} />
    </div>
  ) : (
    <div className='generalgenerals' onClick={() => handleEditClick('activeInFleetSinceDate', car.general.activeInFleetSinceDate, true)}>
      {car.general.activeInFleetSinceDate ? new Date(car.general.activeInFleetSinceDate).toLocaleDateString() + ` (${age} ${age>1 ? 'Years' : 'Year'} ago)` : "Set Date"}
      <div className="edit-icon">
        <img src={editIcon} alt="Edit" />
      </div>
    </div>
  )}
</div>

     
      
<div className='generalgeneral'>
  <p>Financing Type:</p>
  {isEditing.financingType ? (
    <div className='checkitemgeneral'>
      <select 
        value={editValues['financingType'] ? editValues['financingType'].value : car.general.financingType || ''}
        onChange={(e) => handleEditChange('financingType', e.target.value, true)} // `true` because it's within `general`
      >
        <option value="Leasing">Leasing</option>
        <option value="Long term rental(leasing)">Long term rental(leasing)</option>
        <option value="Credit">Credit</option>
        <option value="Purchase">Purchase</option>
        <option value="Long term rental">Long term rental</option>
      </select>
      <img src={checkIcon} alt="Save" onClick={() => handleSaveClick('financingType')} />
    </div>
  ) : (
    <div className='generalgenerals' onClick={() => handleEditClick('financingType', car.general.financingType, true)}>
      {car.general.financingType || "Select Financing Type"}
      <div className="edit-icon">
        <img src={editIcon} alt="Edit" />
      </div>
    </div>
  )}
</div>

<div className='generalgeneral'>
  <p>Affiliated Company:</p>
  {isEditing.affiliatedCompany ? (
    <div className='checkitemgeneral'>
      <input
        type="text"
        value={editValues['affiliatedCompany'] ? editValues['affiliatedCompany'].value : car.general.affiliatedCompany || ''}
        onChange={(e) => handleEditChange('affiliatedCompany', e.target.value, true)} // `true` because it's within `general`
      />
      <img src={checkIcon} alt="Save" onClick={() => handleSaveClick('affiliatedCompany')} />
    </div>
  ) : (
    <div className='generalgenerals' onClick={() => handleEditClick('affiliatedCompany', car.general.affiliatedCompany, true)}>
      {car.general.affiliatedCompany || "No Affiliated Company"}
      <div className="edit-icon">
        <img src={editIcon} alt="Edit" />
      </div>
    </div>
  )}
</div>


<div className='generalgeneral'>
  <p>Tare Weight:</p>
  {isEditing.tareWeightKg ? (
    <div className='checkitemgeneral'>
      <input
        type="number"
        step="0.01" // Allows decimal values; adjust step as needed for your precision requirements
        value={editValues['tareWeightKg'] ? editValues['tareWeightKg'].value : car.general.tareWeightKg || ''}
        onChange={(e) => handleEditChange('tareWeightKg', e.target.value, true)} // `true` because it's within `general`
      />
      <img src={checkIcon} alt="Save" onClick={() => handleSaveClick('tareWeightKg')} />
    </div>
  ) : (
    <div className='generalgenerals' onClick={() => handleEditClick('tareWeightKg', car.general.tareWeightKg, true)}>
      {car.general.tareWeightKg || car.general.tareWeightKg === 0 ? car.general.tareWeightKg : "Set Tare Weight"}
      <div className="edit-icon">
        <img src={editIcon} alt="Edit" />
      </div>
    </div>
  )}
</div>

<div className='generalgeneral'>
  <p>Load Capacity:</p>
  {isEditing.loadCapacityKg ? (
    <div className='checkitemgeneral'>
      <input
        type="number"
        value={editValues['loadCapacityKg'] ? editValues['loadCapacityKg'].value : car.general.loadCapacityKg || ''}
        onChange={(e) => handleEditChange('loadCapacityKg', e.target.value, true)} // `true` because it's within `general`
      />
      <img src={checkIcon} alt="Save" onClick={() => handleSaveClick('loadCapacityKg')} />
    </div>
  ) : (
    <div className='generalgenerals' onClick={() => handleEditClick('loadCapacityKg', car.general.loadCapacityKg, true)}>
      {car.general.loadCapacityKg || car.general.loadCapacityKg === 0 ? `${car.general.loadCapacityKg}` : "Set Load Capacity"}
      <div className="edit-icon">
        <img src={editIcon} alt="Edit" />
      </div>
    </div>
  )}
</div>

<div className='generalgeneral'>
  <p>Tensile Load:</p>
  {isEditing.tensileLoadKg ? (
    <div className='checkitemgeneral'>
      <input
        type="number"
        step="any" // Allows decimal values if your application needs them
        value={editValues['tensileLoadKg'] ? editValues['tensileLoadKg'].value : car.general.tensileLoadKg || ''}
        onChange={(e) => handleEditChange('tensileLoadKg', e.target.value, true)} // True for nested within `general`
      />
      <img src={checkIcon} alt="Save" onClick={() => handleSaveClick('tensileLoadKg')} />
    </div>
  ) : (
    <div className='generalgenerals' onClick={() => handleEditClick('tensileLoadKg', car.general.tensileLoadKg, true)}>
      {car.general.tensileLoadKg || car.general.tensileLoadKg === 0 ? `${car.general.tensileLoadKg}` : "Set Tensile Load"}
      <div className="edit-icon">
        <img src={editIcon} alt="Edit" />
      </div>
    </div>
  )}
</div>

<div className='generalgeneral'>
  <p>Trailer Load:</p>
  {isEditing.trailerLoadKg ? (
    <div className='checkitemgeneral'>
      <input
        type="number"
        step="any" // Use "any" for decimal values, or specify another step value for different increments
        value={editValues['trailerLoadKg'] ? editValues['trailerLoadKg'].value : car.general.trailerLoadKg || ''}
        onChange={(e) => handleEditChange('trailerLoadKg', e.target.value, true)} // True because it's nested within `general`
      />
      <img src={checkIcon} alt="Save" onClick={() => handleSaveClick('trailerLoadKg')} />
    </div>
  ) : (
    <div className='generalgenerals' onClick={() => handleEditClick('trailerLoadKg', car.general.trailerLoadKg, true)}>
      {car.general.trailerLoadKg || car.general.trailerLoadKg === 0 ? `${car.general.trailerLoadKg}` : "Set Trailer Load"}
      <div className="edit-icon">
        <img src={editIcon} alt="Edit" />
      </div>
    </div>
  )}
</div>

<div className='generalgeneral'>
  <p>Internal Capacity ({car.general.internalUnitName}):</p>
  <div>
  {isEditing.unitCapacity ? (
    <div className='checkitemgeneral'>
     
      <input
        type="text"
        value={editValues['unitCapacity'] ? editValues['unitCapacity'].value : car.general.unitCapacity || ''}
        onChange={(e) => handleEditChange('unitCapacity', e.target.value, true)}
      />
      <img src={checkIcon} alt="Save" onClick={() => handleSaveClick('unitCapacity')} />
    </div>
  ) : (
    <div className='generalgenerals' onClick={() => handleEditClick('unitCapacity', car.general.unitCapacity, true)}>
      {car.general.unitCapacity || "No Unit-Capacity Set"}
      <div className="edit-icon">
        <img src={editIcon} alt="Edit" />
      </div>
    </div>
  )}
  {isEditing.internalUnitName ? (
    <div className='checkitemgeneral'>
     
      <input
        type="text"
        value={editValues['internalUnitName'] ? editValues['internalUnitName'].value : car.general.internalUnitName || ''}
        onChange={(e) => handleEditChange('internalUnitName', e.target.value, true)}
      />
      <img src={checkIcon} alt="Save" onClick={() => handleSaveClick('internalUnitName')} />
    </div>
  ) : (
    <div className='generalgenerals' onClick={() => handleEditClick('internalUnitName', car.general.internalUnitName, true)}>
      {car.general.internalUnitName || "No Unit-Capacity Set"}
      <div className="edit-icon">
        <img src={editIcon} alt="Edit" />
      </div>
    </div>
  )}
  </div>
</div>


<div className='generalgeneral'>
  <p>Vehicle License Check:</p>
  <div className='checkitemgeneral'>
    {/* Ensure carLicenseCheck and statuses array are checked for content */}
    {car.carLicenseCheck && car.carLicenseCheck.length > 0 &&
      car.carLicenseCheck[car.carLicenseCheck.length - 1].statuses &&
      car.carLicenseCheck[car.carLicenseCheck.length - 1].statuses.length > 0 && (
        <>
          {new Date(car.carLicenseCheck[car.carLicenseCheck.length - 1].statuses[car.carLicenseCheck[car.carLicenseCheck.length - 1].statuses.length - 1].updatedAt).toISOString().split('T')[0]} 
          <span>
            {car.carLicenseCheck[car.carLicenseCheck.length - 1].statuses[car.carLicenseCheck[car.carLicenseCheck.length - 1].statuses.length - 1].status}
          </span>
        </>
    )}
  </div>
</div>


      <button onClick={handleDeleteClick} className="GEN-CAR-delete-button">Delete Car</button>
     
<Dialog
  open={openDialog}
  onClose={() => setOpenDialog(false)}
  aria-labelledby="alert-dialog-title"
  aria-describedby="alert-dialog-description"
>
  <DialogTitle id="alert-dialog-title">{"Delete Car?"}</DialogTitle>
  <DialogContent>
    <DialogContentText id="alert-dialog-description">
      Are you sure you want to delete this car? This action cannot be undone.
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
    <Button onClick={deleteCar} autoFocus color="error">
      Delete
    </Button>
  </DialogActions>
</Dialog>

{/* Snackbar for Alerts */}
<Snackbar
  open={snackbarInfo.open}
  autoHideDuration={6000}
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

export default GeneralCar;
