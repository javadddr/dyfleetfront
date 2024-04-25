import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';



import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import './Users.css';
import plusi from "./plusi.svg"
function Users() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [areas, setAreas] = useState([]); // State to store fetched areas
  const allAreasOption = { label: "All", value: "all" };
  const [editingUserId, setEditingUserId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    roles: '', active: '', allowedArea: []
  });
const combinedOptions = [allAreasOption, ...areas];

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    roles: 'admin',
    allowedArea: []
  });

  const fetchUsers = async () => {
    const userToken = localStorage.getItem('userToken');
    const currentUsername = localStorage.getItem('username'); // Get the current user's username
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/auth/users`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      const filteredUsers = response.data.filter(user => user.username !== currentUsername); // Filter out the current user
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  
  useEffect(() => {
    fetchUsers();

  }, []);

  useEffect(() => {
    const fetchAreas = async () => {
      const token = localStorage.getItem('userToken');
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/areas`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setAreas(response.data.map(area => ({ label: area.areaName, value: area._id })));
      } catch (error) {
        console.error('Error fetching areas:', error);
      }
    };
    fetchAreas();
  }, []);

 
  const handleInputChange = (e) => {
    const { name, value, options, type } = e.target;
    if (type === 'select-multiple' && name === "allowedArea") {
      const values = Array.from(options).filter(option => option.selected).map(option => option.value);
      setFormData(prevState => ({
        ...prevState,
        [name]: values
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };
  
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userToken = localStorage.getItem('userToken');
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/createUser`, formData, {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      });
      setShowModal(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        roles: 'admin',
        allowedArea: []
      });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };
  const startEdit = (user) => {
    setEditingUserId(user._id);
    setEditFormData({
      roles: user.roles,
      active: user.active ? "Active" : "Pending",
      allowedArea: user.allowedArea
    });
  };
  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    if (name === "active") {
        // Convert "Active" to true, anything else to false
        setEditFormData(prev => ({ ...prev, [name]: value === "Active" }));
    } else {
        setEditFormData(prev => ({ ...prev, [name]: value }));
    }
};

  
  
  const saveEdits = async () => {
    const userToken = localStorage.getItem('userToken');
    const updateData = {
        roles: editFormData.roles,
        active: editFormData.active === "Active",  // Convert to boolean
        allowedArea: editFormData.allowedArea
    };

    console.log("Sending update data:", updateData);  // Log what's being sent to the API

    try {
        const response = await axios.patch(`${process.env.REACT_APP_BACKEND_URL}/auth/updateUser/${editingUserId}`, updateData, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        if (response.status === 200) {
            setEditingUserId(null);
            fetchUsers(); // Reload the user list after the update
        } else {
            console.error('Failed to update user:', response.data.message);
        }
    } catch (error) {
        console.error('Error updating user:', error);
    }
};

  return (
    <div className="users-container">
      <div className='vehicles-container'>
        <button className='addimg' onClick={() => setShowModal(true)}>
        <img src={plusi} alt="Add" style={{width:'12%',marginRight: "8px" }} />Create New User
      </button>
  
      
      </div>
      <div className='tabeluserddics'>
      <table>
  <thead>
    <tr>
      <th className="username">Username</th>
      <th className="email">Email</th>
      <th className="roles">Roles</th>
      <th className="status">Status</th>
      <th className="allowedArea">Allowed Area</th>
      <th className="action">Action</th>
    </tr>
  </thead>
  <tbody>
    {users.map(user => (
      <tr key={user._id}>
        <td className="username">{user.username}</td>
        <td className="email">{user.email}</td>
        <td className="roles">
          {editingUserId === user._id ? (
            <select name="roles" value={editFormData.roles} onChange={handleEditFormChange}>
            <option value="" disabled>Please select the role</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
       
          ) : user.roles}
        </td>
        <td className="status">
    {editingUserId === user._id ? (
        <select
            name="active"
            value={editFormData.active ? "Active" : "Pending"} // Set based on boolean
            onChange={handleEditFormChange}
        >
            <option value="" disabled>Select the status</option>
            <option value="Active">Active</option>
            <option value="Pending">Inactive</option>
        </select>
    ) : user.active ? 'Active' : 'Inactive'}
</td>

        <td className="allowedArea">
          {editingUserId === user._id ? (
            <Autocomplete
              multiple
              options={[{ label: 'All', value: 'all' }, ...areas]}
              getOptionLabel={(option) => option.label}
              value={editFormData.allowedArea.map(area => ({ label: area, value: area }))}
              isOptionEqualToValue={(option, value) => option.label === value.label}
              onChange={(event, newValue) => setEditFormData({
                ...editFormData,
                allowedArea: newValue.map(item => item.label)
              })}
              renderInput={(params) => <TextField {...params} />}
            />
          ) : user.allowedArea.join(', ')}
        </td>
        <td className="action">
          {editingUserId === user._id ? (
            <IconButton onClick={saveEdits}>
              <SaveIcon />
            </IconButton>
          ) : (
            <IconButton onClick={() => startEdit(user)}>
              <EditIcon />
            </IconButton>
          )}
        </td>
      </tr>
    ))}
  </tbody>
</table>

      </div>
      {showModal && (
        <>
          <div className="overlayoknfd" onClick={() => setShowModal(false)}></div>
          <div className="modalusercreatin">
            <div className='Addvehicleopl'>Add New User</div>
            <form onSubmit={handleSubmit}>
             <div className='ejazebedin'>
                <div className='userfotbaba'>
                  <div className='userfotbaba1'>Username: </div>
                  <div className='userfotbaba2'>
                    <input type="text" name="username" value={formData.username} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className='userfotbaba'>
                <div className='userfotbaba1'>Email: </div>
                <div className='userfotbaba2'>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className='userfotbaba'>
                <div className='userfotbaba1'>Password: </div>
                <div className='userfotbaba2'>
                  <input type="text" name="password" value={formData.password} onChange={handleInputChange} required />
                  </div>
                </div>
               
                <div className='userfotbaba'>
                  <div className='userfotbaba1'>Roles: </div>
                  <div className='userfotbaba2'>
                    <select name="roles" value={formData.roles} onChange={handleInputChange}>
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                    </select>
                  </div>
                </div>

                <div className='userfotbaba'>
                  <div className='userfotbaba1'>Allowed Area:</div>
                  <div className='userfotbaba2'>
                  <Autocomplete
                    multiple
                    options={[{ label: 'All', value: 'all' }, ...areas]}
                    getOptionLabel={(option) => option.label}
                    value={editFormData.allowedArea.map(area => areas.find(a => a.label === area) || { label: area, value: area })}
                    isOptionEqualToValue={(option, value) => option.label === value.label}
                    onChange={(event, newValue) => {
                      setEditFormData(prev => ({ ...prev, allowedArea: newValue.map(item => item.label) }));
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />



                  </div>
                </div>

              </div>

              <div className='btnbothccxs'>
              <button id='cankmanfi2' onClick={() => setShowModal(false)}>Cancel</button>
              <button id='sareojagh' type="submit">Submit</button>
             
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default Users;
