import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import "./Login.css";
import logo from "./logo5.jpeg";
import eye from "../src/eye.png";
import eye1 from "../src/eye1.png";
import { jwtDecode } from 'jwt-decode';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  function handleCallbackResponse(response) {
    console.log("Encoded JWT ID token:" + response.credential);
    var userObject = jwtDecode(response.credential);
    console.log(userObject);
    handleGoogleLogin(userObject); // Trigger Google login
  }

  const handleGoogleLogin = async (userObject) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userObject.email,
          password: 'google_oauth' // Use the default password for Google login
        }),
      });
      const data = await response.json();

      if (response.ok) {
        // Store user information and token in localStorage
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userRoles', data.result.roles);
        localStorage.setItem('username', data.result.username);
        localStorage.setItem('userEmail', data.result.email);
        localStorage.setItem('userId', data.result._id);
        localStorage.setItem('capacity', data.result.capacity.toString());

        const createdAtDate = new Date(data.result.createdAt);
        const currentDate = new Date();
        const timeDiff = currentDate.getTime() - createdAtDate.getTime();
        const daysSinceCreation = Math.floor(timeDiff / (1000 * 3600 * 24));
        localStorage.setItem('createdAtDays', daysSinceCreation.toString());

        navigate('/main'); // Redirect to MainPage
      } else {
        setErrorMessage('Login failed. Please verify your credentials and try again.');
      }
    } catch (error) {
      console.error('Google login error:', error);
      setErrorMessage('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      callback: handleCallbackResponse
    });
    google.accounts.id.renderButton(
      document.getElementById("signInDiv"),
      { theme: "outline", size: "large" }
    );
    const button = document.querySelector('#signInDiv div');
    if (button) {
      button.style.border = '1px solid yellow';
      button.style.boxShadow = 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px';
      button.style.borderRadius = '5px';
    }
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      setIsLoading(false);
      if (response.ok) {
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userRoles', data.result.roles);
        localStorage.setItem('username', data.result.username);
        localStorage.setItem('userEmail', data.result.email);
        localStorage.setItem('userId', data.result._id);
        localStorage.setItem('capacity', data.result.capacity.toString());

        const createdAtDate = new Date(data.result.createdAt);
        const currentDate = new Date();
        const timeDiff = currentDate.getTime() - createdAtDate.getTime();
        const daysSinceCreation = Math.floor(timeDiff / (1000 * 3600 * 24));
        localStorage.setItem('createdAtDays', daysSinceCreation.toString());

        navigate('/main'); // Redirect to MainPage
      } else {
        setErrorMessage('Login failed. Please verify your credentials and try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      navigate('/main');
    }
  }, [navigate]);

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
                <img src={showPassword ? eye1 : eye} style={{ width: '30px' }} alt="Toggle Password Visibility" />
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
          <div className='googldivin'>Or login with Google Account</div>
          <div id='signInDiv'></div>
          <div className='forgotpass'>
            <Link to="/change-password">Did you forget your password? <span>Click here!</span></Link>
          </div>
          <div className='forgotregister'>
            <Link to="/register">Don't have an account? <span>Sign up here!</span></Link>
          </div>
        </form>
        <div className="greenSquare"></div>
        <div className="greenSquare2"></div>
      </div>
      <div className='company-info'>
        <img src={logo} alt="Company Logo" style={{ width: '40px', height: 'auto', marginRight: "4px" }} /><br></br>
        <a href="https://dynamofleet.com/" target="_blank" rel="noopener noreferrer" >DynamoFleet</a> is a premium product developed by DynamoChart UG, based in Germany.<br></br>&copy; 2024 DynamoChart UG. All rights reserved.
      </div>
    </div>
  );
}

export default Login;
