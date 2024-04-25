import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Login.css"

import eye from "../src/eye.png"
import eye1 from "../src/eye1.png"
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      navigate('/main');
    }
  }, [navigate]);
  const togglePasswordVisibility = () => { // Add this function
    setShowPassword(!showPassword);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    console.log(data)
    setIsLoading(false);
    if (response.ok) {
      localStorage.setItem('userToken', data.token); 
     
      localStorage.setItem('userRoles', data.result.roles);
      localStorage.setItem('username', data.result.username);
      localStorage.setItem('userEmail', data.result.email);
      localStorage.setItem('userId', data.result._id);
      
      localStorage.setItem('capacity', data.result.capacity.toString()); // Save capacity as a string
        // Calculate and save the days since account creation
        const createdAtDate = new Date(data.result.createdAt);
        const currentDate = new Date();
        const timeDiff = currentDate.getTime() - createdAtDate.getTime();
        const daysSinceCreation = Math.floor(timeDiff / (1000 * 3600 * 24)); // Convert milliseconds to days
        localStorage.setItem('createdAtDays', daysSinceCreation.toString()); // Save as a string

      navigate('/main'); // Redirect to MainPage
    } else {
      setErrorMessage('Login failed. Please check your credentials and try again.');
    }
  };

  return (
    <div className='mainlogin'>
    <div className="login-container">
    <form onSubmit={handleSubmit} className="login-form">
      <h2>Login</h2>
      <div className='email'>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
     
      <div className="password-field">
        <label>Password:</label>
        <div className='eyeandpass'>
          <div className='onlypass'>
          <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            
            />
          </div>
          <div onClick={togglePasswordVisibility} className="password-toggle">
            <img src={showPassword ? eye1 : eye} style={{width:'30px'}} alt="Toggle Password Visibility" />
          </div>

      </div>
              </div>
      <div className='buttonlogin'>

      <button id='justatikso' type="submit" className="form-submit" disabled={isLoading}>
            {isLoading ? 'Logging In...' : 'Log In'}
          </button>
      </div>
      <div className='passwrongi'>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
      <div className='forgotpass'>
        <a href="/change-password">Did you forget your password? <span>Click here!</span></a>
      </div>
      <div className='forgotrigister'>
       <a href="/register">Don't have an account? <span>Sign up here!</span></a>
      </div>
    
    </form>
  </div>
  </div>
  );
}

export default Login;
