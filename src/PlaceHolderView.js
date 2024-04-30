import React, { useState,useEffect,useRef } from 'react';
import "./PlaceHolderView.css";
import Vehicles from './Vehicles';
import Drivers from './Drivers';
import Loading from './Loading'; 
import dd from "./dd.svg";
import car from "./car.svg";
import mainpic from "./cfl.jpeg"
import { useCars } from './CarsContext';
import { useDrivers } from './DriversContext'; // Import useDrivers hook

import Fornonadmin from './Fornonadmin';
function PlaceHolderView({ carCount, driverCount }) {
  const pages = [
    { id: 2, name: 'Create Vehicles', component: Vehicles, icon: car },
    { id: 3, name: 'Create Drivers', component: Drivers, icon: dd },
  ];
  const [showUserInfopp, setShowUserInfopp] = useState(false);
  const [showUserInfopp2, setShowUserInfopp2] = useState(false);
  const userRoles = localStorage.getItem('userRoles'); 
  const [activePageId, setActivePageId] = useState(pages[0].id);
  console.log("activea",activePageId)
  const [loading, setLoading] = useState(false); 
  const { cars } = useCars();
  useEffect(() => {

    setShowUserInfopp(cars.length === 0 && activePageId === 2);
}, [cars, activePageId]); // Dependency on cars array and activePageId


const { drivers } = useDrivers(); // Assuming this gives you the drivers list
useEffect(() => {

  setShowUserInfopp2(drivers.length === 0 && activePageId === 3);
}, [drivers, activePageId]); // Dependency on cars array and activePageId
  const userInfoRef = useRef(null); // Create a ref for the user info tooltip
  useEffect(() => {
    // Simulate loading for 1 second on component mount
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // 1000 milliseconds = 1 second

    // Cleanup function to clear the timeout if the component unmounts before the timer finishes
    return () => clearTimeout(timer);
  }, []); // Empty dependency array means this runs once on mount

  // Your existing logic...

  if (loading) {
    return <Loading />;
  }
  // Render the active component based on the current activePageId
  const renderActiveComponent = () => {
    const activePage = pages.find(page => page.id === activePageId);
    return activePage ? <activePage.component /> : null;
  };
  if (userRoles === 'user' && (carCount === 0 || driverCount === 0)) {
    return <Fornonadmin />;
  }

  return (
    <div className='mainofplacholdring'> 
      <div style={{
        // backgroundImage: `url(${mainpic})`,
        backgroundSize: 'cover',
        backgroundPosition: 'top',
        width: '1130px',
        height: '300px',
        className:"containerflow1",
        position: 'relative'
      }}>
         <div className='sidebottiOP'> {/* This div will be absolutely positioned within the container */}
         <div className='titledahsss'>
          To use the dashboard, first create some 
          <span style={{color: driverCount > 0 ? "black" : "blue",marginLeft:'5px',marginRight:'5px'}} className={driverCount === 0 ? "glow" : ""}>drivers</span> and 
          <span style={{color: carCount > 0 ? "black" : "blue" ,marginLeft:'5px',marginRight:'5px'}} className={carCount === 0 ? "glow" : ""}>vehicles</span>:
        </div>

        <div className='pagedahsss'>
          {pages.map(page => (
            <button
              key={page.id}
              className={activePageId === page.id ? 'placflowbuactive' : 'placflowbu'}
              onClick={() => setActivePageId(page.id)}
            >
              {page.icon && <img src={page.icon} alt={`${page.name} icon`} style={{ width: '20px', marginRight: '10px' }} />}
              {page.name}
            </button>
          ))}
        </div>
        <div ref={userInfoRef} className={`user-infopp ${showUserInfopp ? 'active' : ''}`}>
        Add New Vehicle Here!
        </div>
        <div ref={userInfoRef} className={`user-infopp ${showUserInfopp2 ? 'active' : ''}`}>
        Add New Driver Here!
        </div>
      </div>
    
      </div>
     
      {renderActiveComponent()}
    </div>
  );
}

export default PlaceHolderView;