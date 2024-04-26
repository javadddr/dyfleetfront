import React, { useEffect, useState } from 'react';
import './FleetOver.css'; // Make sure this path matches your CSS file's location
import { useCars } from './CarsContext';
import Loading from './Loading'; 
import { useDrivers } from './DriversContext'; // Import useDrivers hook
import DyLine from './DyLine';
import {DyPie} from 'dynamochart';
import {DyTable} from 'dynamochart';
import {DyStackChart} from 'dynamochart';
import {DyBar} from 'dynamochart';
import PlaceHolderView from './PlaceHolderView'
import { useNavigate } from 'react-router-dom';
function FleetOver() {
  const [loadingO, setLoadingO] = useState(true);
  const [fines, setFines] = useState([]);
  const [areasPerformance, setAreasPerformance] = useState([]);
  const navigate = useNavigate();

    // Define the fetchFines function
    const fetchFines = async () => {
      const token = localStorage.getItem('userToken');
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/fines`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch fines');
        }
        const data = await response.json();
    
        // Calculate the sum of costs for unique drivers and get the top 5
        const driverCosts = data.reduce((acc, fine) => {
          if (fine.driverName && fine.cost != null) {
            acc[fine.driverName] = (acc[fine.driverName] || 0) + fine.cost;
          }
          return acc;
        }, {});
    
        const topDrivers = Object.entries(driverCosts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, cost], index) => {
            // Check if the name length is more than 10 characters
            const formattedName = name.length > 10 ? `${name.substring(0, 10)}...` : name;
            return {
              name: formattedName,
              cost,
              color: ['#4CAF50', '#2196F3', '#FF5722', '#FFC107', '#e9b0ef'][index % 5], // Cycle through colors
            };
          });
    
        setFines(topDrivers);
      } catch (error) {
        console.error('Error fetching fines:', error);
      } finally {
        setLoading(false);
      }
    };
    

  useEffect(() => {
    // Set a timer to switch the loading state off after 2 seconds
    const timer = setTimeout(() => setLoadingO(false), 1500);

    // Cleanup function to clear the timer if the component unmounts before 2 seconds
    return () => clearTimeout(timer);
  }, []); // The empty array ensures this effect runs only once on mount
  const {cars, refreshCars } = useCars();
  const {drivers, refreshDrivers } = useDrivers();
  const [statusDuringTimeForCars, setStatusDuringTimeForCars] = useState([]);
  const [statusDuringTimeForDrivers, setStatusDuringTimeForDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
const [loadingCars, setLoadingCars] = useState(false);
///
const [rows, setRows] = useState([]);

useEffect(() => {
  const calculatedRows = drivers.map((driver, index) => {
    const equipmentCost = driver.equipments.clothing.reduce((acc, item) => acc + item.cost, 0) + 
                           driver.equipments.other.reduce((acc, item) => acc + item.cost, 0);

    const invoiceAmount = driver.invoices.reduce((acc, invoice) => acc + invoice.amount, 0);

    // Calculate the total cost by adding equipmentCost and invoiceAmount
    const totalCost = equipmentCost + invoiceAmount;

    return {
      id: index + 1,
      firstName: driver.firstName,
      lastName: driver.lastName,
      // Include the totalCost in the returned object
      "Total cost": totalCost,
      value: { Equipments_Cost: equipmentCost, Invoices: invoiceAmount },
      tag: driver.status
    };
  });

  setRows(calculatedRows);
}, [drivers]); // Recalculate whenever drivers data changes
const columns = [
 
  { field: 'firstName', headerName: 'First name', width: 130 },
  { field: 'lastName', headerName: 'Last name', width: 130 },
  {field: 'Total cost',headerName: 'Total cost', type: 'number',width: 90},
 
];
const colorsta = {
  Active: '#4CAF50',
  Inactive: '#9E9E9E',
  Sick: '#2196F3',
  Holiday: '#FF9800',
  'Over Hours': '#FFEB3B',
  'Work Accident': '#F44336',
};
  const [statusCounts, setStatusCounts] = useState({});
  const [licenseCheckStatusCounts, setLicenseCheckStatusCounts] = useState({});
  const [activeVehiclesCount, setActiveVehiclesCount] = useState(0);
  useEffect(() => {
    const vehicleStatusCounts = cars.reduce((acc, car) => {
      const { state } = car;
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {});
    setStatusCounts(vehicleStatusCounts);

    const licenseStatusCounts = cars.reduce((acc, car) => {
      // Iterate over each car's license checks
      car.carLicenseCheck.forEach(check => {
        // Check if the statuses array is not empty
        if (check.statuses.length > 0) {
          // Get the most recent status (assuming the last status in the array is the most recent one)
          const mostRecentStatus = check.statuses[check.statuses.length - 1].status;
          // Increment the count for this status in the accumulator object
          acc[mostRecentStatus] = (acc[mostRecentStatus] || 0) + 1;
        }
      });
      return acc;
    }, {});
    
    
    setLicenseCheckStatusCounts(licenseStatusCounts);
    setActiveVehiclesCount(vehicleStatusCounts['Active'] || 0);
  }, [cars]);
///

///
const [statusCounts2, setStatusCounts2] = useState({});
const [licenseCheckStatusCounts2, setLicenseCheckStatusCounts2] = useState({});
const [activeVehiclesCount2, setActiveVehiclesCount2] = useState(0);
useEffect(() => {
  const driverStatusCounts = drivers.reduce((acc, driver) => {
    const { status } = driver;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  setStatusCounts2(driverStatusCounts);
 
  const licenseStatusCounts = drivers.reduce((acc, driver) => {
    // Iterate over each driver's license checks
    driver.driverLicenseCheck.forEach(check => {
      // Check if the statuses array is not empty
      if (check.statuses.length > 0) {
        // Get the most recent status (assuming the last status in the array is the most recent one)
        const mostRecentStatus = check.statuses[check.statuses.length - 1].status;
        // Increment the count for this status in the accumulator object
        acc[mostRecentStatus] = (acc[mostRecentStatus] || 0) + 1;
      }
    });
    return acc;
  }, {});
  
  setLicenseCheckStatusCounts2(licenseStatusCounts);
  setActiveVehiclesCount2(driverStatusCounts['Active'] || 0);
}, [drivers]);
///
const authCheck = async () => {
  const userToken = localStorage.getItem('userToken');
  if (!userToken) {
      console.error('No token found, redirecting to login');
      navigate('/login');
      return;
  }



  try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/someendpoint`, {
          method: 'POST',
          headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${userToken}`  // Ensure this is correctly formatted
          },
      });

      const data = await response.json();
      if (response.ok) {
          console.log('Authentication successful:', data);
          
          // Store the received user data in localStorage
          localStorage.setItem('userToken', data.token);
          localStorage.setItem('username', data.result.username);
          localStorage.setItem('userEmail', data.result.email);
          localStorage.setItem('userRoles', data.result.roles);
          localStorage.setItem('userId', data.result._id);
          localStorage.setItem('capacity', data.result.capacity.toString());

          // Calculate the days since creation
          const createdAtDate = new Date(data.result.createdAt);
          const currentDate = new Date();
          const timeDiff = currentDate.getTime() - createdAtDate.getTime();
          const daysSinceCreation = Math.floor(timeDiff / (1000 * 3600 * 24));
          localStorage.setItem('createdAtDays', daysSinceCreation.toString());

        

      } else {
          console.error('Authentication failed:', data);
          navigate('/login');
      }
  } catch (error) {
      console.error('Failed to authenticate:', error);
      navigate('/login');
  }
};



useEffect(() => {
  fetchFines();
  authCheck();
}, []);
const activepercar=((activeVehiclesCount/cars.length)*100).toFixed(0)
const activeperdriver=((activeVehiclesCount2/drivers.length)*100).toFixed(0)
const [loading, setLoading] = useState(false); 
const [data, setData] = useState([]);

useEffect(() => {
  setLoading(true);

  const getWeekStartDate = (date) => {
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getUTCDay(); // Sunday - 0, Monday - 1, etc.
    const firstDayOfWeek = new Date(dateObj);
    firstDayOfWeek.setDate(dateObj.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    firstDayOfWeek.setHours(0, 0, 0, 0); // Normalize time part to avoid timezone issues
    return firstDayOfWeek.toISOString().slice(0, 10);
  };

  const driverCountsByWeek = drivers.reduce((acc, driver) => {
    const weekStartDate = getWeekStartDate(driver.startDate);
    acc[weekStartDate] = (acc[weekStartDate] || 0) + 1;
    return acc;
  }, {});

  const vehicleCountsByWeek = cars.reduce((acc, car) => {
    const weekStartDate = getWeekStartDate(car.general.activeInFleetSinceDate);
    acc[weekStartDate] = (acc[weekStartDate] || 0) + 1;
    return acc;
  }, {});

  let combinedData = Object.keys({ ...driverCountsByWeek, ...vehicleCountsByWeek }).sort().map((weekStartDate) => {
    const driversCount = driverCountsByWeek[weekStartDate] || 0;
    const vehiclesCount = vehicleCountsByWeek[weekStartDate] || 0;
    const driverRatio = vehiclesCount > 0 ? +(driversCount / vehiclesCount).toFixed(2) : 0;

    return {
      date: weekStartDate,
      values: [driversCount, vehiclesCount, driverRatio],
    };
  });

  // Group by month and sum the values
  const monthlyData = combinedData.reduce((acc, item) => {
    const month = item.date.substring(0, 7) + "-01"; // Transform date to the first of the month
    if (!acc[month]) {
      acc[month] = [0, 0, 0]; // Initialize if not exist
    }
    acc[month][0] += item.values[0]; // Sum Drivers
    acc[month][1] += item.values[1]; // Sum Vehicles
    // Calculate new Driver Ratio
    acc[month][2] = acc[month][1] > 0 ? +(acc[month][0] / acc[month][1]).toFixed(2) : 0;
    return acc;
  }, {});

  // Convert to array and include cumulative totals
  let cumulativeTotals = [0, 0, 0];
  const resultData = Object.keys(monthlyData).sort().map(month => {
    cumulativeTotals[0] += monthlyData[month][0];
    cumulativeTotals[1] += monthlyData[month][1];
    const driverRatio = cumulativeTotals[1] > 0 ? +(cumulativeTotals[0] / cumulativeTotals[1]).toFixed(2) : 0;
    return {
      date: month,
      labels: ['Drivers', 'Vehicles', 'Driver Ratio'],
      values: [cumulativeTotals[0], cumulativeTotals[1], driverRatio],
    };
  });

  setData(resultData);
  setLoading(false);
}, [drivers, cars]);




const colors = ['#E15759', '#76B7B2', '#4E79A7'];

const [statusDurationSum, setStatusDurationSum] = useState([]);

useEffect(() => {
  setLoadingDrivers(true);

  const fetchStatusRecordsForAllDrivers = async () => {
    const token = localStorage.getItem('userToken');
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/statusRecords/statusByCreator`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch status records for drivers');
      }

      const statusRecords = await response.json();

      // First part: Calculate the summarized status durations
      let statusDurationSum = {}; // To hold the sum of days for each status
      const currentDate = new Date();

      statusRecords.forEach(record => {
        const startDate = new Date(record.from);
        const endDate = record.to ? new Date(record.to) : currentDate; // Use 'to' date if available, else use current date
        const durationDays = (endDate - startDate) / (1000 * 60 * 60 * 24);

        if (!statusDurationSum[record.status]) {
          statusDurationSum[record.status] = 0;
        }
        statusDurationSum[record.status] += Math.round(durationDays);
      });

      const summarizedStatuses = Object.entries(statusDurationSum).map(([label, value]) => ({
        label,
        value
      }));

      setStatusDurationSum(summarizedStatuses); // Keep this for wherever you're using it

      // Second part: Detailed monthly breakdown for visualization
      const statusCategories = ['Active', 'Inactive', 'Sick', 'Holiday', 'Over Hours', 'Work Accident']; // Your driver status categories
      const monthlyStatusDurations = new Map(); // To track durations per month

      statusRecords.forEach(record => {
        const startDate = new Date(record.from);
        const endDate = record.to ? new Date(record.to) : new Date(); // Current date if 'to' is not available
        const durationDays = (endDate - startDate) / (3600000) / 24; // Convert milliseconds to days (decimal)

        const monthKey = `${startDate.getUTCFullYear()}-${String(startDate.getUTCMonth() + 1).padStart(2, '0')}-01`;

        if (!monthlyStatusDurations.has(monthKey)) {
          monthlyStatusDurations.set(monthKey, { totalDays: 0, counts: Array(statusCategories.length).fill(0) });
        }

        const statusIndex = statusCategories.indexOf(record.status);
        
        if (statusIndex !== -1) {
          const monthData = monthlyStatusDurations.get(monthKey);
          monthData.totalDays += durationDays;
          monthData.counts[statusIndex] += durationDays;
          monthlyStatusDurations.set(monthKey, monthData);
        }
      });

      const monthlyData = Array.from(monthlyStatusDurations).map(([date, {totalDays, counts}]) => ({
        date,
        labels: statusCategories,
        values: counts.map(count => totalDays > 0 ? parseFloat(((count / totalDays) * 100).toFixed(1)) : 0)
      }));

      setStatusDuringTimeForDrivers(monthlyData); // New state for monthly breakdown data
    } catch (error) {
      console.error("Error fetching status records for drivers:", error);
    } finally {
      setLoadingDrivers(false);
    }
  };

  fetchStatusRecordsForAllDrivers();
}, [drivers]);


const [statusDurationSumCars, setStatusDurationSumCars] = useState({});

useEffect(() => {
  setLoadingCars(true); 

  const fetchStatusRecordsForAllCars = async () => {
    const token = localStorage.getItem('userToken');

    try {
      // Fetch status records for all cars associated with the main admin
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/carStatusRecords/statusByCreator`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch status records for cars');
      }

      const allStatusRecords = await response.json();

      let statusDurationSum = {}; // To hold the sum of days for each status
      const currentDate = new Date();

      // Process the status records
      allStatusRecords.forEach(record => {
        const startDate = new Date(record.from);
        const endDate = record.to ? new Date(record.to) : currentDate; // Use 'to' date if available, else use current date
        const durationDays = (endDate - startDate) / (1000 * 60 * 60 * 24);

        if (!statusDurationSum[record.status]) {
          statusDurationSum[record.status] = 0;
        }
        statusDurationSum[record.status] += Math.round(durationDays);
      });

      // Convert the object to an array of objects with label and value
      const summarizedStatuses = Object.entries(statusDurationSum).map(([label, value]) => ({
        label,
        value
      }));

      setStatusDurationSumCars(summarizedStatuses); // Update state with the summarized data
    } catch (error) {
      console.error("Error fetching status records for cars:", error);
    } finally {
      setLoadingCars(false); // Indicate the loading process has finished
    }
  };
 
  fetchStatusRecordsForAllCars();
}, [cars]); 

///for all cars status so i pust it in line chart below pie chart
useEffect(() => {
  setLoadingCars(true);

  const fetchStatusRecordsForAllCars = async () => {
    const token = localStorage.getItem('userToken');

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/carStatusRecords/statusByCreator`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch status records for cars');
      }
     
      const allStatusRecords = await response.json();
      const statusCategories = ['Active', 'Inactive', 'Incoming', 'Outgoing', 'Transferring', 'Repairing', 'No Driver'];
     
      // Initialize a Map object to keep track of the durations per month
      const monthlyStatusDurations = new Map();

      allStatusRecords.forEach(record => {
        const startDate = new Date(record.from);
        const endDate = record.to ? new Date(record.to) : new Date(); // Use current date if 'to' is not available
        const durationDays = (endDate - startDate) / (3600000) / 24; // Convert milliseconds to days (decimal)

        const monthKey = `${startDate.getUTCFullYear()}-${String(startDate.getUTCMonth() + 1).padStart(2, '0')}-01`;

        if (!monthlyStatusDurations.has(monthKey)) {
          monthlyStatusDurations.set(monthKey, { totalDays: 0, counts: Array(statusCategories.length).fill(0) });
        }
        
        const statusIndex = statusCategories.indexOf(record.status);
     
        if (statusIndex !== -1) {
          const monthData = monthlyStatusDurations.get(monthKey);
          monthData.totalDays += durationDays;
          monthData.counts[statusIndex] += durationDays; // Accumulate days for the specific status
          monthlyStatusDurations.set(monthKey, monthData);
        }
      });
     
      // Convert the Map object to the required array format
      const data = Array.from(monthlyStatusDurations).map(([date, {totalDays, counts}]) => {
        return {
          date,
          labels: statusCategories,
          // Convert to percentage, ensure the result is a number, and avoid division by zero
          values: counts.map(count => totalDays > 0 ? parseFloat(((count / totalDays) * 100).toFixed(0)) : 0)
        };
      });

    
      setStatusDuringTimeForCars(data);
    } catch (error) {
      console.error("Error fetching status records for cars:", error);
    } finally {
      setLoadingCars(false);
    }
  };

  fetchStatusRecordsForAllCars();
}, [cars]); 


useEffect(() => {
  setLoadingCars(true);
  const fetchStatusRecordsForAllCars = async () => {
    const token = localStorage.getItem('userToken');
    // Fetch status records for all cars associated with the main admin
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/carStatusRecords/statusByCreator`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch status records');
      }

      const allStatusRecords = await response.json();

      let statusDurationSum = {}; // To hold the sum of days for each status
      const currentDate = new Date();

      allStatusRecords.forEach(record => {
        const startDate = new Date(record.from);
        const endDate = record.to ? new Date(record.to) : currentDate; // Use 'to' date if available, else use current date
        const durationDays = (endDate - startDate) / (1000 * 60 * 60 * 24);

        if (!statusDurationSum[record.status]) {
          statusDurationSum[record.status] = 0;
        }
        statusDurationSum[record.status] += Math.round(durationDays);
      });

      // Convert the object to an array of objects with label and value
      const statusDurationSumArray = Object.entries(statusDurationSum).map(([label, value]) => ({
        label,
        value
      }));
    
      setStatusDurationSumCars(statusDurationSumArray);
    } catch (error) {
      console.error('Error fetching status records:', error);
    } finally {
      setLoadingCars(false);
    }
  };

  fetchStatusRecordsForAllCars();
}, []); // Removed dependency on cars since we're fetching all records associated with the user

useEffect(() => {
  const areaData = {};
  const currentTime = new Date().getTime();

  const filteredCars = cars.filter(car => car.area && Array.isArray(car.drivers) && car.drivers.length > 0);

  filteredCars.forEach(car => {
    const area = car.area;
    if (!areaData[area]) {
      areaData[area] = { carsCount: 0, currentDriversCount: 0 };
    }
    areaData[area].carsCount += 1;

    car.drivers.forEach(driver => {
      const fromTime = driver.from && driver.from.$date && driver.from.$date.$numberLong 
                        ? new Date(parseInt(driver.from.$date.$numberLong, 10)).getTime()
                        : 0;
      const tillTime = driver.till && driver.till.$date && driver.till.$date.$numberLong
                        ? new Date(parseInt(driver.till.$date.$numberLong, 10)).getTime()
                        : Infinity;

      if (currentTime >= fromTime && currentTime <= tillTime) {
        areaData[area].currentDriversCount += 1;
      }
    });
  });

  // Adjust the structure of areaDataArray to match the desired format
  const areaDataArray = Object.entries(areaData).map(([label, value]) => ({
    label,
    value: { carsCount: value.carsCount, currentDriversCount: value.currentDriversCount },
  }));

  // Set the areasPerformance state with the structured data
  setAreasPerformance(areaDataArray);

}, [cars]);




const colors1 = ['#E15759', '#F28E2C', '#4E79A7', '#76B7B2', '#e9b0ef'];
const colors3 = ['#E15759', '#F28E2C'];
if (cars.length === 0 || drivers.length === 0) {
  return <PlaceHolderView carCount={cars.length} driverCount={drivers.length}  />;
}
if (loadingO) {
  return <Loading />;
}

  return (
    <div className="mainfleeto">
   <div className='maindashdd'>
      <div className="kpi-container">
      <div className="kpi">
        <div className="kpi-title">Total Vehicles</div>
        <div className="kpi-value">{cars.length}</div>
        <div className="kpi-title">Active Vehicles</div>
        <div className="kpi-value">{activeVehiclesCount}</div>
        <div className="kpi-subtext">{activepercar}% Active</div>
      </div>
      <div className="kpi">
        <div className="kpi-title">Total Drivers</div>
        <div className="kpi-value">{drivers.length}</div>
        <div className="kpi-title">Active Drivers</div>
        <div className="kpi-value">{activeVehiclesCount2}</div>
        <div className="kpi-subtext">{activeperdriver}% Active</div>
      </div>
     
      <div className="kpi">
          <div className="kpi-title">Vehicles Status</div>
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className='sisisokl'>
              <div className='DOIROSBB'>{status}</div> <div className='nshrotil'> {count}</div>
            </div>
          ))}
        </div>
        <div className="kpi">
          <div className="kpi-title">Driver Status</div>
          {Object.entries(statusCounts2).map(([status, count]) => (
            <div key={status} className='sisisokl'>
              <div className='DOIROSBB'>{status}</div> <div className='nshrotil'> {count}</div>
            </div>
          ))}
        </div>
        <div className="kpi">
          <div className="kpi-title">Inspection Check</div>
          {Object.entries(licenseCheckStatusCounts).map(([status, count]) => (
            <div key={status} className='sisisokl'>
              <div className='DOIROSBB'>{status === "No or expired inspection" ? "No or expired" : status}</div> 
              <div className='nshrotil'> {count}</div>
            </div>
          ))}
        </div>

        <div className="kpi">
          <div className="kpi-title">License Check</div>
          {Object.entries(licenseCheckStatusCounts2).map(([status, count]) => (
            <div key={status} className='sisisokl'>
              <div className='DOIROSBB'>{status} </div> <div className='nshrotil'>{count}</div>
            </div>
          ))}
        </div>
      </div>
      <div className='kpi-container'>
        {loading || data.length === 0 ? (
          <Loading />
        ) : (
          
          <DyLine
            data={data}
            colors={['#E15759', '#76B7B2', '#4E79A7']}
            xAxisTitle="Date"
            yAxisTitle="Count"
            lineShape="curveMonotoneX"
            chartTitle="Number of Drivers and Vehicles"
            chartWidth={1115}
            chartHeight={450}
            legendTitle=""
            lineAreaColor={true}
            areaColorOpacity={0.3}
            linesPadding={0.1}
            chartTemplate="t2"
            dataPoints={5}
            chartBorder={true}
          />
        
        )}
      </div>
      <div className='kpi-container'>
        <div className='pistatusibin'>
          <div className='secopiformardd'>
    {loadingCars || !statusDurationSumCars.length ? (
        <Loading />
      ) : (
        <div className='secopiformarddPP'>
    <DyPie
            data={statusDurationSumCars}
            colors={colors1}
            chartWidth={525}
            chartHeight={500}
            chartPadding={50}  
            padding={{top:30,left:10,right:110,bottom:80}}
            donutRatio={50}
            showTotal={true}
            totalFormat="percentage"   //can be "number" or "percentage"
            totalSize={25}
            title="Vehicles Status"
            showSmall={3}
            strokeWidth="0"
            chartTemplate="t2" //chartTemplate can be "t1" or "t2"
          />
          </div>
          )}
          </div>
          <div className='secopiformar'>
    {loadingDrivers || !statusDurationSum.length ? (
        <Loading />
      ) : (
        <div className='secopiformarddPP'>
    <DyPie
            data={statusDurationSum}
            colors={colors1}
            chartWidth={525}
            chartHeight={500}
            chartPadding={50}  
            padding={{top:30,left:10,right:110,bottom:80}}
            donutRatio={50}
            showTotal={true}
            totalFormat="percentage"   //can be "number" or "percentage"
            totalSize={25}
            title="Drivers Status"
            showSmall={3}
            strokeWidth="0"
            chartTemplate="t2" //chartTemplate can be "t1" or "t2"
          />
          </div>
          )}
          </div>
         </div>
      </div>
       <div className='kpi-container'>
       {loading || statusDuringTimeForCars.length === 0 ? (
          <Loading />
            ) : (
              
              <DyLine
                data={statusDuringTimeForCars}
                colors={colors}
                xAxisTitle="Date"
                yAxisTitle="Percentage"
                lineShape="curveMonotoneX"
                chartTitle="State of the Fleet vs. Date"
                chartWidth={1115}
                chartHeight={450}
                legendTitle=""
                lineAreaColor={true}
                areaColorOpacity={0.3}
                linesPadding={0.1}
                chartTemplate="t2"
                dataPoints={5}
                chartBorder={true}
              />
            
            )}
       </div>
        <div className='kpi-container'>
        {loading || statusDuringTimeForDrivers.length === 0 ? (
    <Loading />
  ) : (
    
    <DyLine
      data={statusDuringTimeForDrivers}
      colors={colors}
      xAxisTitle="Date"
      yAxisTitle="Percentage"
      lineShape="curveMonotoneX"
      chartTitle="State of the Drivers vs. Date"
      chartWidth={1115}
      chartHeight={450}
      legendTitle=""
      lineAreaColor={true}
      areaColorOpacity={0.3}
      linesPadding={0.1}
      chartTemplate="t2"
      dataPoints={5}
      chartBorder={true}
    />
  
  )}
        </div>


  <div className='tableqbiappols'>
    
    <div className='tableqbiappols1'>
  {loading || rows.length === 0 ? (
    <Loading />
  ) : (
  <DyTable 
        rows={rows}
        colors={colorsta}
        columns={columns}
        pagesSize={10}
        chartMaxWidth={1200}
        showSearch={true}
        tableTemplate="t2" 
        />
        )}
        </div>
        <div className='tableqbiappols2'>
        {loading || fines.length === 0 ? (
    ""
  ) : (
        <DyBar
          data={fines}   //data is the name of the state in which your data is stored. In this case data is “data” because we have “const data=[]”.
          xAxis="name"  //If your data has a different name, you can enter it here. The date, which we want to display on the X-axis in this case, is called “Name”.
          yAxis="cost"   //If your data has a different name, you can enter it here. The date, which we want to display on the y-axis in this case, is called “Age”.
          showValues={true}  // Ensure that showValues is set to true
          valueDisplayPosition="middle" //can be "bottom","middle","top"
          valueFontSize='15px'
          valueFontFamily='inter'
          showXLabels={true} // Set to true to show x-axis labels or false to hide
          showYLabels={true} // Set to true to show y-axis labels or false to hide
          chartTitle="Top 5 Drivers with most fines"
          showXAxisLabel={true}
          showYAxisLabel={true}
          xAxisLabel="Driver"
          yAxisLabel="cost"
          xAxisLabelFont="inter"
          yAxisLabelFont="inter"
          xAxisLabelFontSize="16px"
          yAxisLabelFontSize="16px"
          xAxisLabelRotate="-45" // 'horizontal', 'vertical', or 45
          yAxisLabelRotate="0" // 'horizontal', 'vertical', or 45
          xAxisLine={true}
          yAxisLine={true}
          xAxisTick={true}
          yAxisTick={true}
          gridLine={true}
          barsWidth={10}
          barBorderRadius={2} // Adjust the border radius for the bars
          barBorderColor="black" // Adjust the border color for the bars
          showTooltip = {true}
          cWidth = {676}
          cHeight = {520}
          chartPadding={{ top: 110, right: 80, bottom: 140, left: 110 }}
          template='t2'
          chartBoxShadow={false}
          sortV = 'za' // Adjust the sort "za","az","n"
          sortD='n'
          dateFormat='dd-mm-yyyy' //can be 'dd-mm-yyyy' or 'mm-dd-yyyy'
          xAxisLabelM={10}
          valueFontColor="black"
        />
        )}
        </div>
        
        </div>
       
        <div className='kpi-container'>
  {loading || areasPerformance.length === 0 ? (
   ""
  ) : (
   <DyStackChart 
        initialData={areasPerformance} 
        colors={colors3} 
        sort = 'n' //az , za,n
        chartPadding = {{ top: 0, right:0, bottom: 20, left: 0 }}
        chartMargin = {{ top: 0, right: 0, bottom: 0, left: 0 }}
        chartWidth = {900}
        chartHeight = {250}
        gap = {20} // Gap between bars
        xAxis = 'label'   //this is coming from your data 
        xAxisTitle='Areas'
        yAxis = 'value' //this is coming from your data 
        yAxisTitle='Count'
        template='t2'  //template can be "t1" or "t2"
        chartTitle='Number of drivers and Vehicles vs Areas'
        valuesColor="black"
        valuesFontSize={13}
        showTotal={true}
        />
        )}
        </div>
    </div>
    </div>
  );
}

export default FleetOver;
