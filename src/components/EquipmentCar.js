import React, { useState, useEffect } from 'react';
import './EquipmentDriver.css';
import { useDrivers } from '../DriversContext'; // Make sure this hook is implemented to fetch and refresh drivers
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import plusi from "../plusi.svg"
import Loading from '../Loading'; 
import MenuItem from '@mui/material/MenuItem';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TextField } from '@mui/material';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button
} from '@mui/material';
import { TablePagination } from '@mui/material';

import delicon from "./del.svg"
import { IconButton } from '@mui/material';

import { Alert, AlertTitle, Snackbar } from '@mui/material';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

const EquipmentCar = ({ car: propCar,onCarUpdate }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [car, setCar] = useState(propCar); // New state to manage car data
  const [isAccordionExpanded, setIsAccordionExpanded] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarInfo, setSnackbarInfo] = useState({
    open: false,
    severity: 'success', // can be "error", "warning", "info", "success"
    message: '',
  });
  const [openDialog, setOpenDialog] = useState(false);
const [equipmentToDelete, setEquipmentToDelete] = useState(null);
const [isFormOpen, setIsFormOpen] = useState(false);

// Toggle form display
const toggleForm = () => {
  setIsFormOpen(!isFormOpen);
};
useEffect(() => {
  setLoading(true); 
  fetchEquipments();
}, [car._id]); // Dependency array ensures fetch is called when driver._id changes
  const token = localStorage.getItem('userToken');
  const [newEquipment, setNewEquipment] = useState({
    type: '', // Default to an empty string to match no selection
    date: '',
    item: '',
    quantity: '',
    deliveredBy: ''
  });
  const [allEquipments, setAllEquipments] = useState([]);

  useEffect(() => {
    const fetchAllEquipments = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/carEquipments`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch equipments');
        const data = await response.json();
        setAllEquipments(data);
      } catch (error) {
        console.error('Error fetching equipments:', error);
      }
    };
    
    fetchAllEquipments();
  }, []); // Run once on component mount
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEquipment({ ...newEquipment, [name]: value });
  };
  const handleOpenDialog = (equipmentId, type) => {
    setOpenDialog(true);
    setEquipmentToDelete({ id: equipmentId, type: type });
  };
  
  const addEquipment = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/cars/${car._id}/equipment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: newEquipment.type,
          item: newEquipment.item,
          quantity: newEquipment.quantity,
          date: newEquipment.date,
          deliveredBy: newEquipment.deliveredBy,
        }),
        
    });
   
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add equipment');
    }
  
      setSnackbarInfo({
        open: true,
        severity: 'success',
        message: 'Equipment added successfully.',
      });
      fetchEquipments();
      // Reset the form fields
      setNewEquipment({
        date: '',
        item: '',
        quantity: '',
        deliveredBy: ''
      });
      toggleForm()
      // Close the Accordion
      setIsAccordionExpanded(false);
    } catch (error) {
      console.error('Error adding equipment:', error);
      setSnackbarInfo({
        open: true,
        severity: 'error',
        message: 'Error adding equipment.',
      });
    }
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page
  };
  

  const [equipments, setEquipments] = useState({ carEquipment: [], workEquipment: [] });

  const fetchEquipments = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/cars/${car._id}/equipment`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch equipments');

      const data = await response.json();
  
      setEquipments(data);
      setLoading(false); 
    } catch (error) {
      console.error('Error fetching equipments:', error);
    }
  };

  const deleteEquipment = async () => {
    if (!equipmentToDelete) return;
  
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/cars/${car._id}/equipment/${equipmentToDelete.id}?type=${equipmentToDelete.type}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
  
      if (!response.ok) throw new Error('Failed to delete equipment');
  
      setSnackbarInfo({
        open: true,
        severity: 'success',
        message: 'Equipment deleted successfully.',
      });
      fetchEquipments(); // Refresh the equipments list
    } catch (error) {
      console.error('Error deleting equipment:', error);
      setSnackbarInfo({
        open: true,
        severity: 'error',
        message: 'Error deleting equipment.',
      });
    } finally {
      setOpenDialog(false); // Close the dialog
      setEquipmentToDelete(null); // Reset the equipmentToDelete state
    }
  };
  
  const [users, setUsers] = useState([]);
 
  useEffect(() => {
    fetchUsers();
  }, []); // Fetch users once component mounts
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  };


  if (loading) {
    return <Loading />; 
  }


  return (
    <div className="equipment-container">
      <div className='containerPPOLmm'>
      <button className="add-equipment-btn" onClick={toggleForm}>
      <img src={plusi} alt="Add" style={{width:'12%',marginRight: "8px" }} />
      Add New Equipment
    </button>
      </div>
      
      <div className={`form-containerPPOL ${isFormOpen ? 'open' : ''}`}>
   
      <form onSubmit={addEquipment} className='fomequfordrivsd'>
        <FormControl fullWidth sx={{ width: '300px' }}>
      <InputLabel id="equipment-type-label">Equipment Type</InputLabel>
      <Select
          labelId="equipment-type-label"
          id="equipment-type-select"
          value={newEquipment.type || ''} // Fallback to an empty string
          label="Equipment Type"
          onChange={(e) => handleInputChange({ target: { name: 'type', value: e.target.value } })}
          name="type"
        >
        <MenuItem value="carEquipment">Equipment for Vehicle</MenuItem>
        <MenuItem value="workEquipment">Equipment for Work</MenuItem>
      </Select>
    </FormControl>
    <div className='dateeqformda'>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
  <DatePicker
    label="Date"
    value={newEquipment.date}
    onChange={(newValue) => {
      handleInputChange({ target: { name: 'date', value: newValue } });
    }}
    renderInput={(params) => <TextField {...params} name="date" style={{ width: '50%' }} />} // Adjust width as needed
  />
</LocalizationProvider>
</div>
<FormControl fullWidth sx={{ width: '250px',marginRight:'10px' }}>
  <InputLabel id="item-select-label">Item</InputLabel>
  <Select
    labelId="item-select-label"
    id="item-select"
    value={newEquipment.item}
    label="Item"
    onChange={(e) => handleInputChange({ target: { name: 'item', value: e.target.value } })}
    name="item"
  >
{allEquipments
  .filter(equipment => equipment.type && newEquipment.type && equipment.type.toLowerCase() === newEquipment.type.toLowerCase())
  .map((equipment, index) => (
    <MenuItem key={index} value={equipment.name}>{equipment.name}</MenuItem>
  ))}


  </Select>
</FormControl>
<FormControl fullWidth sx={{ width: '200px',marginRight:'10px'}}>
  <TextField
    label="Quantity"
    type="number"
    name="quantity"
    value={newEquipment.quantity}
    onChange={handleInputChange}
    InputLabelProps={{
      shrink: true,
    }}
  />
</FormControl>



<FormControl fullWidth sx={{width: '250px',marginRight:'10px' }}>
  <InputLabel id="delivered-by-label">Delivered By</InputLabel>
  <Select
    labelId="delivered-by-label"
    id="delivered-by-select"
    name="deliveredBy"
    value={newEquipment.deliveredBy}
    onChange={handleInputChange}
    label="Delivered By"
  >
   
    {users.map((user, index) => (
      <MenuItem key={index} value={user.username}>{user.username}</MenuItem>
    ))}
  </Select>
</FormControl>

    <button className='addegac' type="submit">Add </button>
    </form>
      </div>
   
    
      <Box sx={{ width: '100%' }}>
      {['carEquipment', 'workEquipment'].map((type) => (
        <Paper key={type} sx={{ width: '100%', mb: 2, marginTop: 2 }}>
          <TableContainer>
            <Table aria-label="simple table">
              <TableHead
               sx={{
                backgroundColor: '#353535',
                '.MuiTableCell-root': {
                  color: 'white',
                  height: '10px',
                  borderLeft:'1px solid white',
                  fontFamily: 'Poppins',
                  fontSize: '16px',
                  padding: '6px 16px',
                  '&:hover': {
                    backgroundColor: '#353535', // to maintain the background color on hover
                  },
                },
              }}
              >
                <TableRow>
                <TableCell sx={{color:'white',height:'10px',width:'5%',fontFamily:'Poppins',fontSize:'16px',backgroundColor: '#353535'}}>Type</TableCell>
                <TableCell sx={{color:'white',height:'10px',width:'5%',fontFamily:'Poppins',fontSize:'16px',backgroundColor: '#353535'}}>Date</TableCell>
                <TableCell sx={{color:'white',height:'10px',width:'5%',fontFamily:'Poppins',fontSize:'16px',backgroundColor: '#353535'}}>Item</TableCell>
                <TableCell sx={{color:'white',height:'10px',width:'5%',fontFamily:'Poppins',fontSize:'16px',backgroundColor: '#353535'}}>Quantity</TableCell>
                <TableCell sx={{color:'white',height:'10px',width:'5%',fontFamily:'Poppins',fontSize:'16px',backgroundColor: '#353535'}}>Cost</TableCell>
                <TableCell sx={{color:'white',height:'30px',width:'25%',fontFamily:'Poppins',fontSize:'16px',backgroundColor: '#353535'}}>Delivered(by)</TableCell>
                <TableCell sx={{color:'white',height:'10px',width:'5%',fontFamily:'Poppins',fontSize:'16px',backgroundColor: '#353535'}}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
              {equipments[type]
  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // This line ensures pagination
  .map((equipment, index) => (
    <TableRow key={index}>
      <TableCell component="th" scope="row" sx={{ width: '20%', padding: '6px' }}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </TableCell>
      <TableCell sx={{ width: '20%', padding: '6px' }}> {new Date(equipment.date).toLocaleDateString('en-CA')}</TableCell>
      <TableCell sx={{ width: '20%', padding: '6px' }}>{equipment.item}</TableCell>
      <TableCell sx={{ width: '20%', padding: '6px' }}>{equipment.quantity}</TableCell>
      <TableCell sx={{ width: '20%', padding: '6px' }}>{equipment.cost}</TableCell>
      <TableCell sx={{ width: '20%', padding: '6px' }}>{equipment.deliveredBy}</TableCell>
      <TableCell sx={{ width: '20%', padding: '6px' }}>
        <div className='bdaeqis'>
        <IconButton
          aria-label="delete"
          color="error"
          onClick={() => handleOpenDialog(equipment._id, type)}
        >
          <img src={delicon} alt="Delete" style={{ width: 24, height: 24 }} />
        </IconButton>


        </div>
      </TableCell>
    </TableRow>
  ))}

              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
        component="div"
        count={equipments[type].length} // Total number of equipments in the current type
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]} // Rows per page options
      />
        </Paper>
      ))}
    </Box>
    <Snackbar
  open={snackbarInfo.open}
  autoHideDuration={3000}
  onClose={() => setSnackbarInfo({ ...snackbarInfo, open: false })}
  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
>
  <Alert
    onClose={() => setSnackbarInfo({ ...snackbarInfo, open: false })}
    severity={snackbarInfo.severity}
    sx={{ width: '100%' }}
  >
    <AlertTitle>{snackbarInfo.severity === 'success' ? 'Success' : 'Error'}</AlertTitle>
    {snackbarInfo.message}
  </Alert>
</Snackbar>
<Dialog
  open={openDialog}
  onClose={() => setOpenDialog(false)}
  aria-labelledby="alert-dialog-title"
  aria-describedby="alert-dialog-description"
>
  <DialogTitle id="alert-dialog-title">
    {"Are you sure you want to delete this equipment?"}
  </DialogTitle>
  <DialogContent>
    <DialogContentText id="alert-dialog-description">
      This action cannot be undone.
    </DialogContentText>
  </DialogContent>
  <DialogActions>
  <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
  <Button onClick={() => deleteEquipment()} autoFocus color="error">
    Delete
  </Button>
</DialogActions>

</Dialog>


    </div>
  );
};

export default EquipmentCar;