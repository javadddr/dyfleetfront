import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    
    // Optionally, here you can add logic to verify the token's validity
    // For example, you might send a request to your backend to validate the token

    if (!token) {
      // If no token is found or if the token is invalid, redirect to the login page
      navigate('/login');
    }
  }, [navigate]);
};

export default useAuth;
