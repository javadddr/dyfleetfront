import React from 'react';
import './Loading.css'; // Make sure to import the CSS file

const Loading = () => {
  return (
    <div className="loading-wrapper">
      <div className="loading-animation"></div>
      <p>Loading</p>
    </div>
  );
};

export default Loading;
