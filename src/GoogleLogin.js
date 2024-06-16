// src/components/GoogleLogin.js
import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const GoogleLoginComponent = () => {
  const handleLoginSuccess = (response) => {
    const decoded = jwtDecode(response.credential);
    console.log('Login Success: currentUser:', decoded);

    // Send token to backend
    fetch('http://localhost:5000/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: response.credential }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        window.location.href = '/welcome';
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  const handleLoginFailure = (response) => {
    console.log('Login failed: res:', response);
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div>
        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onFailure={handleLoginFailure}
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginComponent;
