// CustomDateTimePicker.js
import React from 'react';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TextField from '@mui/material/TextField';

const CustomDateTimePicker = ({ initialFromDate, initialTillDate, onFromDateChange, onTillDateChange }) => {

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DateTimePicker
        label="From"
        value={initialFromDate}
        onChange={(newValue) => {
          onFromDateChange(newValue);
        }}
        renderInput={(params) => <TextField {...params} />}
      />
      <DateTimePicker
        label="To"
        value={initialTillDate}
        onChange={(newValue) => {
          onTillDateChange(newValue);
        }}
        minDate={initialFromDate}
        renderInput={(params) => <TextField {...params} />}
      />
    </LocalizationProvider>
  );
};

export default CustomDateTimePicker;
