import React, { useState } from 'react';
import './ChangePass.css'; 
import dodo from "./dd.gif"
import './Login.css'; 
function ChangePass() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messagew, setMessagew] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/request-password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setIsLoading(false);
    if (response.ok) {
      setMessage(''); // Clear any previous error message
      setMessagew('Email sent. Please check your inbox for the password reset link.')
      setShowPopup(true); // Show popup on success
    } else {
      setMessage('Failed to send password reset email. Please try again.');
      setShowPopup(false); // Ensure the popup is not shown on failure
      setIsLoading(false);
    }
  };
  

  return (
    <div className='mainlogin'>
    {showPopup && (
  <div className="popup">
    <div className="popup-content">
      <div className="gif">
      <img src={dodo} alt="Loading" style={{ width: '270px' }} />

      </div>
      <div className="messageandemail">
      {messagew}
      <button onClick={() => setShowPopup(false)}>Close</button>
      </div>
      
    </div>
    
  </div>
)}

      <div className="login-container">
        <form onSubmit={handleSubmit} className="login-form">
          <div className="titlechange">Request a New Password</div>
          
          <div className='email'>
            <label>Email:</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email" 
              required 
            />
          </div>
        
          <button id='justatikso' type="submit" className="form-submit" disabled={isLoading} style={{fontSize:"16px"}}>
            {isLoading ? 'Sending Email...' : 'Send The Password Reset Link to my email'}
          </button>
        </form>
        <div className='reseterror'>
        {message && !showPopup && <div className="message">{message}</div>}
        </div>
        <div className='forgotpassdd'>
        <a href="/login">Already have an account? <span>Log in here</span></a>
      </div>
      <div className='forgotrigister'>
       <a href="/register">Don't have an account? <span>Sign up here!</span></a>
      </div>
      </div>
      
    </div>
  );
}

export default ChangePass;
