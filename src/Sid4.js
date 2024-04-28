import React, { useState, useEffect,useRef ,useCallback} from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useDropzone } from 'react-dropzone';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';
import { useDrivers } from './DriversContext'; 
import SendIcon from '@mui/icons-material/Send';
import { useCars } from './CarsContext';
import Box from '@mui/material/Box';
import EditIcon from '@mui/icons-material/Edit';
import Stack from '@mui/material/Stack';
import Loading from './Loading'; // Adjust the path as necessary
import { unparse } from 'papaparse';
import { saveAs } from 'file-saver';
import plusi from "./plusi.svg"
import * as XLSX from 'xlsx';
import "./Sid4.css"
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import editIcon from './components/edit.svg'; // Path to your edit icon
import del from './components/del.svg'; // Path to your edit icon
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {  Accordion, AccordionSummary, AccordionDetails, AccordionActions } from '@mui/material';
import { Snackbar, Alert } from '@mui/material';
const FileUploadContainer = styled('div')(({ theme, isDragActive }) => ({
  border: '2px dashed #eeeeee',
  background: isDragActive ? '#e3f2fd' : 'none', // Change background color when dragging
  padding: theme.spacing(2),
  width: 575,
  textAlign: 'center',
  marginBottom: theme.spacing(2),
  cursor: 'pointer',
  transition: 'background-color 0.2s ease-in-out',
}));

const fineTypes = [
  { label: 'Speeding', value: 'speeding' },
  { label: 'Wrong Parking', value: 'wrong parking' },
  { label: 'Seat Belt Violations', value: 'seat belt violations' },
  { label: 'Running Red Lights or Stop Signs', value: 'running red lights or stop signs' },
  { label: 'DUI/DWI', value: 'DUI/DWI' },
  { label: 'Distracted Driving', value: 'distracted driving' },
  { label: 'Reckless Driving', value: 'reckless driving' },
  { label: 'Driving Without a Valid License or With a Suspended License', value: 'driving without license or with suspended license' },
  { label: 'Failure to Yield', value: 'failure to yield' },
  { label: 'Expired Registration or Inspection', value: 'expired registration or inspection' },
  { label: 'Improper Turns', value: 'improper turns' },
  { label: 'Driving Without Insurance', value: 'driving without insurance' },
  { label: 'Tailgating', value: 'tailgating' },
  { label: 'Illegal Lane Changes', value: 'illegal lane changes' },
  { label: 'Driving Too Slowly', value: 'driving too slowly' },
  { label: 'Vehicle Equipment Violations', value: 'vehicle equipment violations' },
];
const fineStatuses = [
  { label: 'Open', value: 'open' },
  { label: 'Discarded', value: 'discarded' },
  { label: 'Paid', value: 'paid' },
];


const fineForOptions = [
  { label: 'Car', value: 'car' },
  { label: 'Driver', value: 'driver' },
];

const Sid4 = () => {
  const [fines, setFines] = useState([]);
  // State to track which fine is currently being edited
const [editingFineId, setEditingFineId] = useState(null);
const [tempFor, setTempFor] = useState("");
const [tempStatus, setTempStatus] = useState("");

// State to store the temporary description value during editing
const [tempDescription, setTempDescription] = useState("");

  const [form, setForm] = useState({
    issueDate: null,
    occureDate: null,
    description: '',
    for: '',
    type: '',
    cost: '',
    driverName: '',
    carName: '',
    dueDate: null,
    status: '',
    issuedFrom: '',
    location: '',
    file: null,
  });
  


  const [accordionExpanded, setAccordionExpanded] = useState(false); // Start expanded
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFineId, setSelectedFineId] = useState(null);
  const handleDeleteClick = (fineId) => {
    setSelectedFineId(fineId);
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFineId(null); // Reset selected fine ID
  };
  const [isFormVisible, setIsFormVisible] = useState(false); // State to control form visibility

  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  // Adjust the snackbarInfo state to manage the snackbar's open state, message, and severity
  const [snackbarInfo, setSnackbarInfo] = useState({ open: false, message: '', severity: '' });

  // Function to programmatically click the hidden file input
  const handleFileButtonClick = (event) => {
    event.stopPropagation(); // Prevent the dropzone from triggering
    fileInputRef.current.click(); // Click the file input using the ref
  };

  const handleFileRemove = (event) => {
    event.preventDefault(); // Prevent default behavior
    event.stopPropagation(); // Stop the event from bubbling up
    setForm({ ...form, file: null });
  };
  const { cars, refreshCars } = useCars();
  const { drivers, refreshDrivers } = useDrivers();
  console.log(cars)
  useEffect(() => {
    refreshDrivers();
  }, []);
  useEffect(() => {
    refreshCars();
  }, []);
  useEffect(() => {
    setLoading(true); 
    fetchFines();
    
  }, []);

  const fetchFines = async () => {
    const token = localStorage.getItem('userToken');
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/fines`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch fines');
      }
      const data = await response.json();
      setFines(data);
      setLoading(false); 
    } catch (error) {
      console.error('Error fetching fines:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, file: e.target.files[0] });
  };
  const carOptions = cars.map(car => ({
    label: `${car.general.internalName} (${car.general.licensePlate})`,
    value: `${car.general.internalName}`, // Adjust this based on what your server expects
  }));
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const token = localStorage.getItem('userToken');
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/fines`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      fetchFines(); // Refresh the fines list
      // Reset the form
      setForm({
        issueDate: '',
        occureDate: '',
        description: '',
        for: '',
        type: '',
        driverName: '',
        carName: '',
        dueDate: '',
        cost:'',
        status: '',
        issuedFrom: '',
        location: '',
        file: null,
      });
      setIsFormVisible(false);
      
      setAccordionExpanded(false); // Close the accordion
      setSnackbarInfo({ open: true, message: 'Fine submitted successfully.', severity: 'success' });
    } catch (error) {
      setSnackbarInfo({ open: true, message: 'Error submitting fine.', severity: 'error' });
    } finally {
     
    }
  };

  const handleChangeDate = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  };


  const onDrop = useCallback((acceptedFiles) => {
    // Handle file drop
    setForm({ ...form, file: acceptedFiles[0] });
  }, [form]);
 
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });


  const driverOptions = drivers.map(driver => ({
    label: `${driver.firstName} ${driver.lastName}`,
    value: `${driver.firstName} ${driver.lastName}`, // Use ID or any unique property if available
  }));

  // Function to close the snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarInfo(prev => ({ ...prev, open: false }));
  };
  const getStatusStyle = (status) => {
    switch (status) {
      case 'paid':
        return {
          color: 'black',
       
          borderRadius: '30px',
          padding: '5px',
          background: '#bcf7e0',
        
          justifyContent:'center',
          textAlign:'center',
        };
      case 'open':
        return {
          color: 'black',
    
          borderRadius: '30px',
          padding: '5px',
          background: '#e4fcbb',
         
          justifyContent:'center',
          textAlign:'center',
        };
      case 'discarded':
        return {
          color: 'black',
        
          borderRadius: '30px',
          padding: '5px',
          background: '#d5d6d2',
      
          justifyContent:'center',
          textAlign:'center',
        };
      default:
        return {};
    }
  };
  
  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  const handleDeleteFine = async () => {
    if (!selectedFineId) return;
    const token = localStorage.getItem('userToken');

    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/fines/${selectedFineId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      fetchFines()
      setOpenDialog(false); // Close the dialog
      setSnackbarInfo({ open: true, message: 'Fine deleted successfully.', severity: 'success' });
    } catch (error) {
      setSnackbarInfo({ open: true, message: 'Error deleting fine.', severity: 'error' });
    }
    setSelectedFineId(null);
  };
  const exportToCSV = () => {
    const csvData = fines.map(fine => ({
      OccurDate: new Date(fine.occureDate).toLocaleDateString(),
      DueDate: new Date(fine.dueDate).toLocaleDateString(),
      Description: fine.description,
      For: fine.for,
      DriverName: fine.driverName,
      CarName: fine.carName,
      Status: fine.status,
      IssuedFrom: fine.issuedFrom,
      Location: fine.location,
      File: fine.file ? `${process.env.REACT_APP_BACKEND_URL}/${fine.file}` : 'No File'
    }));
  
    const csv = unparse(csvData, { header: true });
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "fines.csv");
  };
  
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(fines.map(fine => ({
      OccurDate: new Date(fine.occureDate).toLocaleDateString(),
      DueDate: new Date(fine.dueDate).toLocaleDateString(),
      Description: fine.description,
      For: fine.for,
      DriverName: fine.driverName,
      CarName: fine.carName,
      Status: fine.status,
      IssuedFrom: fine.issuedFrom,
      Location: fine.location,
      File: fine.file ? `${process.env.REACT_APP_BACKEND_URL}/${fine.file}` : 'No File'
    })));
  
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Fines Data");
    XLSX.writeFile(wb, "fines.xlsx");
  };
  
  const handleEditClick = (fineId, description, forValue, status) => {
    setEditingFineId(fineId);
    setTempDescription(description);
    setTempFor(forValue);
    setTempStatus(status); // Initialize the temp status
  };
  
  const handleSaveEdit = async (fineId) => {
    // Prepare the data to be sent to the backend
    const updatedFine = {
      description: tempDescription,
      for: tempFor,
      status: tempStatus, // Include the updated 'for' value
    };
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/fines/${fineId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Include your auth token here if needed
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
        },
        body: JSON.stringify(updatedFine),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update fine');
      }
  
      const updatedData = await response.json();
  
      // Update the fine in the local state to reflect the change
      setFines(fines.map(fine => fine._id === fineId ? { ...fine, description: tempDescription, for: tempFor, status: tempStatus } : fine));
  
      // Reset editing state
      setEditingFineId(null);
      setTempDescription("");
      setTempFor(""); 
      // Optionally show a success message
      setSnackbarInfo({ open: true, message: 'Fine updated successfully.', severity: 'success' });
  
    } catch (error) {
      console.error('Error updating fine:', error);
      // Optionally show an error message
      setSnackbarInfo({ open: true, message: 'Error updating fine.', severity: 'error' });
    }
  };
  
    if (loading) {
      return <Loading />; 
    }
    const userRoles = localStorage.getItem('userRoles');  
    const toggleModal = () => setIsFormVisible(!isFormVisible);
    const closeModal = (event) => {
      // Prevent the modal from closing if the user clicks inside the modal container
      if (event.target === event.currentTarget) {
        setIsFormVisible(false);
      }
    };
    
  return (
    
    <div className="mainformfindid">
      <div className={userRoles === 'user' ? "hidddenforuserdfj" : "containerPPOLmm"}>
      <button className="add-equipment-btn" onClick={toggleModal}>
        <img src={plusi} alt="Add" style={{width:'12%', marginRight: "8px" }} />
        Add New Fine
      </button>
      </div>
     
      {isFormVisible && (
        <div className="modal-backdrop1" onClick={closeModal}>
        <div className="modal-container1">
      <form onSubmit={handleSubmit} className='formfineop'>
        <div className='typdatefinevvb' style={{width: '100%'}}>
          <div className='typdatefinevvbisufinvvb'>
        Add New Fine
        </div>
        <div className="isufinvvb">
  <div>Type of the fine:</div>
  <select
    id="type-combo-box"
    name="type"
    value={form.type || ''}
    onChange={handleChange}
    required
    style={{ width: '250px', height: '35px', margin: '8px' }}
  >
    <option value="">Select Fine Type</option>
    {fineTypes.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
</div>

      <div>

  <div className="isufinvvb">
  <div>Fine's Issue Date:</div>
        <input
          type="date"
          id="issueDate"
          name="issueDate"
          value={form.issueDate || ''}
          onChange={handleChangeDate}  // Using the specialized handler
          required
        />
        </div>
        <div className="isufinvvb">
  <div>Fine's Occur Date:</div>
  <input
      type="date"
      id="occureDate"
      name="occureDate"
      value={form.occureDate || ''}
      onChange={handleChangeDate}
      required
    />
        </div>
        <div className="isufinvvb">
  <div>Fine's Due Date:</div>
  <input
      type="date"
      id="dueDate"
      name="dueDate"
      value={form.dueDate || ''}
      onChange={handleChange}
      required
    />
          </div>
          <div className="isufinvvb">
  <div>Fine's Description:</div>
  <input
    type="text"
    id="description"
    name="description"
    value={form.description || ''}
    onChange={handleChange}
    required
    style={{ width: '250px', height: '35px', margin: '8px' }}
  />
</div>

<div className="isufinvvb">
  <div>Fine's Amount:</div>
  <input
    type="number"
    id="cost"
    name="cost"
    value={form.cost || ''}
    onChange={handleChange}
    required
    style={{ width: '250px', height: '35px', margin: '8px' }}
    min="0" // Optional: Ensures that only non-negative values are entered
  />
</div>

     
      </div>
        </div>

        <div className='typdatefinevvb' style={{width: '100%'}}>
        <div className="isufinvvb">
  <div>Issued For:</div>
  <select
    id="for-combo-box"
    name="for"
    value={form.for || ''}
    onChange={handleChange}
    required
    style={{ width: '250px', height: '35px', margin: '8px' }}
  >
    <option value="">Select Issued For</option>
    {fineForOptions.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
</div>

<div className="isufinvvb">
  <div>Driver Name:</div>
  <select
    id="driver-name-select"
    name="driverName"
    value={form.driverName || ''}
    onChange={handleChange}
    style={{ width: '250px', height: '35px', margin: '8px' }}
  >
    <option value="">Select Driver</option>
    {driverOptions.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
</div>

<div className="isufinvvb">
  <div>Vehicle Name:</div>
  <select
    id="vehicle-name-select"
    name="carName"
    value={form.carName || ''}
    onChange={handleChange}
    style={{ width: '250px', height: '35px', margin: '8px' }}
  >
    <option value="">Select Vehicle</option>
    {carOptions.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
</div>
<div className="isufinvvb">
  <div>Fine's Status:</div>
  <select
    id="status-select"
    name="status"
    value={form.status || ''}
    onChange={handleChange}
    style={{ width: '250px', height: '35px', margin: '8px' }}
  >
    <option value="">Select Status</option>
    {fineStatuses.map((status) => (
      <option key={status.value} value={status.value}>
        {status.label}
      </option>
    ))}
  </select>
</div>

<div className="isufinvvb">
  <div>Which place issued the fine:</div>
  <input
    type="text"
    id="issuedFrom"
    name="issuedFrom"
    value={form.issuedFrom || ''}
    onChange={handleChange}
    required
    style={{ width: '250px', height: '35px', margin: '8px' }}
  />
</div>

<div className="isufinvvb">
  <div>Location of the incident:</div>
  <input
    type="text"
    id="location"
    name="location"
    value={form.location || ''}
    onChange={handleChange}
    required
    style={{ width: '250px', height: '35px', margin: '8px' }}
  />
</div>

        </div>
    
        <div className='typdatefine1o' style={{width: '100%',marginTop:'15px'}}>
          
        <FileUploadContainer {...getRootProps()} isDragActive={isDragActive}>
        <input
            {...getInputProps()}
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {form.file ? (
            <>
              <p>{form.file.name}</p>
              <Button
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  onClick={(e) => {
                    e.preventDefault(); // Prevent any default action.
                    e.stopPropagation(); // Stop event propagation to prevent triggering any parent event handlers.
                    handleFileRemove(e); // Call handleFileRemove with the event.
                  }}
                  size="small"
                >
                  Remove
                </Button>

            </>
          ) : (
            <p>Drop a file here, or click to select a file</p>
          )}
          <Button variant="contained" startIcon={<CloudUploadIcon />} onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the dropzone click
            fileInputRef.current.click();
          }}>
            Upload File
          </Button>
        </FileUploadContainer>
        
        </div>
        <div className='btnboth' >
        <button id="closessd" onClick={() => setIsFormVisible(false)}>Close</button>
                <button className='sedfineook' type="submit">
                  Send Fine
                </button>

              </div>
      </form>
  </div>
  </div>
      )}
      <div className='exportisod'>
      <Button onClick={exportToCSV} variant="contained" color="primary">
        Export to CSV
      </Button>
      <Button onClick={exportToExcel} variant="contained" color="secondary" style={{ marginLeft: '10px' }}>
        Export to Excel
      </Button>
      </div>
      <table className='trfingerefratth'>
        <thead>
          <tr className='trfingerefrat'>
          <th>Fine Type</th>
            <th>Occur Date</th>
            <th>Due Date</th>
            <th>Description</th>
            <th>For</th>
            <th>Driver Name</th>
            <th>Car Name</th>
            <th>Cost</th>
            <th>Status</th>
            <th>Issued From</th>
            <th>Location</th>
            <th>File</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {fines.map((fine) => (
            <tr key={fine._id}>
           <td>{fine.type}</td>
           <td>{new Date(fine.occureDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
      <td>{new Date(fine.dueDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
      <td>
        
          {editingFineId === fine._id ? (
            <input
            type="text"
            value={tempDescription}
            onChange={(e) => setTempDescription(e.target.value)}
            style={{ width: '100%',height:"30px" }}
            className="form-control"
            required
          />
          ) : (
            fine.description
          )}
        </td>
      
        <td>
  {editingFineId === fine._id ? (
   <div className="form-group-state">
 
   <select
     id="issuedFor"
     name="for"
     value={tempFor}
     onChange={(e) => setTempFor(e.target.value)}
     required
   >
     <option value="">Select Issued For</option>
     {fineForOptions.map((option) => (
       <option key={option.value} value={option.value}>
         {option.label}
       </option>
     ))}
   </select>
 </div>
 
  ) : (
    fine.for
  )}
</td>

              <td>{fine.driverName}</td>
              <td>{fine.carName}</td>
              <td>{fine.cost}</td>
              <td>
  {editingFineId === fine._id ? (
   <div className="form-group-state">
 
   <select
     value={tempStatus}
     onChange={(event) => {
       setTempStatus(event.target.value);
     }}
     required
   >
     <option value="">Select Status</option>
     {fineStatuses.map((status) => (
       <option key={status.value} value={status.value}>
         {status.label}
       </option>
     ))}
   </select>
 </div>
 
  ) : (
    <span style={getStatusStyle(fine.status)}>{capitalizeFirstLetter(fine.status)}</span>
  )}
</td>


              <td>{fine.issuedFrom}</td>
              <td>{fine.location}</td>
              <td>{fine.file ? <a href={`${process.env.REACT_APP_BACKEND_URL}/fines/${fine.file}`} target="_blank" rel="noopener noreferrer">See Fine</a> : 'No File'}</td>
              <td style={{ textAlign:'center'}}>
               
              <img src={del} alt="Delete" style={{ cursor: 'pointer', width: '18%' }} onClick={() => handleDeleteClick(fine._id)} />
              
              {editingFineId !== fine._id ? (
                <img
                  src={editIcon}
                  alt="Edit"
                  style={{ cursor: 'pointer', width: '18%' }}
                  onClick={() => handleEditClick(fine._id, fine.description, fine.for, fine.status)}
                />
              ) : (
                <Button onClick={() => handleSaveEdit(fine._id)}>Save</Button>
              )}

        
               
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Snackbar open={snackbarInfo.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarInfo.severity} sx={{ width: '100%' }}>
          {snackbarInfo.message}
        </Alert>
      </Snackbar>
      <Dialog
  open={openDialog}
  onClose={handleCloseDialog}
  aria-labelledby="alert-dialog-title"
  aria-describedby="alert-dialog-description"
>
  <DialogTitle id="alert-dialog-title">{"Delete Fine?"}</DialogTitle>
  <DialogContent>
    <DialogContentText id="alert-dialog-description">
      Are you sure you want to delete this fine? This action cannot be undone.
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseDialog}>Cancel</Button>
    <Button onClick={handleDeleteFine} autoFocus color="error">
      Delete
    </Button>
  </DialogActions>
</Dialog>

    </div>
  );
};

export default Sid4;
