import React,{useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import Change from './Change';
import ChangePass from './ChangePass';
import Register from './Register';
import Login from './Login';
import MainPage from './MainPage'; // Adjust the path as necessary
import { CarsProvider } from './CarsContext';
import { DriversProvider } from './DriversContext';
import SetPassword from './SetPassword';
import 'bootstrap/dist/css/bootstrap.min.css';
import PrivateRoute from './PrivateRoute'; // Make sure the path is correct
import { AuthProvider } from './AuthProvider'; // Make sure the path is correct
function App() {

  



  return (
    <AuthProvider>
    <DriversProvider>
    <CarsProvider>
    <Router>
      <Routes> 
      <Route path="/" element={<Navigate replace to="/login" />} />
        <Route path="/activate/:token" element={<Home />} /> 
        <Route path="/register" element={<Register />} />
        <Route path="/change-password" element={<ChangePass />} />
        <Route path="/reset-password/:token" element={<Change />} />
        <Route path="/login" element={<Login />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/set-password/:token" element={<SetPassword />} />
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
      </Routes>
    </Router>
    </CarsProvider>
    </DriversProvider>
    </AuthProvider>
  );
}

export default App;

