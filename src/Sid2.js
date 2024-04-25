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
  { category: 'For Vehicle', label: 'Equipment for Car', value: 'carEquipment' },
  { category: 'For Vehicle', label: 'Equipment for Working', value: 'workEquipment' },
  { category: 'For Driver', label: 'Clothing', value: 'Clothing' },
  { category: 'For Driver', label: 'Other', value: 'Other' },
];

const currencies = [
  { label: 'USD', symbol: '$' },
  { label: 'GBP', symbol: '£' },
  { label: 'JPY', symbol: '¥' },
  { label: 'EUR', symbol: '€' },
  { label: 'BRL', symbol: 'R$' },
  { label: 'MXN', symbol: '$' },
  { label: 'AUD', symbol: 'A$' },
  { label: 'CAD', symbol: 'C$' },
  { label: 'NZD', symbol: 'NZ$' },
  { label: 'ARS', symbol: '$' },
  { label: 'CHF', symbol: 'CHF' },
  { label: 'THB', symbol: '฿' },
  { label: 'HKD', symbol: 'HK$' },
  { label: 'TRY', symbol: '₺' },
];


const fineForOptions = [
  { label: 'Car', value: 'car' },
  { label: 'Driver', value: 'driver' },
];

const Sid2 = () => {
  const [driverEq, setDriverEq] = useState([]);
  const [carEq, setCarEq] = useState([]);

  const [form, setForm] = useState({
    itemId: '',
    type: '', //'Clothing', 'Other','carEquipment', 'workEquipment'
    name: '',
    description: '',
    costPerUnit: '',
    vendor: '',
    buyingUrl: '',
  });
  

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [accordionExpanded, setAccordionExpanded] = useState(false); // Start expanded
  const [openDialog, setOpenDialog] = useState(false);
  const [allEq, setAllEq] = useState([]); // Step 1: Define allEq state
  const [currency, setCurrency] = useState(currencies[0]); // Default to USD


  useEffect(() => {
    setLoading(true); 
    const fetchData = async () => {
      await fetchDriverEq();
      await fetchCarEq();
    };
    fetchData().finally(() => setLoading(false));
  }, []);
  const [selectedEquipment, setSelectedEquipment] = useState({ id: null, type: null });

  // Step 2: Combine driverEq and carEq whenever they change
  useEffect(() => {
    setAllEq([...driverEq, ...carEq]);
  }, [driverEq, carEq]);
  const handleDeleteClick = (id, type) => {
    setSelectedEquipment({ id, type }); // Store id and type of the selected equipment
   
    setOpenDialog(true); // Open the confirmation dialog
  };
  
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
   
  };
  // Function to delete the selected equipment based on its type
const deleteEquipment = async (id, type) => {

  const token = localStorage.getItem('userToken');
  const endpoint = type === 'carEquipment' || type === 'workEquipment' 
    ? `${process.env.REACT_APP_BACKEND_URL}/carEquipments/${id}` 
    : `${process.env.REACT_APP_BACKEND_URL}/driverEquipments/${id}`;

  try {
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error('Failed to delete equipment');
    }

    // Refetch equipment lists to update UI
    fetchDriverEq();
    fetchCarEq();
    setOpenDialog(false); // Close the dialog
    setSnackbarInfo({ open: true, message: 'Equipment deleted successfully.', severity: 'success' });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    setSnackbarInfo({ open: true, message: 'Error deleting equipment.', severity: 'error' });
  }
};
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  // Adjust the snackbarInfo state to manage the snackbar's open state, message, and severity
  const [snackbarInfo, setSnackbarInfo] = useState({ open: false, message: '', severity: '' });



  const handleFileRemove = (event) => {
    event.preventDefault(); // Prevent default behavior
    event.stopPropagation(); // Stop the event from bubbling up
    setForm({ ...form, file: null });
  };
 
  useEffect(() => {
    setLoading(true); 
    fetchDriverEq();
    fetchCarEq();
    
  }, []);

  const fetchDriverEq = async () => {
    const token = localStorage.getItem('userToken');
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/driverEquipments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch fines');
      }
      const data = await response.json();
      setDriverEq(data);
      setLoading(false); 
    } catch (error) {
      console.error('Error fetching fines:', error);
    }
  };
  const fetchCarEq = async () => {
    const token = localStorage.getItem('userToken');
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/carEquipments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch fines');
      }
      const data = await response.json();
      setCarEq(data);
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

  const handleFileChange = (e) => {
    setForm({ ...form, file: e.target.files[0] });
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const token = localStorage.getItem('userToken');
  
    // Instead of using FormData, directly use the form object for JSON.stringify
    const data = JSON.stringify(form);

    let endpoint;
    if (['carEquipment', 'workEquipment'].includes(form.type)) {
        endpoint = `${process.env.REACT_APP_BACKEND_URL}/carEquipments`;
    } else if (['Clothing', 'Other'].includes(form.type)) {
        endpoint = `${process.env.REACT_APP_BACKEND_URL}/driverEquipments`;
    }

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
        setAccordionExpanded(false); 
        setSnackbarInfo({ open: true, message: 'Equipment submitted successfully.', severity: 'success' });
        fetchDriverEq();
        fetchCarEq();
        setForm({
          itemId: '',
          type: '', //'Clothing', 'Other','carEquipment', 'workEquipment'
          name: '',
          description: '',
          costPerUnit: '',
          vendor: '',
          buyingUrl: '',
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
    const csvData = allEq.map(eq => ({
        Type: eq.type,
        Description: eq.description,
        Name: eq.name,
        CostPerUnit: eq.costPerUnit + ' ' + currency.symbol, // Include the currency symbol
        Vendor: eq.vendor,
        BuyingUrl: eq.buyingUrl,
    }));
    // Use unparse to convert JSON to CSV
    const csv = unparse(csvData, { header: true });
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "equipment_data.csv");
};

  // Function to convert your data to Excel and trigger the download
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(allEq.map(eq => ({
      Type: eq.type,
      Description: eq.description,
      Name: eq.name,
      CostPerUnit: eq.costPerUnit,
      Vendor: eq.vendor,
      BuyingUrl: eq.buyingUrl,
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
      Add New Equipment
    </button>
      </div>
      
      {isFormVisible && (
      
<form onSubmit={handleSubmit} className='formfineop'>
  <div className='typdatefine' style={{ width: '100%' }}>
  <div className="isufin">
  <Box sx={{ '& > :not(style)': { m: 1, width: '100%' } }}>
          <TextField
            id="itemId"
            name="itemId"
            label="Item ID"
            type="number" // Ensure the input is treated as a numeric field
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            value={form.itemId}
            onChange={handleChange}
            required
            fullWidth
          />
        </Box>
        </div>
    <div className="isufin">
    <Autocomplete
  disablePortal
  id="type-combo-box"
  options={fineTypes}
  groupBy={(option) => option.category}
  getOptionLabel={(option) => option.label}
  value={form.type ? fineTypes.find(option => option.value === form.type) : null}
  onChange={(event, newValue) => {
    setForm({ ...form, type: newValue ? newValue.value : '' });
  }}
  renderInput={(params) => <TextField {...params} label="Type" required />}
  renderGroup={(params) => (
    <li key={params.key}>
      <GroupHeader>{params.group}</GroupHeader>
      <GroupItems>{params.children}</GroupItems>
    </li>
  )}
  sx={{ width: 270,color:'blue' }}
/>

    </div>

    <div className="isufin">
      <Box
        sx={{
          '& > :not(style)': { m: 1, width: '100%' },
        }}
        noValidate
        autoComplete="off"
      >
        <TextField
          id="name"
          name="name"
          label="Name" // Changed to "Name" to match the state structure
          variant="outlined"
          value={form.name}
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
          id="description"
          name="description"
          label="Description"
          variant="outlined"
          value={form.description}
          onChange={handleChange}
          fullWidth
        />
      </Box>
    </div>

    <div className="isufin">
    <Box sx={{ '& > :not(style)': { m: 1, width: '100%' }, display: 'flex', alignItems: 'flex-end' }}>

  <TextField
    fullWidth
    id="costPerUnit"
    name="costPerUnit"
    label="Cost Per Unit"
    type="number"
    InputProps={{
      startAdornment: <InputAdornment position="start">{currency.symbol}</InputAdornment>,
    }}
    value={form.costPerUnit}
    onChange={handleChange}
    required
  />
    <Select
    value={currency.label}
    onChange={(e) => setCurrency(currencies.find(c => c.label === e.target.value))}
    sx={{ width: 'auto', marginRight: 1 }}
  >
    {currencies.map((option) => (
      <MenuItem key={option.label} value={option.label}>
        {option.label}
      </MenuItem>
    ))}
  </Select>
</Box>
    </div>

    <div className="isufin">
      <Box
        sx={{
          '& > :not(style)': { m: 1, width: '100%' },
        }}
      >
        <TextField
          id="vendor"
          name="vendor"
          label="Vendor"
          variant="outlined"
          value={form.vendor}
          onChange={handleChange}
          fullWidth
        />
      </Box>
    </div>

   

  </div>
  <div className="typdatefineppol">
      <Box
        sx={{
          '& > :not(style)': { m: 1, width: '400%' },
        }}
      >
        <TextField
          id="buyingUrl"
          name="buyingUrl"
          label="Buying URL"
          variant="outlined"
          value={form.buyingUrl}
          onChange={handleChange}
          fullWidth
        />
      </Box>
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
          <th>type</th>
            <th>Description</th>
            <th>Name</th>
           
            <th>Cost Per Unit</th>
            <th>Vendor</th>
            <th>Buying Url</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {allEq.map((fine) => (
            <tr key={fine._id}>
           
           <td>{fine.type}</td>
              <td>{fine.description}</td>
              <td>{fine.name}</td>
              
              <td>{fine.costPerUnit}</td>
              
              
              <td>{fine.vendor}</td>
              <td style={{ 
  textAlign: 'center',
  maxWidth: "300px", 
  overflow: 'hidden', 
  textOverflow: 'ellipsis', 
  whiteSpace: 'nowrap' 
}}>
  {fine.buyingUrl ? (
    <a href={fine.buyingUrl} target="_blank" rel="noopener noreferrer" style={{ 
      textDecoration: 'none', 
      color: 'blue', 
      cursor: 'pointer',
      display: 'block', // Ensures the anchor tag behaves as a block element within the td
      maxWidth: '100%', // Ensures it does not exceed the td's width
      overflow: 'hidden', 
      textOverflow: 'ellipsis', 
      whiteSpace: 'nowrap' 
    }}>
      {fine.buyingUrl}
    </a>
  ) : 'N/A'}
</td>

              
              <td style={{ textAlign:'center'}}>
               
              <img src={del} alt="Delete" style={{ cursor: 'pointer', width: '30%' }} onClick={() => handleDeleteClick(fine.itemId,fine.type)} />

               
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
  <Button onClick={() => deleteEquipment(selectedEquipment.id, selectedEquipment.type)} autoFocus color="error">
    Delete
  </Button>
</DialogActions>
</Dialog>

    </div>
  );
};

export default Sid2;

