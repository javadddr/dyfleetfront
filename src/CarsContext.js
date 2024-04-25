// CarsContext.js
import React, { createContext,useEffect, useState, useContext } from 'react';

const CarsContext = createContext();

export const useCars = () => useContext(CarsContext);
// Ensure to include the proper imports at the top
export const CarsProvider = ({ children }) => {
  const [cars, setCars] = useState([]);

  const refreshCars = async () => {
    const token = localStorage.getItem('userToken');
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/cars`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      setCars(data);
      return data; 
    }
  };

  // Make sure to call refreshCars to load initial cars data
  useEffect(() => {
    refreshCars();
  }, []);

  const updateCarStatusInContext = (carId, newStatus) => {
    const updatedCars = cars.map(car => {
      if (car._id === carId) {
        return { ...car, state: newStatus };
      }
      return car;
    });
    setCars(updatedCars);
  };

  return (
    <CarsContext.Provider value={{ cars, refreshCars, updateCarStatusInContext }}>
      {children}
    </CarsContext.Provider>
  );
};