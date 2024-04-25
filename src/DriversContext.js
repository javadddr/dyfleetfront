// DriversContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const DriversContext = createContext();

export function useDrivers() {
  return useContext(DriversContext);
}

export const DriversProvider = ({ children }) => {
  const [drivers, setDrivers] = useState([]);

  const refreshDrivers = async () => {
    const token = localStorage.getItem('userToken');
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/drivers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const fetchedDrivers = await response.json();
      setDrivers(fetchedDrivers);
    }
  };

  useEffect(() => {
    refreshDrivers();
  }, []);

  return (
    <DriversContext.Provider value={{ drivers, refreshDrivers }}>
      {children}
    </DriversContext.Provider>
  );
};
