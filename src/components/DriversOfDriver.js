import React, { useState, useEffect } from 'react';
import { useCars } from '../CarsContext';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';
import TableFooter from '@mui/material/TableFooter';
import {DyBarHorizontal} from 'dynamochart';
import Loading from '../Loading'; 
import "./DriversOfDriver.css"
function DriversOfDriver({ driver: propDriver }) {

  const { cars,refreshCars } = useCars();
  const currentDate = new Date();
  const [assignments, setAssignments] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [statusRecords, setStatusRecords] = useState([]);
  const [statusDurations, setStatusDurations] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Combine current, future, and history cars into a single array with a category
    const allAssignments = cars.flatMap(car => car.drivers.filter(d => d.driverId.toString() === propDriver._id)
      .map(driverAssignment => ({
        internalName: car.general.internalName,
        from: new Date(driverAssignment.from),
        till: driverAssignment.till ? new Date(driverAssignment.till) : 'Current',
        category: categorizeAssignment(driverAssignment.from, driverAssignment.till),
        carState: car.state,
        driverStatus: propDriver.status
      }))
    );
    setAssignments(allAssignments);
  }, [cars, propDriver]);

  function categorizeAssignment(from, till) {
    const from_date = new Date(from);
    const till_date = till ? new Date(till) : new Date();
    
    if (from_date <= currentDate && (!till || till_date >= currentDate)) {
      return 'Current Car';
    } else if (from_date > currentDate) {
      return 'Future Cars';
    } else if (till && new Date(till) < currentDate) {
      return 'History Cars';
    }
  }

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const paginatedAssignments = assignments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);


  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  useEffect(() => {
    setLoading(true); // Set loading to true at the start of the effect
    
    const fetchStatusRecords = async () => {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/statusRecords/statusByDriver/${propDriver._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.ok) {
        const data = await response.json();
      
        setStatusRecords(data);
        // No setLoading(false) here because we still need to process the data
      } else {
        console.error("Failed to fetch status records");
        setLoading(false); // Stop loading if the fetch fails
      }
    };
  
    fetchStatusRecords();
  }, [propDriver._id]); // This effect runs on mount and whenever propDriver._id changes
  
  
  useEffect(() => {
    const sortedStatusRecords = statusRecords.sort((a, b) => new Date(a.from) - new Date(b.from));
  
    // Calculate durations for each status
    const durations = sortedStatusRecords.reduce((acc, record, index) => {
      const nextRecord = sortedStatusRecords[index + 1];
      const from = new Date(record.from);
      const to = nextRecord ? new Date(nextRecord.from) : new Date();
      const duration = parseFloat(((to - from) / (1000 * 60 * 60 * 24)).toFixed(1));
      acc[record.status] = (acc[record.status] || 0) + duration;
      return acc;
    }, {});
  
    // Calculate total duration
    const totalDuration = sortedStatusRecords.length > 0
      ? parseFloat(((new Date() - new Date(sortedStatusRecords[0].from)) / (1000 * 60 * 60 * 24)).toFixed(1))
      : 0;
  
    // Calculate percentage of total for each status
    let durationsWithPercentage = Object.entries(durations).reduce((acc, [status, duration]) => {
      acc[status] = {
        duration,
        percentage: totalDuration > 0 ? ((duration / totalDuration) * 100).toFixed(1) : 0
      };
      return acc;
    }, {});
  
    // Check if the sum of percentages exceeds 100%
    const totalPercentages = Object.values(durationsWithPercentage).reduce((total, { percentage }) => total + parseFloat(percentage), 0);
    if (totalPercentages > 100) {
      // Scale down each percentage proportionally
      durationsWithPercentage = Object.entries(durationsWithPercentage).reduce((acc, [status, data]) => {
        const scaledPercentage = (data.percentage / totalPercentages) * 100;
        acc[status] = {
          duration: data.duration,
          percentage: scaledPercentage.toFixed(1)
        };
        return acc;
      }, {});
    }
  
    setStatusDurations({ ...durationsWithPercentage, total: totalDuration });
  }, [statusRecords]);
  




  const [dataForChart, setDataForChart] = useState([]);

  // Simple color scheme for different statuses
  const statusColors = {
    "Active": "#4CAF50",
    "Holiday": "#FFC107",
    "Over Hours": "#F44336",
    "Work Accident": "#9C27B0",
    "Inactive": "#03A9F4",
    "Sick": "#E91E63",
    
  };
  
  useEffect(() => {
    setLoading(true);
    const chartData = Object.entries(statusDurations).reduce((acc, [status, data]) => {
      // Skip the "total" key
      if (status !== 'total') {
        acc.push({
          Status: status,
          Percentage: parseFloat(data.percentage), // Ensure value is a number
          color: statusColors[status] || '#000' // Default color if status not found
        });
      }
      return acc;
    }, []);
   
    setDataForChart(chartData);
    setLoading(false)
  }, [statusDurations]);
  
  



  if (loading) {
    return <Loading />; 
  }


  return (
    <div className='maindriverwithstatus'>
      <div className='carsassidrivers'>
        <table className="table">
          <thead className="table-dark" >
            <tr>
              <th scope="col">Assigned Time</th>
              <th scope="col">Car Name</th>
              <th scope="col">From</th>
              <th scope="col">Till</th>
              <th scope="col">Car State</th>
              <th scope="col">Driver Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAssignments.map((assignment, index) => (
              <tr key={index}>
                <td>{assignment.category}</td>
                <td>{assignment.internalName}</td>
                <td>{assignment.from.toLocaleDateString()}</td>
                <td>{assignment.till instanceof Date ? assignment.till.toLocaleDateString() : assignment.till}</td>
                <td>{assignment.carState}</td>
                <td>{assignment.driverStatus}</td>
              </tr>
            ))}
               <nav className='navpaginationddd0'>
          <ul className="paginationddd0">
            {[...Array(Math.ceil(assignments.length / rowsPerPage)).keys()].map(num => (
              <li key={num} className={`page-item ${num === page ? 'active' : ''}`}>
                <button onClick={() => handleChangePage(num)} className="page-link">
                  {num + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
          </tbody>
       
        </table>
      </div>
    {dataForChart.length > 0 && <div className='Durationsdrivers'>
      <div className='firstinfostatus'>
            <div>
              <h2>Status Durations</h2>{statusDurations.total && <p>Total Duration: {statusDurations.total} days</p>}
            </div>
                <div className='statusdrversendi'>
                {Object.entries(statusDurations).map(([status, data]) => {
                  // Avoid rendering the "total" key as a status
                  if (status !== 'total') {
                    return (
                      <p key={status}>
                        <span>{status}:</span> {data.duration.toFixed(1)} 
                      </p>
                    );
                  }
                  return null;
                })}
                
                </div>
                </div>
                <div className='secondchartinfo'>
                <DyBarHorizontal
                    data={dataForChart}
                    xAxis='Percentage'
                    yAxis='Status'
                    showTooltip = {true}
                    borderWidth={2}
                    showValues={true}
                    valueDisplayPosition='top' 
                    valueFontSize = '0.9rem'
                    valueFontFamily = 'inter'
                    showTicks = {false}
                    showYLabels = {true}
                    chartTitle = ""
                    grid={false}
                    gridNumber={5}
                    gridColor="green"
                    sort='za'  //az,za,n
                    barHeight = {30}
                    spacingBetweenBars = {3}
                    cWidth = {500}
                    margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    barBorderRadius={0}
                    template='t1'
                  />
                </div>
                
      </div>}
    </div>
  );
}

export default DriversOfDriver;