import React,{useState,useEffect} from 'react';
import RepoUser from './RepoUser';
import { useCars } from './CarsContext';
import * as XLSX from 'xlsx';
import "./Reports.css";
import carsicon from "./dfd.png"
import drivericon from "./drsed.png"
import fineicon from "./fines.png"
import eqo from "./eqo.png"
import stat from "./stat.png"
import carstat from "./carstat.png"
import { useDrivers } from './DriversContext'; // Import useDrivers hook


const fetchStatusRecordsForAllCars = async (setCarStatusData, token) => {
  try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/carStatusRecords/statusByCreator`, {
          headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
          throw new Error('Failed to fetch status records for cars');
      }

      const allStatusRecords = await response.json();
      setCarStatusData(allStatusRecords);
  } catch (error) {
      console.error(error.message);
  }
};
function Reports() {
    const userRoles = localStorage.getItem('userRoles');
    const isAdmin = userRoles === 'admin';
    const { cars,refreshCars } = useCars();
    const [driverEq, setDriverEq] = useState([]);
    const [carStatusData, setCarStatusData] = useState([]);
    const [carEq, setCarEq] = useState([]);
    const [allEq, setAllEq] = useState([]); // Step 1: Define allEq state

    const token = localStorage.getItem('userToken');
    const { drivers,refreshDrivers } = useDrivers();
    useEffect(() => {
      fetchStatusRecordsForAllCars(setCarStatusData, token);
  }, [token]);

  const combinedData = carStatusData.map(statusRecord => {
      const car = cars.find(c => c._id === statusRecord.carId);
      return {
          carName: car?.general.internalName || 'Unknown Car',
          from: statusRecord.from,
          status: statusRecord.status
      };
  });
  const downloadExcelcarstatus = () => {
    if (!combinedData || combinedData.length === 0) {
        alert("No vehicle status data available to download.");
        return;
    }

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(combinedData);

    // Create a new workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vehicle Status Report");

    // Generate buffer
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

    // Convert buffer to Array Buffer
    function s2ab(s) {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }

    // Create Blob and Download
    const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vehicle-status-report.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

  const [driverStatusData, setDriverStatusData] = useState([]);

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
          setDriverStatusData(statusRecords);
      } catch (error) {
          console.error(error.message);
      }
  };

  useEffect(() => {
      fetchStatusRecordsForAllDrivers();
  }, []);
  const combinedData2DRIVER = driverStatusData.map(statusRecord => {
    const driver = drivers.find(d => d._id === statusRecord.driverId);
    return {
        driverName: `${driver?.firstName} ${driver?.lastName}` || 'Unknown Driver',
        from: new Date(statusRecord.from).toLocaleDateString(),
        status: statusRecord.status
    };
});

    const downloadExcel = () => {
        if (!cars || cars.length === 0) {
            alert("No car data available to download.");
            return;
        }

        const formatDate = (date) => {
            return date ? new Date(date).toLocaleDateString() : 'N/A';
        };

        // Define headers explicitly
        const headers = {
            State: "State",
            "Internal Name": "Internal Name",
            "License Plate": "License Plate",
            "Internal ID": "Internal ID",
            "Affiliated Company": "Affiliated Company",
            Location: "Location",
            "Registration Date": "Registration Date",
            "Active In Fleet Since": "Active In Fleet Since",
            "Registration Certificate": "Registration Certificate",
            Model: "Model",
            "Vehicle Type": "Vehicle Type",
            VIN: "VIN",
            "Tare Weight (Kg)": "Tare Weight (Kg)",
            "Registered In": "Registered In",
            "Load Capacity (Kg)": "Load Capacity (Kg)",
            "Tensile Load (Kg)": "Tensile Load (Kg)",
            "Trailer Load (Kg)": "Trailer Load (Kg)",
            "Financing Type": "Financing Type",
            "Internal Unit Name": "Internal Unit Name",
            "Unit Capacity": "Unit Capacity",
            Area: "Area",
        };

        const ws = XLSX.utils.json_to_sheet(cars.map(car => ({
            ...headers,
            State: car.state,
            "Internal Name": car.general?.internalName,
            "License Plate": car.general?.licensePlate,
            "Internal ID": car.general?.internalID,
            "Affiliated Company": car.general?.affiliatedCompany,
            Location: car.general?.location,
            "Registration Date": formatDate(car.general?.registrationDate),
            "Active In Fleet Since": formatDate(car.general?.activeInFleetSinceDate),
            "Registration Certificate": car.general?.registrationCertificate,
            Model: car.general?.model,
            "Vehicle Type": car.general?.vehicleType,
            VIN: car.general?.vin,
            "Tare Weight (Kg)": car.general?.tareWeightKg,
            "Registered In": car.general?.registeredIn,
            "Load Capacity (Kg)": car.general?.loadCapacityKg,
            "Tensile Load (Kg)": car.general?.tensileLoadKg,
            "Trailer Load (Kg)": car.general?.trailerLoadKg,
            "Financing Type": car.general?.financingType,
            "Internal Unit Name": car.general?.internalUnitName,
            "Unit Capacity": car.general?.unitCapacity,
            Area: car.area,
        })), { header: Object.keys(headers) });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Cars Report");

        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
        function s2ab(s) {
            const buf = new ArrayBuffer(s.length);
            const view = new Uint8Array(buf);
            for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        }

        const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cars-report.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
///////////////////////////////
const downloadDriversExcel = () => {
  if (!drivers || drivers.length === 0) {
      alert("No driver data available to download.");
      return;
  }

  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : 'N/A';

  const driverData = drivers.map(driver => ({
      Status: driver.status,
      "First Name": driver.firstName,
      "Last Name": driver.lastName,
      Email: driver.email,
      Address: driver.address,
      Mobile: driver.mobile,
      "Start Date": formatDate(driver.startDate),
      "End Date": formatDate(driver.endDate),
     
      "Picture": driver.picture,
      "Created By": driver.createdBy ? driver.createdBy._id : "N/A",
      // Flatten tasks
      "Task Description": driver.tasks.map(task => task.description).join('; '),
      "Task Due Date": driver.tasks.map(task => formatDate(task.dueDate)).join('; '),
      "Task Status": driver.tasks.map(task => task.taskStatus).join('; '),
      // Flatten notes
      "Notes": driver.notes.map(note => `${note.content} (${formatDate(note.creatingDate)})`).join('; '),
      // Flatten driver license checks
      "License Check Date": driver.driverLicenseCheck.map(item => formatDate(item.date)).join('; '),
      // Flatten driver areas
      "Driver Areas": driver.driverArea.map(area => `${area.area} (${formatDate(area.from)} to ${formatDate(area.to)})`).join('; '),
      // Flatten equipment details
      "Clothing Equipment": driver.equipments.clothing.map(equip => `${equip.item}: ${equip.quantity} pcs`).join('; '),
      "Other Equipment": driver.equipments.other.map(equip => `${equip.item}: ${equip.quantity} pcs`).join('; ')
  }));

  const headers = Object.keys(driverData[0]); // Get all keys as headers from the first object
  const ws = XLSX.utils.json_to_sheet(driverData, { header: headers });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Drivers Report");

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
  const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'drivers-report.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// Helper function to convert a string to an ArrayBuffer
function s2ab(s) {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}
////////////////////////////
const [fines, setFines] = useState([]);
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
    setFines(data);
  
  } catch (error) {
    console.error('Error fetching fines:', error);
  }
};
useEffect(() => {
  refreshDrivers();
}, []);
useEffect(() => {
  refreshCars();
}, []);
useEffect(() => {

  fetchFines();
  
}, []);
const exportToExcelfine = () => {
  const ws = XLSX.utils.json_to_sheet(fines.map(fine => ({
    OccurDate: new Date(fine.occureDate).toLocaleDateString(),
    DueDate: new Date(fine.dueDate).toLocaleDateString(),
    Description: fine.description,
    For: fine.for,
    DriverName: fine.driverName,
    CarName: fine.carName,
    Status: fine.status,
    IssuedFrom: fine.issuedFrom,
    Location: fine.location,
    File: fine.file ? `${process.env.REACT_APP_BACKEND_URL}/${fine.file}` : 'No File'
  })));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Fines Data");
  XLSX.writeFile(wb, "fines.xlsx");
};
/////////////////////////////
useEffect(() => {

  fetchDriverEq();
  fetchCarEq();
  
}, []);
const fetchDriverEq = async () => {
  const token = localStorage.getItem('userToken');
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/driverEquipments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch fines');
    }
    const data = await response.json();
    setDriverEq(data);
  
  } catch (error) {
    console.error('Error fetching fines:', error);
  }
};
const fetchCarEq = async () => {
  const token = localStorage.getItem('userToken');
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/carEquipments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch fines');
    }
    const data = await response.json();
    setCarEq(data);

  } catch (error) {
    console.error('Error fetching fines:', error);
  }
};

useEffect(() => {
  setAllEq([...driverEq, ...carEq]);
}, [driverEq, carEq]);
const exportToExceleq = () => {
  const ws = XLSX.utils.json_to_sheet(allEq.map(eq => ({
    Type: eq.type,
    Description: eq.description,
    Name: eq.name,
    CostPerUnit: eq.costPerUnit,
    Vendor: eq.vendor,
    BuyingUrl: eq.buyingUrl,
  })));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Equipment Data");
  XLSX.writeFile(wb, "equipment_data.xlsx");
};

const downloadExcelSTATUS = () => {
  if (!combinedData2DRIVER || combinedData2DRIVER.length === 0) {
      alert("No driver status data available to download.");
      return;
  }

  // Define headers for the Excel file
  const headers = [
      "Driver Name", "Status Start Date", "Current Status"
  ];

  // Use XLSX.utils.json_to_sheet to convert the data
  const ws = XLSX.utils.json_to_sheet(combinedData2DRIVER.map(data => ({
      "Driver Name": data.driverName,
      "Status Start Date": data.from,
      "Current Status": data.status
  })), { header: headers });

  // Create a new workbook and append the worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Driver Status Report");

  // Generate a buffer from the workbook
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
  function s2ab(s) {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
      return buf;
  }

  // Create a Blob from the buffer
  const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'driver-status-report.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
    if (!isAdmin) {
      return <RepoUser />;
    }

    return (
        <div className="reports-container">
          <div className='repmainti'> <h1>Reports</h1></div>
      <div>
            <div className="image-container">
                <img src={carsicon} alt="Cars Icon" style={{ width: "100%" }} />
                <button onClick={downloadExcel} className="download-btn">Get All the Vehicles</button>
            </div>
            <div className="image-container">
                <img src={drivericon} alt="Driver Icon" style={{ width: "100%" }} />
                <button onClick={downloadDriversExcel} className="download-btn">Get All the Drivers</button>
            </div>
            <div className="image-container">
                <img src={fineicon} alt="Cars Icon" style={{ width: "100%" }} />
                <button onClick={exportToExcelfine} className="download-btn">Get Fines</button>
            </div>
            </div>
            <div>
            <div className="image-container">
                <img src={eqo} alt="Cars Icon" style={{ width: "100%" }} />
                <button onClick={exportToExceleq} className="download-btn">Get Equipments</button>
            </div>
            <div className="image-container">
                <img src={stat} alt="Cars Icon" style={{ width: "100%" }} />
                <button onClick={downloadExcelSTATUS} className="download-btn">Get Driver status</button>
            </div>
            <div className="image-container">
                <img src={carstat} alt="Cars Icon" style={{ width: "100%" }} />
                <button onClick={downloadExcelcarstatus} className="download-btn">Get vehicles status</button>
            </div>
            </div>
        </div>
    );
}

export default Reports;
