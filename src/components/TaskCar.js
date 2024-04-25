import React, { useState, useEffect } from 'react';
import './TaskCar.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Snackbar, Alert } from '@mui/material';
import { useCars } from '../CarsContext';
import plusi from "../plusi.svg";
const TaskCar = ({  car: propCar,onCarUpdate }) => {
  const [addingTask, setAddingTask] = useState(false); // at the beginning where you declare other state variables
  const [addingNote, setAddingNote] = useState(false); // Add this at the beginning with other state variables

  const {cars, refreshCars } = useCars();
  const [car, setCar] = useState(propCar); // New state to manage car data
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
console.log(users)
const [newTaskDescription, setNewTaskDescription] = useState('');
const [newTaskDueDate, setNewTaskDueDate] = useState(new Date());
const [newTaskOwner, setNewTaskOwner] = useState('');
const [editingTaskId, setEditingTaskId] = useState(null);
const [editTaskDescription, setEditTaskDescription] = useState('');
const [editTaskDueDate, setEditTaskDueDate] = useState(new Date());
const [editTaskOwner, setEditTaskOwner] = useState('');
const [openDialog, setOpenDialog] = useState(false);
const [taskToDelete, setTaskToDelete] = useState(null);
const [snackbarInfo, setSnackbarInfo] = useState({ open: false, severity: '', message: '' });

useEffect(() => {

  fetchUsers();
}, [car]); // Re-fetch tasks and users when the car changes

useEffect(() => {
  setTasks(car.tasks || []);
  fetchUsers();
}, [car]); // Re-fetch tasks and users when the car changes
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


    setUsers(data);
  } catch (error) {
    console.error(error);
  }
};

const handleAddTask = async () => {
  const token = localStorage.getItem('userToken'); 
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/cars/${car._id}/tasks`, {
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
    const updatedCarsList = await refreshCars();

    // Find the updated car in the refreshed list
    const updatedCar = updatedCarsList.find(c => c._id === car._id);
    if (updatedCar) {
      // Assuming tasks and notes are directly on the car object
      setTasks(updatedCar.tasks);
      setCar(updatedCar); // Update local state with the refreshed car
      onCarUpdate(updatedCar); // Propagate changes up to the parent component if needed
      setSnackbarInfo({ open: true, severity: 'success', message: 'Task added successfully' });
    }
    toggleAddingTask()
    // Reset form fields
    setNewTaskDescription('');
    setNewTaskDueDate(new Date());
    setNewTaskOwner('');
  } catch (error) {
    console.error(error);
    setSnackbarInfo({ open: true, severity: 'error', message: 'Failed to add task' });
  }
};

const handleUpdateTask = async (taskId) => {
  const token = localStorage.getItem('userToken'); 
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/cars/${car._id}/tasks/${taskId}`, {
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
    const updatedCarsList = await refreshCars();

    // Find the updated car in the refreshed list
    const updatedCar = updatedCarsList.find(c => c._id === car._id);
    if (updatedCar) {
      // Assuming tasks and notes are directly on the car object
      setTasks(updatedCar.tasks);
      setCar(updatedCar); // Update local state with the refreshed car
      onCarUpdate(updatedCar); // Propagate changes up to the parent component if needed
    }
    setSnackbarInfo({ open: true, severity: 'success', message: 'Task updated successfully' });
    setEditingTaskId(null); // Exit editing mode
  } catch (error) {
    console.error(error);
    setSnackbarInfo({ open: true, severity: 'error', message: 'Failed to update task' });
  }
};
const promptDeleteTask = (taskId) => {
  setTaskToDelete(taskId);
  setOpenDialog(true);
};

const confirmDeleteTask = async () => {
  if (!taskToDelete) return;

  // This assumes handleToggleTaskStatus can handle setting the status to "Deleted".
  // You might need to adjust handleToggleTaskStatus to ensure it correctly processes the "Deleted" status.
  await handleToggleTaskStatus(taskToDelete, 'Deleted');

  setSnackbarInfo({ open: true, severity: 'success', message: 'Task marked as deleted successfully.' });
  setTaskToDelete(null); // Reset taskToDelete
  setOpenDialog(false); // Close the dialog
};


// TaskCar component
const handleDeleteTask = async (taskId) => {
  console.log('Deleting task with ID:', taskId);
  await handleToggleTaskStatus(taskId, 'Deleted');
  setOpenDialog(false); // Close the dialog
};

const handleCloseSnackbar = () => {
  setSnackbarInfo({ ...snackbarInfo, open: false });
};
const handleToggleTaskStatus = async (taskId, currentStatus) => {
  console.log('Toggling status for task with ID:', taskId, 'Current status:', currentStatus);
  const newStatus = currentStatus === 'Open' ? 'Done' : currentStatus === 'Done' ? 'Open' : 'Deleted';
  const token = localStorage.getItem('userToken'); 
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/cars/${car._id}/tasks/${taskId}/status`, {
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

    const updatedCarsList = await refreshCars();
    const updatedCar = updatedCarsList.find(c => c._id === car._id);
    if (updatedCar) {
      setTasks(updatedCar.tasks.filter(t => t.taskStatus !== 'Deleted'));
      setCar(updatedCar);
      onCarUpdate(updatedCar);
    }
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
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/cars/${car._id}/notes`, {
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
      const updatedCarsList = await refreshCars();

      // Find the updated car in the refreshed list
      const updatedCar = updatedCarsList.find(c => c._id === car._id);
      if (updatedCar) {
        // Assuming tasks and notes are directly on the car object
        setNotes(updatedCar.notes);
        setCar(updatedCar); // Update local state with the refreshed car
        onCarUpdate(updatedCar); // Propagate changes up to the parent component if needed
      }
      setNewNoteContent('');
      setSnackbarInfo({
        open: true,
        severity: 'success',
        message: 'Note added successfully.'
      });
      toggleAddingNote()
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
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/cars/${car._id}/notes/${editNoteId}`, {
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
      const updatedCarsList = await refreshCars();

      // Find the updated car in the refreshed list
      const updatedCar = updatedCarsList.find(c => c._id === car._id);
      if (updatedCar) {
        // Assuming tasks and notes are directly on the car object
        setNotes(updatedCar.notes);
        setCar(updatedCar); // Update local state with the refreshed car
        onCarUpdate(updatedCar); // Propagate changes up to the parent component if needed
      }
      setEditNoteId(null);
      setEditNoteContent('');
      setSnackbarInfo({
        open: true,
        severity: 'success',
        message: 'Note updated successfully.'
      });
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

    {/* Task Section */}
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
      {car.tasks
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
  <p><strong>Owner:</strong> {
      // Find the user with the ID matching task.owner and display their username
      // If no match is found, display 'Unknown'
      users.find(user => user._id === task.owner)?.username || 'Unknown'
    }</p>

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
      <button onClick={() => promptDeleteTask(task._id)}>Delete</button>


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
    <img src={plusi} alt="Add" style={{width: '12%', marginRight: "8px"}} />
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
        {car.notes
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
                  <p>
            <small>
              Created on: {new Date(note.creatingDate).toLocaleDateString()} by {
                // Find the user by ID and display the username. If not found, display 'Unknown'.
                users.find(user => user._id === note.creator)?.username || 'Unknown'
              }
            </small>
          </p>
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
      <Button onClick={confirmDeleteTask} autoFocus color="error">
        Delete
      </Button>
    </DialogActions>
  </Dialog>

  <Snackbar
    open={snackbarInfo.open}
    autoHideDuration={6000}
    onClose={() => setSnackbarInfo({ ...snackbarInfo, open: false })}
    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
  >
    <Alert onClose={() => setSnackbarInfo({ ...snackbarInfo, open: false })} severity={snackbarInfo.severity}>
      {snackbarInfo.message}
    </Alert>
  </Snackbar>
  </div>
);
};

export default TaskCar;