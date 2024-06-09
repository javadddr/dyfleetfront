import React, { useState } from 'react';
import Sid2 from './Sid2'; 
import Sid10 from './Sid10'; 
import Sid4 from './Sid4'; 
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import li from "./eq.svg"; 
import ins from "./fine.svg"; 
import bil from "./ari.svg"; 

function Compliance() {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const renderTabContent = (value) => {
    switch (value) {
      case 0:
        return <Sid4 />;
      case 1:
        return <Sid2 />;
      case 2:
        return <Sid10 />;
      default:
        return <Sid4 />;
    }
  };

  // Helper function to render icons
  const renderIcon = (iconSrc) => (
    <Box component="img" src={iconSrc} sx={{ width: 28, height: 28, verticalAlign: 'middle', marginRight: 1 }} />
  );

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', width: 'auto' }}>
        <Tabs value={value} onChange={handleChange} aria-label="Operations tabs" centered>
          <Tab icon={renderIcon(ins)} label="Driving Fines" sx={{ typography: 'body1', fontWeight: '400', fontSize: '1rem', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', marginTop: '15px' }} />
          <Tab icon={renderIcon(li)} label="Equipment" sx={{ typography: 'body1', fontWeight: '400', fontSize: '1rem', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', marginTop: '15px' }} />
          <Tab icon={renderIcon(bil)} label="Areas" sx={{ typography: 'body1', fontWeight: '400', fontSize: '1rem', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', marginTop: '15px' }} />
        </Tabs>
      </Box>
      <Box sx={{ width: '100%', mt: 3 }}>
        {renderTabContent(value)}
      </Box>
    </Box>
  );
}

export default Compliance;
