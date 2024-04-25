import React, { useState,useEffect,useCallback } from 'react';
import GeneralDriver from './components/GeneralDriver';
import DriversOfDriver from './components/DriversOfDriver';
import nopic from "./nopic.png"
import { useDrivers } from './DriversContext'; // Import useDrivers hook
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImage'; // You'll create this utility function
import { useDropzone } from 'react-dropzone';
import InvoicesDriver from './components/InvoicesDriver';
import TaskDriver from './components/TaskDriver';
import EquipmentDriver from './components/EquipmentDriver';
import "./CarDetails.css"
import "./DriverDetails.css"
const DriverDetails = ({ driver: initialDriver, onClose }) => {
  const [activeTab, setActiveTab] = useState('GENERAL');
  const [driver, setDriver] = useState(initialDriver);
  const { refreshDrivers } = useDrivers();
  const token = localStorage.getItem('userToken');
  const stateColors = {
    Active: '#4CAF50',
    Inactive: '#9E9E9E',
    Sick: '#2196F3',
    Holiday: '#FF9800',
    'Over Hours': '#FFEB3B',
    'Work Accident': '#F44336',
   
  };
// State for managing modal visibility
const [isModalVisible, setIsModalVisible] = useState(false);
// States for image upload and cropping
const [imageSrc, setImageSrc] = useState(null);
const [crop, setCrop] = useState({ x: 0, y: 0 });
const [zoom, setZoom] = useState(1);
const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const handleDriverUpdate = (updatedDriver) => {
    setDriver(updatedDriver);
  };
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.addEventListener('load', () => setImageSrc(reader.result));
    reader.readAsDataURL(file);
  }, []);
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});

  const handleCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
    refreshDrivers()
  };


  useEffect(() => {
    setDriver(initialDriver); 
  }, [initialDriver]);

    const renderContent = () => {
        switch (activeTab) {
            case 'GENERAL':
                return <GeneralDriver driver={driver} onClose={onClose} onDeleted={onClose} onDriverUpdate={handleDriverUpdate} />;
            case 'CARS':
                return <DriversOfDriver driver={driver} onDriverUpdate={handleDriverUpdate} />;
            case 'INVOICES':
              return <InvoicesDriver driver={driver} onDriverUpdate={handleDriverUpdate} />;                
            case 'TASKS_AND_NOTES':
                return <TaskDriver driver={driver} onDriverUpdate={handleDriverUpdate} />;
            case 'EQUIPMENT':
                return <EquipmentDriver driver={driver} onDriverUpdate={handleDriverUpdate}/>;
            default:
                return <GeneralDriver driver={driver} />;
        }
    };
   
    const handleCrop = async () => {
      try {
          const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
          const croppedFile = new File([croppedBlob], `croppedImage_${Date.now()}.jpg`, { type: "image/jpeg" });
    
          const formData = new FormData();
          formData.append('picture', croppedFile);
    
          const updateDriverEndpoint = `${process.env.REACT_APP_BACKEND_URL}/drivers/${driver._id}`;
          console.log("Sending fetch request to update driver...");
          const response = await fetch(updateDriverEndpoint, {
              method: 'PATCH',
              body: formData,
              headers: {
                  'Authorization': `Bearer ${token}`,
              },
          });
    
          if (!response.ok) {
              throw new Error('Something went wrong with the image upload');
          }
    
          const updatedDriver = await response.json();
          // Append a timestamp to the image URL to force refresh and bypass cache
          if (updatedDriver.picture) {
            updatedDriver.picture += `?t=${new Date().getTime()}`;
          }
       
          setDriver(updatedDriver);
          setIsModalVisible(false);
          refreshDrivers()
          console.log("Fetch request sent. Response status: ", response.status);
      } catch (error) {
          console.error("Error updating driver picture:", error);
      }
    };
    
  
    return (
      <div className="car-details-modal">
         <div className="modal-header">

          
          <div className='cargenstatusd'>
       <div className='dd-picture-container' onClick={() => setIsModalVisible(true)}>
    {driver.picture ? (
        <img src={`${process.env.REACT_APP_BACKEND_URL}/uploads/${driver.picture}`} alt={`${driver.firstName} ${driver.lastName}`} className="dd-driver-img"/>
    ) : <img src={nopic} alt='No picture available' className="dd-driver-img dd-no-pic"/>
    }
</div>

{isModalVisible && (
    <div className="dd-modal-overlay">
        <div className="dd-modal-content">
          <h3>Change Profile Picture</h3>
            <div {...getRootProps()} className="dd-dropzone">
                <input {...getInputProps()} />
                {isDragActive ? <p>Drop the files here ...</p> : <p>Drag and drop the profile picture here</p>}
            </div>
            {imageSrc && (
                <div className="dd-crop-container">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onCropComplete={handleCropComplete}
                        onZoomChange={setZoom}
                    />
                          <button type="button" className="dd-crop-button" onClick={handleCrop}>Crop Image</button>
                </div>
                
            )}
      
            <button onClick={() => setIsModalVisible(false)}>Close</button>
        </div>
    </div>
)}


            <div className='statusnamenearpic'>
              <div>
            <h2 className='statusfinali1d'>{driver.firstName} - {driver.lastName}</h2>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{
                display: 'inline-block',
                width: '15px',
                height: '15px',
                fontWeight: 300,
                backgroundColor: stateColors[driver.status] || '#000000',
                marginRight: '8px', // Adds some space between the square and the text
              }}></span>
              <h2 className='statusfinali' style={{ color: stateColors[driver.status] || '#000000', display: 'inline' }}>{driver.status}</h2>
            </div>
            </div>
            </div>
          </div>







          
          <button onClick={onClose}>Close</button>
        </div>


          <div className="modal-tabs">
          <button className={`tab-button ${activeTab === 'GENERAL' ? 'button-active' : ''}`} onClick={() => setActiveTab('GENERAL')}>General</button>
          <button className={`tab-button ${activeTab === 'CARS' ? 'button-active' : ''}`} onClick={() => setActiveTab('CARS')}>Cars and Status</button>

          <button className={`tab-button ${activeTab === 'INVOICES' ? 'button-active' : ''}`} onClick={() => setActiveTab('INVOICES')}>Invoices</button>
          <button className={`tab-button ${activeTab === 'TASKS_AND_NOTES' ? 'button-active' : ''}`} onClick={() => setActiveTab('TASKS_AND_NOTES')}>Tasks and Notes</button>
          <button className={`tab-button ${activeTab === 'EQUIPMENT' ? 'button-active' : ''}`} onClick={() => setActiveTab('EQUIPMENT')}>Equipments</button>
          </div>
          <div className="modal-content2x">
              {renderContent()}
          </div>
      </div>
  );
};
export default DriverDetails;
