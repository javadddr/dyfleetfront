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
import { InputAdornment } from '@mui/material';
import { MenuItem, Select } from '@mui/material';
import "./Sid4.css";
import plusi from "./plusi.svg"
import { unparse } from 'papaparse';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import editIcon from './components/edit.svg'; // Path to your edit icon
import del from './components/del.svg'; // Path to your edit icon
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {  Accordion, AccordionSummary, AccordionDetails, AccordionActions } from '@mui/material';
import { Snackbar, Alert } from '@mui/material';



const Sid10 = () => {
 
  const [form, setForm] = useState({
    areaName: '',
    areaLocation: '', 
  });
  

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [accordionExpanded, setAccordionExpanded] = useState(false); // Start expanded
  const [openDialog, setOpenDialog] = useState(false);
  const [areas, setAreas] = useState([]); // Step 1: Define allEq state
  const [selectedAreaId, setSelectedAreaId] = useState(null); // Correctly defined state for tracking the selected area ID


  useEffect(() => {
    setLoading(true); 
    const fetchData = async () => {
    
      await fetchAreas();
    };
    fetchData().finally(() => setLoading(false));
  }, []);



  const handleDeleteClick = (id) => {
    setSelectedAreaId(id); // Set the selected area ID
    setOpenDialog(true);
};

  
  const handleCloseDialog = () => {
    setOpenDialog(false);
   
  };
  // Function to delete the selected equipment based on its type
const deleteEquipment = async (id) => {
 
  const token = localStorage.getItem('userToken');
  const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/areas/${id}`;
  try {
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error('Failed to delete the area');
    }

    
    fetchAreas();
    setOpenDialog(false); // Close the dialog
    setSnackbarInfo({ open: true, message: 'Area deleted successfully.', severity: 'success' });
  } catch (error) {
    console.error('Error deleting area:', error);
    setSnackbarInfo({ open: true, message: 'Error deleting area.', severity: 'error' });
  }
};

  const [loading, setLoading] = useState(false);
  // Adjust the snackbarInfo state to manage the snackbar's open state, message, and severity
  const [snackbarInfo, setSnackbarInfo] = useState({ open: false, message: '', severity: '' });


 
  useEffect(() => {
    setLoading(true); 
   
    fetchAreas();
    
  }, []);

  const fetchAreas = async () => {
    const token = localStorage.getItem('userToken');
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/areas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch fines');
      }
      const data = await response.json();
      setAreas(data);
    
      setLoading(false); 
    } catch (error) {
      console.error('Error fetching fines:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    // For numeric fields, parse the value. Otherwise, store the string value.
    const newValue = type === 'number' ? Number(value) : value;
    setForm({ ...form, [name]: newValue });
  };


  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const token = localStorage.getItem('userToken');
  
    // Instead of using FormData, directly use the form object for JSON.stringify
    const data = JSON.stringify(form);

    const endpoint=`${process.env.REACT_APP_BACKEND_URL}/api/areas`
   

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json', // Specify JSON content type
            },
            body: data,
        });

        if (!response.ok) {
            throw new Error('Failed to submit form');
        }
        setAccordionExpanded(false); // Close the accordion
        setSnackbarInfo({ open: true, message: 'Area submitted successfully.', severity: 'success' });
    
        fetchAreas();
        setForm({
          areaName: '',
          areaLocation: '', 
        });
        setIsFormVisible(!isFormVisible)
    } catch (error) {
        console.error('Error submitting form:', error);
        // Handle error, possibly updating UI to notify user of failure
    } finally {
        setLoading(false);
    }
};

  




  // Function to close the snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarInfo(prev => ({ ...prev, open: false }));
  };

  const GroupHeader = styled('div')(({ theme }) => ({
    display: 'flex', // Set display to flex
    justifyContent: 'flex-start', // Align content to the start
    alignItems: 'center', // Center-align items vertically
    textAlign: 'center', // Center-align text
    backgroundColor: theme.palette.mode === 'light' ? '#f0f8ff' : '#0f4c75', // Very light blue background
    color: theme.palette.mode === 'light' ? '#007bff' : '#bbdefb', // Blue text color
    fontWeight: theme.typography.fontWeightMedium,
    paddingLeft: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    width: '250px', // Ensure it takes the full width available
  }));
  
  
  
  const GroupItems = styled('ul')(({ theme }) => ({
    padding: 0,
    '& li': {
      paddingLeft: theme.spacing(2),
    },
  }));
  
  const exportToCSV = () => {
    const csvData = areas.map(eq => ({
       
        Description: eq.areaLocation,
        Name: eq.areaName,
      
    }));
    // Use unparse to convert JSON to CSV
    const csv = unparse(csvData, { header: true });
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "equipment_data.csv");
};

  // Function to convert your data to Excel and trigger the download
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(areas.map(eq => ({
      Description: eq.areaLocation,
      Name: eq.areaName,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Equipment Data");
    XLSX.writeFile(wb, "equipment_data.xlsx");
  };

    if (loading) {
      return <Loading />; // Show loading component while data is being fetched
    }
    const userRoles = localStorage.getItem('userRoles');  
  return (
    
    <div className="mainformfindid">
     
     <div className={userRoles === 'user' ? "hidddenforuserdfj" : "containerPPOLmm"}>
      <button className="add-equipment-btn" onClick={() => setIsFormVisible(!isFormVisible)}>
      <img src={plusi} alt="Add" style={{width:'12%',marginRight: "8px" }} />
      Add New Area
    </button>
      </div>
      {isFormVisible && (
<form onSubmit={handleSubmit} className='formfineop'>
  <div className='typdatefine' style={{ width: '100%' }}>
 
 

    <div className="isufin">
      <Box
        sx={{
          '& > :not(style)': { m: 1, width: '100%' },
        }}
        noValidate
        autoComplete="off"
      >
        <TextField
          id="areaName"
          name="areaName" // Corrected from "name" to "areaName"
          label="Area Name" // Changed to "Name" to match the state structure
          variant="outlined"
          value={form.areaName}
          onChange={handleChange}
          required
          fullWidth
        />
      </Box>
    </div>

    <div className="isufin">
      <Box
        sx={{
          '& > :not(style)': { m: 1, width: '100%' },
        }}
      >
        <TextField
          id="areaLocation"
          name="areaLocation"
          label="Location"
          variant="outlined"
          value={form.areaLocation}
          onChange={handleChange}
          fullWidth
        />
      </Box>
    </div>


   

  </div>

  <div className='typdatefine1o' style={{ width: '100%' }}>
    <Stack direction="row" spacing={2} justifyContent="flex-end">
      <Button variant="contained" endIcon={<SendIcon />} type="submit">
        Submit
      </Button>
    </Stack>
  </div>
</form>
)}
    
      <div className='mainexarjo'>
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
        
        
            <th>Name</th>
            <th>Location</th>
            <th>Action</th>
           
          </tr>
        </thead>
        <tbody>
          {areas.map((area) => (
            <tr key={area._id}>
           
              <td>{area.areaName}</td>
              <td>{area.areaLocation}</td>
             
              
              <td style={{ textAlign:'center'}}>
               
              <img src={del} alt="Delete" style={{ cursor: 'pointer', width: '6%' }} onClick={() => handleDeleteClick(area._id)} />

               
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <Snackbar open={snackbarInfo.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarInfo.severity} sx={{ width: '100%' }}>
          {snackbarInfo.message}
        </Alert>
      </Snackbar>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{"Delete Area?"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this area? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={() => {
            deleteEquipment(selectedAreaId); // Use the state variable here
            handleCloseDialog();
          }} autoFocus color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
};

export default Sid10;

