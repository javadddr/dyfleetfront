import React, { useState } from 'react';
import Sid9 from './Sid9'; // Adjust the path as necessary
import Sid11 from './Sid11'; // Adjust the path as necessary
import Sid4 from './Sid4'; // Adjust the path as necessary
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import li from "./li.svg"; // Driver License Check icon
import ins from "./ins.svg"; // Inspection icon
import bil from "./bil.svg"; // Driver UVV icon

function Compliance() {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const renderTabContent = (value) => {
    switch (value) {
      case 0:
        return <Sid9 />;
      case 1:
        return <Sid11 />;
      // case 2:
      //   return <Sid4 />;
      default:
        return <Sid9 />;
    }
  };

  // Helper function to render icons
  const renderIcon = (iconSrc) => (
    <Box component="img" src={iconSrc} sx={{ width: 28, height: 28, verticalAlign: 'middle', marginRight: 1 }} />
  );

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', width: 'auto' }}>
        <Tabs value={value} onChange={handleChange} aria-label="Compliance tabs" centered>
          <Tab icon={renderIcon(ins)} label="Inspection" sx={{ typography: 'body1', fontWeight: '400', fontSize: '1.3rem', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', marginTop: '15px' }} />
          <Tab icon={renderIcon(li)} label="Driver License Check" sx={{ typography: 'body1', fontWeight: '400', fontSize: '1.3rem', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', marginTop: '15px' }} />
          {/* <Tab icon={renderIcon(bil)} label="Driver UVV" sx={{ typography: 'body1', fontWeight: '400', fontSize: '1.3rem', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', marginTop: '15px' }} /> */}
        </Tabs>
      </Box>
      <Box sx={{ width: '100%', mt: 3 }}>
        {renderTabContent(value)}
      </Box>
    </Box>
  );
}

export default Compliance;
