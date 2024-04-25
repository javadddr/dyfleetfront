// PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider'; // Make sure the path here is correct

const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
