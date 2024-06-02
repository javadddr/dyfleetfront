import React, { useState,useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import logo from "./logo5.jpeg"
import "./Register.css"
import "./Login.css"
import eye from "../src/eye.png"
import eye1 from "../src/eye1.png"
import Modal from './Modal'; // Import the modal component
function Register() {
  const navigate = useNavigate();
  const [alertType, setAlertType] = useState('error');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      navigate('/main');
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const togglePasswordVisibility = () => { // Add this function
    setShowPassword(!showPassword);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    setShowAlert(false); // Initially hide the alert to reset any previous state
  
    // Set a short timeout to ensure any previous alert transitions have completed
    setTimeout(async () => { // Mark this function as async to use await inside
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
  
        setMessage(data.message || (response.ok ? `Registration successful. Please check your email (${formData.email}) to activate your account.` : 'Registration failed. Please try again.'));
        setAlertType(response.ok ? 'success' : 'error');
        setIsLoading(false);
        setShowAlert(true); // Show alert
  
        setTimeout(() => {
          
          setShowAlert(false); // Begin to hide alert after 3 seconds
          if (response.ok) {
            setTimeout(() => navigate('/login'), 700); // Navigate after the alert is hidden
          }
         
        }, 40000);
  
      } catch (error) {
        console.error('Registration error:', error);
        setMessage('An error occurred. Please try again.');
        setAlertType('error');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 20000); // Hide alert after 3 seconds
      }
    }, 100); // Short delay to reset the showAlert state
  };
  
  
  


  return (
    <div className='register-main'>
  
      <div className="form-container">
      {message && showAlert && (
        <Stack sx={{ width: '100%', position: 'absolute', top: -90, left: 0, zIndex: 1000,borderRadius:'30px'}} spacing={2}>
        
        <Alert
            className={`alert-enter ${showAlert ? 'alert-enter-active' : 'alert-exit-active'}`}
            variant="filled"
            severity={alertType}
            sx={{
              fontSize: '16px', // Sets the font size to 20px
              borderRadius: '10px', // You can keep other styles here as well
              '& .MuiAlert-message': { // Targeting the internal message class for additional specific styles
                fontSize: '16px' // Ensures that text inside the alert also gets the same font size
              }
            }}
          >
            {message}
          </Alert>

        </Stack>
      )}
        <form onSubmit={handleSubmit} className="register-form">
          <h2>Register</h2>
          <div className="email">
            <label>Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} required />
          </div>
          <div className="email">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="password-field">
          <label>Password</label>
          <div className='eyeandpass'>
          <div className='onlypass'>
           
            <input  type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required />
            <div onClick={togglePasswordVisibility} className="password-toggle">
            <img src={showPassword ? eye1 : eye} style={{width:'30px'}} alt="Toggle Password Visibility" />
          </div>
          </div>
              </div>
          </div>
          <button id='justatikso' type="submit" className="form-submit" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
          <h6 className="term-form-footer">
  By registering, you accept our <br></br><a href="https://dynamofleet.com/terms-of-service" target="_blank" rel="noopener noreferrer" style={{ color: 'blue' }}>Terms of Service</a> and <a href="https://dynamofleet.com/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: 'blue' }}>Privacy Notice</a>.
</h6>

          <p className="form-footer">
             <Link to="/login">Already have an account? <span>Log in here</span></Link>.
          </p>
        </form>
        <div className="greenSquare"></div>
          <div className="greenSquare2"></div>
         
      </div>
      <div className='company-info'>
      <img src={logo} alt="Company Logo" style={{ width: '40px', height: 'auto',marginRight:"4px" }} /><br></br>
      <a href="https://dynamofleet.com/" target="_blank" rel="noopener noreferrer" >DynamoFleet</a> is a premium product developed by DynamoChart UG, based in Germany.<br></br>&copy; 2024 DynamoChart UG. All rights reserved.
    </div>
    <Modal show={showAlert} message={message} onClose={() => setShowAlert(false)} alertType={alertType} />
    </div>
  );
}

export default Register;
