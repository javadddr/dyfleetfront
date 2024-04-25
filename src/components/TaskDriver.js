import React, { useState, useEffect } from 'react';
import './TaskCar.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDrivers } from '../DriversContext'; // Import useDrivers hook
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Snackbar, Alert } from '@mui/material';

import plusi from "../plusi.svg";
const TaskDriver = ({  driver: propDriver,onDriverUpdate}) => {
  const [addingTask, setAddingTask] = useState(false); // at the beginning where you declare other state variables
  const [addingNote, setAddingNote] = useState(false); // Add this at the beginning with other state variables
  const [driver, setDriver] = useState(propDriver); 
  const [openDialog, setOpenDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [snackbarInfo, setSnackbarInfo] = useState({ open: false, message: '' });
  const handleOpenDialog = (taskId) => {
    setOpenDialog(true);
    setTaskToDelete(taskId);
  };
  
  const { drivers, refreshDrivers } = useDrivers();
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editNoteId, setEditNoteId] = useState(null);
  const [editNoteContent, setEditNoteContent] = useState('');
  const toggleAddingTask = () => {
    setAddingTask(!addingTask);
  };
  const toggleAddingNote = () => {
    setAddingNote(!addingNote);
  };
  
  
const [tasks, setTasks] = useState([]);
const [notes, setNotes] = useState([]);
const [users, setUsers] = useState([]);
const [newTaskDescription, setNewTaskDescription] = useState('');
const [newTaskDueDate, setNewTaskDueDate] = useState(new Date());
const [newTaskOwner, setNewTaskOwner] = useState('');
const [editingTaskId, setEditingTaskId] = useState(null);
const [editTaskDescription, setEditTaskDescription] = useState('');
const [editTaskDueDate, setEditTaskDueDate] = useState(new Date());
const [editTaskOwner, setEditTaskOwner] = useState('');

useEffect(() => {

  fetchUsers();
}, [driver]); // Re-fetch tasks and users when the car changes

useEffect(() => {
  setTasks(driver.tasks || []);
  fetchUsers();
}, [driver]); // Re-fetch tasks and users when the car changes
const currentUserUsername = localStorage.getItem('username');
const fetchUsers = async () => {
  const token = localStorage.getItem('userToken'); 
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    let data = await response.json();

    // Check if current user is already in the list, if not, add them
    if (!data.some(user => user.username === currentUserUsername)) {
      data = [{ username: currentUserUsername }, ...data];
    }

    setUsers(data);
  } catch (error) {
    console.error(error);
  }
};

const handleAddTask = async () => {
  const token = localStorage.getItem('userToken'); 
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/drivers/${driver._id}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        description: newTaskDescription,
        dueDate: newTaskDueDate,
        owner: newTaskOwner,
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to add task');
    }
    await refreshDrivers(); 
     // Show success alert
     setSnackbarInfo({
      open: true,
      message: 'New task was added successfully.',
      severity: 'success', // Make sure to add 'severity' in your state and Snackbar component if it's not already there
    });
    setNewTaskDescription('');
    setNewTaskDueDate(new Date());
    setNewTaskOwner('');
    setAddingTask(false);
  } catch (error) {
    console.error(error);
    setSnackbarInfo({
      open: true,
      message: 'Error adding task.',
      severity: 'error', // Use this to control the color of the alert
    });
  }
};
useEffect(() => {
  // Find the current driver in the updated drivers list
  const updatedDriver = drivers.find(d => d._id === driver._id);
  if (updatedDriver) {
    setTasks(updatedDriver.tasks);
    setNotes(updatedDriver.notes);
    setDriver(updatedDriver); // Update local state with the latest information
    onDriverUpdate(updatedDriver); // Ensure the parent component also receives the latest driver information
  }
}, [drivers, driver._id, onDriverUpdate]);

const handleUpdateTask = async (taskId) => {
  const token = localStorage.getItem('userToken'); 
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/drivers/${driver._id}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        description: editTaskDescription,
        dueDate: editTaskDueDate,
        owner: editTaskOwner,
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to update task');
    }
    await refreshDrivers(); 
    setEditingTaskId(null); // Exit editing mode
  } catch (error) {
    console.error(error);
    // Handle update error
  }
};
// TaskCar component
const handleDeleteTask = async (taskId) => {
  if (!taskToDelete) return;
  const token = localStorage.getItem('userToken');
  try {
    // Directly setting the status to 'Deleted' instead of toggling
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/drivers/${driver._id}/tasks/${taskId}/status`, {
      method: 'PUT', // Ensure this is a PUT request, as it seems to be the method expected by your API
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status: 'Deleted' }), // Setting status to 'Deleted'
    });

    if (!response.ok) throw new Error('Failed to delete task');

    // If successful, refresh your local state to reflect the change

    setSnackbarInfo({ open: true, message: 'Task deleted successfully.' });
    await refreshDrivers();
    setOpenDialog(false);
  } catch (error) {
    console.error('Error in deleting the task:', error);
    setSnackbarInfo({ open: true, message: 'Error deleting task.' });
  }
  setTaskToDelete(null);
};


const handleToggleTaskStatus = async (taskId, currentStatus) => {
  console.log('Toggling status for task with ID:', taskId, 'Current status:', currentStatus);
  const newStatus = currentStatus === 'Open' ? 'Done' : 'Open'; // Adjusted logic for toggling status
  const token = localStorage.getItem('userToken');
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/drivers/${driver._id}/tasks/${taskId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!response.ok) {
      throw new Error('Failed to toggle task status');
    }

    await refreshDrivers(); // Assuming this function fetches updated drivers list and updates state accordingly

   
  } catch (error) {
    console.error(error);
  }
};




















const getDueDateStyle = (dueDate) => {
  const currentDate = new Date();
  const due = new Date(dueDate);
  const oneDay = 24 * 60 * 60 * 1000; // milliseconds in one day
  const differenceInDays = Math.round((due - currentDate) / oneDay);

  if (differenceInDays < 0) {
    return { color: 'rgb(182, 33, 27)' }; // Past due date
  } else if (differenceInDays <= 7) {
    return { color: ' rgb(193, 193, 76)'}; // Within a week
  } else {
    return { color: 'green' }; // More than a week away
  }
};










  //
  const handleAddNote = async () => {
    const token = localStorage.getItem('userToken'); 
    const username = localStorage.getItem('username');
    console.log(username)
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/drivers/${driver._id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: newNoteContent,
          creatingDate: new Date(),
          creator: username,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to add note');
      }
      toggleAddingNote()
      await refreshDrivers(); 
      setNewNoteContent('');
      
    } catch (error) {
      console.error(error);
    }
  };
  const startEditNote = (note) => {
    setEditNoteId(note._id);
    setEditNoteContent(note.content);
  };

  const handleUpdateNote = async () => {
    const token = localStorage.getItem('userToken');
    const username = localStorage.getItem('username');
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/drivers/${driver._id}/notes/${editNoteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: editNoteContent,
          creator: username,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to update note');
      }
      await refreshDrivers(); 
      setEditNoteId(null);
      setEditNoteContent('');
    } catch (error) {
      console.error(error);
    }
  };
 // Cancels note editing
 const cancelEdit = () => {
  setEditNoteId(null);
  setEditNoteContent('');
};



return (
<div className="tasks-notes-container">

   
    <div className="tasks-section">
 
    <div className='buttonassign'>
  <button onClick={toggleAddingTask}>
    <img src={plusi} alt="Add"  style={{width:'12%',marginRight: "8px" }} />
    Add New Task
  </button>
</div>
    <div className={`add-task-form ${addingTask ? 'form-visible' : ''}`}>
   
    <textarea
          type="text"
          value={newTaskDescription}
          onChange={(e) => setNewTaskDescription(e.target.value)}
          placeholder="Task Description"
          className='taskdis'
          ></textarea>
        <div className='resoftaskop'>
          <div className='divfordando'>
            <div className='taskduedandv'>Due Date: </div>
        <input
          type="date"
          value={newTaskDueDate.toISOString().split('T')[0]}
          onChange={(e) => setNewTaskDueDate(new Date(e.target.value))}
        />
        <select
          value={newTaskOwner}
          onChange={(e) => setNewTaskOwner(e.target.value)}
        >
          <option value="">Select Owner</option>
          {users.map((user, index) => (
            <option key={index} value={user._id}>{user.username}</option>
          ))}
        </select>
        </div>
        <div>
        <button onClick={handleAddTask}>Add Task</button>
      </div>
     
      </div>
      
      </div>
      <hr />
      {driver.tasks
      .filter(task => task.taskStatus !== 'Deleted')
       .slice() // Creates a shallow copy of the notes array to avoid sorting it in place
       .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .map((task, index) => (
  <div key={index} className="task-item">
    {editingTaskId === task._id ? (
      <div className="task-edit-form">
        <div className='taskdisanddis'>
        <textarea
          value={editTaskDescription}
          onChange={(e) => setEditTaskDescription(e.target.value)}
          placeholder="Task Description"
          className="taskdis" // Apply the same class if you want the same styling
        ></textarea>

          </div>
          <div className='taskdisanddate'>
          <div className='editiforselfortas'>
       <input
        type="date"
        value={editTaskDueDate.toISOString().split('T')[0]}
        onChange={(e) => setEditTaskDueDate(new Date(e.target.value))}
      />
        <select
          value={editTaskOwner}
          onChange={(e) => setEditTaskOwner(e.target.value)}
        >
          <option value="">Select Owner</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>{user.username}</option>
          ))}
        </select>
        </div>
        <div className='notebediti'>
        <button id='notediSave' onClick={() => handleUpdateTask(task._id)}>Save</button>
        <button id='notedicancel' onClick={() => setEditingTaskId(null)}>Cancel</button>
        </div>
      </div>
      </div>
    ) : (
      <div className='taskdisand'>
        <div className='taskdisanddis'>
        <p className={task.taskStatus === 'Done' ? 'strikethrough' : ''}>
  {task.description}
</p>

        </div>
        <div className='taskdisanddate'>
  <p style={getDueDateStyle(task.dueDate)}>
    <strong>Due Date:</strong> {new Date(task.dueDate).toLocaleDateString()}
  </p>
  <p><strong>Owner:</strong> {users.find(user => user._id === task.owner)?.username || 'Unknown'}</p>
  <div className='checkboxdone'>
  Done?
  {task.taskStatus !== 'Deleted' && (
       <label className="switch">
       <input
         type="checkbox"
         checked={task.taskStatus === 'Done'}
         onChange={() => handleToggleTaskStatus(task._id, task.taskStatus)}
       />
       <span className="slider round"></span>
     </label>
      )}
      </div>
      <button onClick={() => handleOpenDialog(task._id)}>Delete</button>


  <button onClick={() => {
    setEditingTaskId(task._id);
    setEditTaskDescription(task.description);
    setEditTaskDueDate(new Date(task.dueDate));
    setEditTaskOwner(task.owner);
  }}>Edit</button>

  
</div>

      </div>
      
    )}
     <hr />
  </div>
))}


     
   
    </div>
    <div className="notes-section">
    <div className='buttonassign'>
  <button onClick={toggleAddingNote}>
    <img src={plusi} alt="Add"  style={{width:'12%',marginRight: "8px" }} />
    Add New Note
  </button>
</div>
  
<div className={`add-task-form ${addingNote ? 'form-visible' : ''}`}>
        <textarea value={newNoteContent} onChange={(e) => setNewNoteContent(e.target.value)} placeholder="Write a new note..."></textarea>
        <div className='editnotetaski'>
        <button onClick={handleAddNote}>Add Note</button>
        </div>
       
      </div>
      <hr />
      <ul>
        {driver.notes
        .slice() // Creates a shallow copy of the notes array to avoid sorting it in place
        .sort((a, b) => new Date(b.creatingDate) - new Date(a.creatingDate))
        .map((note, index) => (
          <li key={index} className="note-display">
            {editNoteId === note._id ? (
              <div className="note-edit-form">
                <div>
                <textarea className="inter-font" value={editNoteContent} onChange={(e) => setEditNoteContent(e.target.value)} />
                </div>
                <div className='notebediti'>
                <button className='notediSave' onClick={() => handleUpdateNote(note._id)}>Save</button>
                <button className='notedicancel' onClick={cancelEdit}>Cancel</button>
                </div>
                
              </div>
              
            ) : (
              <div className='notediv'>
                <div className='notemain'>
                <p>{note.content}</p>
                </div>
                <div className='noteinfo'>
                  <div>
                <p><small>Created on: {new Date(note.creatingDate).toLocaleDateString()} by {note.creator}</small></p>
                </div>
                <div>
                <button onClick={() => startEditNote(note)}>Edit</button>
                </div>
               
                </div>
              
              </div>
              
            )}
            
          </li>
          
        ))}
        
      </ul>
     
    </div>
    <Dialog
   open={openDialog}
   onClose={() => { setOpenDialog(false); setTaskToDelete(null); }}
  aria-labelledby="alert-dialog-title"
  aria-describedby="alert-dialog-description"
>
  <DialogTitle id="alert-dialog-title">{"Are you sure you want to delete this task?"}</DialogTitle>
  <DialogContent>
    <DialogContentText id="alert-dialog-description">
      This action cannot be undone.
    </DialogContentText>
  </DialogContent>
  <DialogActions>
  <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
  <Button onClick={() => {
    handleDeleteTask(taskToDelete);
    setOpenDialog(false); // Close the dialog after confirmation
  }} autoFocus color="error">
    Delete
  </Button>
</DialogActions>

</Dialog>

<Snackbar
  open={snackbarInfo.open}
  autoHideDuration={4000}
  onClose={() => setSnackbarInfo({ ...snackbarInfo, open: false })}
  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
>
  <Alert onClose={() => setSnackbarInfo({ ...snackbarInfo, open: false })} severity="success" sx={{ width: '100%' }}>
    {snackbarInfo.message}
  </Alert>
</Snackbar>
<Snackbar
  open={snackbarInfo.open}
  autoHideDuration={4000}
  onClose={() => setSnackbarInfo({ ...snackbarInfo, open: false })}
  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
>
  <Alert onClose={() => setSnackbarInfo({ ...snackbarInfo, open: false })} severity={snackbarInfo.severity} sx={{ width: '100%' }}>
    {snackbarInfo.message}
  </Alert>
</Snackbar>

  </div>
);
};


export default TaskDriver;