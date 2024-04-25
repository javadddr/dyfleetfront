// AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Optionally initialize user from localStorage if needed
        const savedUser = localStorage.getItem('userData');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const navigate = useNavigate();

    const authCheck = async () => {
        const userToken = localStorage.getItem('userToken');
        if (!userToken) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/someendpoint`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: userToken }),
            });

            const data = await response.json();
            if (response.ok) {
                // Update localStorage and user state with new data
                localStorage.setItem('userData', JSON.stringify(data.result)); // Store user data as string
                setUser(data.result);
            } else {
                navigate('/login');
            }
        } catch (error) {
            console.error('Failed to authenticate:', error);
            navigate('/login');
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, authCheck }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
