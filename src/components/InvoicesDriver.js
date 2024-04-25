import React, { useState,useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './InvoicesCar.css'; // Make sure to create a corresponding CSS file
import { useDrivers } from '../DriversContext'; // Import useDrivers hook
import del from './del.svg'; // Path to your edit icon
import plusi from "../plusi.svg"
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Snackbar, Alert } from '@mui/material';
const InvoicesDriver = ({ driver: propDriver,onDriverUpdate,onDeleted }) => {
  const [addingInvoice, setAddingInvoice] = useState(false); 
  const [driver, setDriver] = useState(propDriver); 
  const { drivers, refreshDrivers } = useDrivers();
  const token = localStorage.getItem('userToken'); // Assuming token is stored in localStorage
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbarInfo, setSnackbarInfo] = useState({
    open: false,
    severity: '', // 'success' or 'error'
    message: '',
  });

  const [invoices, setInvoices] = useState(driver.invoices || []);

  const [newInvoice, setNewInvoice] = useState({
    invoiceNumber: '',
    invoiceType: 'Maintenance',
    for: '',
    date: new Date().toISOString().split("T")[0],
    amount: '',
    currency: 'USD',
  });
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const promptDeleteInvoice = (invoiceId) => {
    setInvoiceToDelete(invoiceId);
    setOpenDialog(true);
  };
  
  const confirmDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
  
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/drivers/${driver._id}/invoices/${invoiceToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) throw new Error('Failed to delete invoice');
      
      setInvoices(invoices.filter(invoice => invoice._id !== invoiceToDelete));
      setSnackbarInfo({
        open: true,
        severity: 'success',
        message: 'Invoice deleted successfully.',
      });
      setOpenDialog(false);
      setInvoiceToDelete(null);
    } catch (error) {
      console.error(error);
      setSnackbarInfo({
        open: true,
        severity: 'error',
        message: 'Error deleting invoice.',
      });
    }
  };
  

  const toggleAddingInvoice = () => {
    setAddingInvoice(!addingInvoice);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewInvoice({ ...newInvoice, [name]: value });
  };

  const handleDateChange = (e) => {
    setNewInvoice({ ...newInvoice, date: e.target.value });
  };

  const addInvoice = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/drivers/${driver._id}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newInvoice),
      });
  
      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(`Failed to add invoice: ${errorMsg}`);
      }
       await refreshDrivers();

      setNewInvoice({
        invoiceNumber: '',
        invoiceType: 'Maintenance',
        for: '',
        date: new Date().toISOString().split("T")[0],
        amount: '',
        currency: 'USD',
      });
      setAddingInvoice(false)
      setSnackbarInfo({
        open: true,
        severity: 'success',
        message: 'Invoice added successfully.',
      });
    } catch (error) {
      console.error(error);
      setSnackbarInfo({
        open: true,
        severity: 'error',
        message: 'Error adding invoice.',
      });
    }
  };
  
 // Use useEffect to react to changes in the drivers list
useEffect(() => {
  // Assuming `drivers` is the updated list of drivers from context
  const updatedDriver = drivers.find(d => d._id === driver._id);
  if (updatedDriver) {
    setInvoices(updatedDriver.invoices);
    setDriver(updatedDriver); // Update local state
    onDriverUpdate(updatedDriver); // Propagate the update to the parent component
  }
}, [drivers]); // Re-run this effect when `drivers` changes


  return (
    <div className="invoices-container">
       <div className='buttonassign'>
  <button onClick={toggleAddingInvoice}>
    <img src={plusi} alt="Add" style={{width:'12%',marginRight: "8px" }} />
    Add New Invoice
  </button>
</div>
        <div className={`add-invoice-form ${addingInvoice ? 'form-visible' : ''}`}>
      
    <div className='driverassititleanddateo'>
    <select name="invoiceType" value={newInvoice.invoiceType} onChange={handleInputChange}>
          <option value="Maintenance">Maintenance</option>
          <option value="Fuel">Fuel</option>
          <option value="Lease">Lease</option>
          <option value="Insurance">Insurance</option>
          <option value="Other">Other</option>
        </select>
        <input
          name="invoiceNumber"
          value={newInvoice.invoiceNumber}
          onChange={handleInputChange}
          placeholder="Invoice Number"
        />
       
        <input
          name="for"
          value={newInvoice.for}
          onChange={handleInputChange}
          placeholder="For"
        />
        <div className='dateofinvoice'>
        <input
          type="date"
          name="date"
          value={newInvoice.date} // This ensures the input shows today's date by default
          onChange={handleInputChange} // Ensure this handles date changes correctly
        />

        </div>
        <input
          name="amount"
          value={newInvoice.amount}
          onChange={handleInputChange}
          placeholder="Amount"
          type="number"
        />
       <select
          name="currency"
          value={newInvoice.currency}
          onChange={handleInputChange}
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="AUD">AUD</option>
          <option value="CAD">CAD</option>
          <option value="CHF">CHF</option>
          <option value="JPY">JPY</option>
          <option value="NZD">NZD</option>
          <option value="CNH">CNH</option>
          <option value="HKD">HKD</option>
        </select>
        <button onClick={addInvoice}>Add Invoice</button>
      </div>
      </div>
    
        
        <div className="invoices-list">
        <table className="table">
          <thead className="table-dark">
            <tr>
              <th>Invoice Number</th>
              <th>Invoice Type</th>
              <th>What is it for?</th>
              <th>Invoice Date</th>
              <th>Invoice Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice, index) => (
              <tr key={index}>
                <td>{invoice.invoiceNumber}</td>
                <td>{invoice.invoiceType}</td>
                <td>{invoice.for}</td>
                <td>{new Date(invoice.date).toLocaleDateString()}</td>
                <td>{`${invoice.amount} ${invoice.currency}`}</td>
                <td>
                  <button onClick={() => promptDeleteInvoice(invoice._id)} className="btn btn-danger">
                    <img src={del} alt="Delete" style={{ width: '25px', height: '25px' }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
    <Dialog
    open={openDialog}
    onClose={() => setOpenDialog(false)}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogTitle id="alert-dialog-title">{"Delete Invoice?"}</DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        Are you sure you want to delete this invoice? This action cannot be undone.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
      <Button onClick={confirmDeleteInvoice} autoFocus color="error">
        Delete
      </Button>
    </DialogActions>
  </Dialog>


  <Snackbar
    open={snackbarInfo.open}
    autoHideDuration={4000}
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



export default InvoicesDriver;