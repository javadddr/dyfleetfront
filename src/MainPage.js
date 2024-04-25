
import './MainPage.css'; // Import your CSS file for styling
import React, { useState, useEffect,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "./logo5.jpeg"
import FleetOver from './FleetOver';
import Vehicles from './Vehicles';
import Drivers from './Drivers';
import Sid5 from './Compliance';
import Sid6 from './Sid6';
import Sid7 from './Sid7';
import Sid8 from './Reports';
import as from "./as.svg";
import h from "./h.svg"
import s from "./s.svg"
import CostTypes from './CostTypes';
import Users from './Users';
import General from './General';
import users from "./users.svg"
import c from "./c.svg"
import g from "./g.svg"
import e from "./e.svg"
import l from "./l.svg"
import b from "./b.svg"
import log from "./log.svg"
import com from "./com.svg"
import dd from "./dd.svg"
import op from "./op.svg"
import car from "./car.svg"
import rep from "./rep.svg"
import over from "./over.svg"
import are from "./are.svg"
import Contact from './Contact';
import Tutorial from './Tutorial';
import Plan from './Plan';
import { useCars } from './CarsContext';
import { useDrivers } from './DriversContext'; // Import useDrivers hook
const pages = [
  { id: 1, name: 'Fleet Overview', component: FleetOver, icon: over },
  { id: 2, name: 'Vehicles', component: Vehicles, icon: car  },
  { id: 3, name: 'Drivers', component: Drivers, icon: dd  },
  { id: 5, name: 'Compliance', component: Sid5, icon: com },
  { id: 6, name: 'Operations', component: Sid6 , icon: op},

  { id: 8, name: 'Reports', component: Sid8, icon: rep },

];

function MainPage() {
  
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({});

const [activeComponent, setActiveComponent] = useState(null);
const showTrialEndedOverlay = userInfo.capacity === 0 && userInfo.createdAtDays >= 14;
const authCheck = async () => {
  const userToken = localStorage.getItem('userToken');
  if (!userToken) {
      console.error('No token found, redirecting to login');
      navigate('/login');
      return;
  }

  console.log("Sending token:", userToken); // Debug: Log the token to console

  try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/someendpoint`, {
          method: 'POST',
          headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${userToken}`  // Ensure this is correctly formatted
          },
      });

      const data = await response.json();
      if (response.ok) {
          console.log('Authentication successful:', data);
          
          // Store the received user data in localStorage
          localStorage.setItem('userToken', data.token);
          localStorage.setItem('username', data.result.username);
          localStorage.setItem('userEmail', data.result.email);
          localStorage.setItem('userRoles', data.result.roles);
          localStorage.setItem('userId', data.result._id);
          localStorage.setItem('capacity', data.result.capacity.toString());

          // Calculate the days since creation
          const createdAtDate = new Date(data.result.createdAt);
          const currentDate = new Date();
          const timeDiff = currentDate.getTime() - createdAtDate.getTime();
          const daysSinceCreation = Math.floor(timeDiff / (1000 * 3600 * 24));
          localStorage.setItem('createdAtDays', daysSinceCreation.toString());

          // Update the React state
          setUserInfo({
              token: data.token,
              email: data.result.email,
              username: data.result.username,
              roles: data.result.roles,
              capacity: data.result.capacity,
              createdAtDays: daysSinceCreation,
              userId: data.result._id
          });

      } else {
          console.error('Authentication failed:', data);
          navigate('/login');
      }
  } catch (error) {
      console.error('Failed to authenticate:', error);
      navigate('/login');
  }
};

useEffect(() => {
 
  authCheck();
}, []);
const userRoles = localStorage.getItem('userRoles'); 
const capacity = parseInt(localStorage.getItem('capacity'), 10);
  const [activePageId, setActivePageId] = useState(pages[0].id);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const userInfoRef = useRef(null); // Create a ref for the user info tooltip
  const accountIconRef = useRef(null); // Add this line
  const [showHelpInfo, setShowHelpInfo] = useState(false);
  const helpIconRef = useRef(null); // Ref for the Help icon
  const helpInfoRef = useRef(null); // Ref for the Help tooltip
  const [showSettingsInfo, setShowSettingsInfo] = useState(false);
const settingsIconRef = useRef(null); // Ref for the Settings icon
const settingsInfoRef = useRef(null); // Ref for the Settings tooltip
const { cars } = useCars();
const { drivers } = useDrivers(); // Assuming this gives you the drivers list
// Updated function to handle setting the active component
const handleSetComponent = (componentName) => {
  const componentMap = {
    General: General,
    Users: Users,
    CostTypes: CostTypes,
    Contact: Contact,
    Tutorial: Tutorial,
    Plan: Plan,
  };

  const component = componentMap[componentName];
  if (component) {
    setActiveComponent(() => component); // Update activeComponent
    setShowSettingsInfo(false); // Optionally close the settings menu
    setShowHelpInfo(false); // Optionally close the help menu
  }
};
const toggleSettingsInfo = () => {
  setShowSettingsInfo(!showSettingsInfo);
};

  const toggleHelpInfo = () => {
    setShowHelpInfo(!showHelpInfo);
  };
  
  const toggleUserInfo = () => {
    setShowUserInfo(!showUserInfo);
  };

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (userInfoRef.current && !userInfoRef.current.contains(event.target) && !accountIconRef.current.contains(event.target)) {
        setShowUserInfo(false);
      }
      if (helpInfoRef.current && !helpInfoRef.current.contains(event.target) && !helpIconRef.current.contains(event.target)) {
        setShowHelpInfo(false);
      }
      if (settingsInfoRef.current && !settingsInfoRef.current.contains(event.target) && !settingsIconRef.current.contains(event.target)) {
        setShowSettingsInfo(false);
      }
    }
    
    
    

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userInfoRef]); // Dependency array includes userInfoRef to re-bind the event listener if it changes
  const handlePageChange = (id) => {
    setActivePageId(id);
    setActiveComponent(null); // Reset activeComponent to ensure sidebar navigation works
  };
 

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    navigate('/login');
  };

  const ActivePageComponent = pages.find(page => page.id === activePageId).component;
  const handleSubscribeClick = () => {
    // Assuming 'userInfo' contains 'token' and 'userId'
    const { token, userId } = userInfo;
  
    if (!token || !userId) {
      console.error("User token or ID is missing!");
      return; // Exit if no token or userId is available
    }
  
    // Construct the URL with query parameters
    const billingUrl = new URL('https://billing.dynamofleet.com');
    billingUrl.searchParams.append('token', token);
   
    // Navigate to the billing page in the same tab with parameters
    window.location.href = billingUrl.href;

  };
  
  return (
    <div className="main-container">
      <div className="sidebar">
        <div>
        <div className="top-section" onClick={() => window.open('https://dynamofleet.com/', '_blank')}>
          <div className="logo">
            <img src={logo} alt="Logo" style={{ maxWidth: '30%', height: 'auto' }} />
            <div className="name">DynamoFleet</div>
          </div>
        </div>
        <div className='sidebotti'>
        {pages.map(page => (
          <button
            key={page.id}
            className={activePageId === page.id && !activeComponent ? 'active' : ''}
            onClick={() => handlePageChange(page.id)}
          >
           
            {page.icon && <img src={page.icon} alt={`${page.name} icon`} style={{ width: '13%', marginRight: '9px' }} />}
           
            <div>
            {page.name}
            </div>
          </button>
        ))}

        </div>
        </div>
       { userInfo.capacity===0&& userInfo.createdAtDays<14&& <div className="cardtrial" onClick={handleSubscribeClick}>
       <div> You are using the trial version, with<h1>{13-userInfo.createdAtDays} days remaining.</h1>Click here to subscribe.</div>
        </div>}
        <div className="bottom-icons">

           {userRoles === 'admin'&& <div ref={accountIconRef} onClick={toggleUserInfo} className='aicon'>
            <img src={as} alt="Logo" style={{ width: '10%', height: 'auto' }} />
            Account
            </div>}

            
           { userRoles === 'admin'&& <div ref={helpIconRef} onClick={toggleHelpInfo} className='aicon'>
              <img src={h} alt="Logo" style={{ width: '10%', height: 'auto' }} />
              Help
            </div>}
           { userRoles === 'admin'&& <div ref={settingsIconRef} onClick={toggleSettingsInfo} className='aicon'>
              <img src={s} alt="Settings Logo" style={{ width: '10%', height: 'auto' }} />
              Settings
            </div>}
           { userRoles === 'admin'&&<div className='capacityinfomain' onClick={handleSubscribeClick}>
            <div id='capacityinfomain1'>Your capacity: {cars.length}/{capacity} Vehicles</div>
            <div id='capacityinfomain1'>Your capacity: {drivers.length}/{capacity*3} Drivers</div>
            <div id='capacityinfomain2'>Purchase additional capacity here.</div>
        
            </div>}
        </div>
        <div ref={userInfoRef} className={`user-info ${showUserInfo ? 'active' : ''}`}>
        <div className="user-info-detail">
          <span>Email:</span>
          {userInfo.email}
        </div>
        <div className="user-info-detail">
          <span>Username:</span>
          {userInfo.username}
        </div>
        <div className="user-info-detail">
          <span>Roles:</span>
          {userInfo.roles}
        </div>
        
          <button id='dicldocwor' onClick={handleLogout}>Logout
          <img src={log} alt="Contact Logo" style={{ width: '25%', height: 'auto' }} />
          </button>
        </div>
        <div ref={helpInfoRef} className={`help-info ${showHelpInfo ? 'active' : ''}`}>
          <h4>Need Help?</h4>
          <div className='setlinks' onClick={() => handleSetComponent('Contact')}>
            <span>Contact us</span>
            <img src={e} alt="Contact Logo" style={{ width: '10%', height: 'auto' }} />
          </div>
          <div className='setlinks' onClick={() => handleSetComponent('Tutorial')}>
            <span>Tutorial and Learning</span>
            <img src={l} alt="Tutorial Logo" style={{ width: '10%', height: 'auto' }} />
          </div>
          <div className='setlinks' onClick={() => handleSetComponent('Plan')}>
            <span>My Plan</span>
            <img src={b} alt="Plan Logo" style={{ width: '10%', height: 'auto' }} />
          </div>
        </div>
      <div ref={settingsInfoRef} className={`settings-info ${showSettingsInfo ? 'active' : ''}`}>
      <h4>System settings</h4>
     <div className='sitems'>
      {/* <div className='setlinks' onClick={() => handleSetComponent('General')}>
      <span>General</span>
      <img src={g} alt="Settings Logo" style={{ width: '12%', height: 'auto' }} />
         
      </div> */}
      <div className='setlinks' onClick={() => handleSetComponent('Users')}>
      <span>Users</span>
      <img src={users} alt="Settings Logo" style={{ width: '12%', height: 'auto' }} />
         
          </div>
      {/* <div className='setlinks' onClick={() => handleSetComponent('CostTypes')}>
      <span>Cost types</span>
      <img src={c} alt="Settings Logo" style={{ width: '11%', height: 'auto' }} />
         </div> */}
      </div>
      </div>
      </div>
      <div className="page-content" style={{ position: 'relative', width: '100%' }}> {/* Ensure this div is set to occupy full width */}
    {showTrialEndedOverlay && (
        <div className="overlay-subscribe">
            <h2>Your Trial Ended</h2>
            <p>Subscribe now to continue using our services.</p>
            <button onClick={handleSubscribeClick} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>Subscribe</button>
        </div>
    )}
    <div className={showTrialEndedOverlay ? 'blur-content' : ''} style={{ width: '100%' }}>
        {activeComponent ? React.createElement(activeComponent) : <ActivePageComponent />}
    </div>
</div>


    </div>
  );
}

export default MainPage;
