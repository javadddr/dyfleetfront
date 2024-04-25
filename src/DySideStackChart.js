// DySideStackChart.js
import React, { useState, useEffect,useRef } from 'react';
import "./DySideStackChart.css"



const DySideStackChart = ({ data,valuesColor, colors,grid,showLegend=false, chartWidth, chartHeight,gridNumber,valueDisplayPosition = 'middle', chartTitle = 'chart title',chartMargin,xAxis='group',yAxis='value',template='t1' }) => {
  const chartContainerRef = useRef(null);

  const Legend = ({ colors, labels }) => {
    const legendStyle = {
      position: 'absolute',
      top: 0,
      right: 0,
      padding: '10px',
      backgroundColor: template==="t1"?"white":template==="t2"?"rgb(47, 47, 47)":"white",
      color:template==="t1"?"black":template==="t2"?"white":"black",
      border: '1px solid #ddd',
      borderRadius: '5px',
      marginLeft: '170px',
      width: '100px',
      maxHeight: '400px', // Adjust this value as needed
      overflowY: 'auto',
      fontSize:"18px",
    };
  
    const labelStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: "flex-start",
      marginBottom: '5px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    };
  
    const colorBoxStyle = {
      width: '20px',
      height: '20px',
      marginRight: '10px'
    };
  
    return (
      <div className='legendsstyio' style={legendStyle}>
        {labels.map((label, index) => (
          <div key={label} style={labelStyle}>
            <div style={{ ...colorBoxStyle, backgroundColor: colors[index % colors.length] }}></div>
            <div className='salam' style={{fontFamily:"'inter','Segoe UI', Tahoma, Geneva, Verdana, sans-serif",fontSize:"17px"}}>{label}</div>
          </div>
        ))}
      </div>
    );
  };
const maxValue = Math.max(...data.flatMap(group => Object.values(group.value)))+(Math.max(...data.flatMap(group => Object.values(group.value)))/gridNumber);
const maxAttributes = Math.max(...data.map(group => Object.keys(group.value).length));
const gridInterval = maxValue / gridNumber;
const [windowWidth, setWindowWidth] = useState(window.innerWidth);
const adjustedChartWidth = (windowWidth < chartWidth) ? windowWidth : chartWidth;
const adjustedChartHeight = (windowWidth < chartWidth) ? (chartHeight * (windowWidth / chartWidth)) : chartHeight;
const uniqueKeys =Array.from(new Set(data.flatMap(group => Object.keys(group.value))));

useEffect(() => {
  const handleResize = () => setWindowWidth(window.innerWidth);
  window.addEventListener('resize', handleResize);

  return () => window.removeEventListener('resize', handleResize);
}, []);

  // Adjust the chart area considering the padding
  const adjustedWidth = adjustedChartWidth 
  const adjustedHeight = adjustedChartHeight
  
  
  const maxBarsPerGroup = Math.max(...data.map(group => Object.keys(group.value).length));
  const totalBars = data.length * maxBarsPerGroup;
  const barWidth = adjustedWidth / totalBars;
  const labelWidth = barWidth * maxBarsPerGroup;  // Calculate the width of each label


const marginWidth = 0; // Adjust this margin as needed
const charttistafoWidth = (barWidth * totalBars) + (marginWidth * (data.length - 1));
const allAttributes = Array.from(new Set(data.flatMap(group => Object.keys(group.value))));

const [hoveredGroup, setHoveredGroup] = useState(null);
const [tooltip, setTooltip] = useState({ visible: false, content: "", x: 0, y: 0 });
const [isInitialLoad, setIsInitialLoad] = useState(true);
const [showValues, setShowValues] = useState(false);


useEffect(() => {
  if (isInitialLoad) {
    setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
  }
}, [isInitialLoad]);
useEffect(() => {
  const timer = setTimeout(() => {
      setShowValues(true);
  }, 1000); // 1s matches the animation duration

  // Clean up the timer on unmount
  return () => {
      clearTimeout(timer);
  };
}, []);



// Calculate the center position of each group
const groupCenterPositions = data.map((group, idx) => {
  const totalGroupWidth = barWidth * maxBarsPerGroup;
  const startPosition = idx * totalGroupWidth + idx * marginWidth;
  return startPosition + totalGroupWidth / 2;
});
  return (

    <div className='charttistafomainfor' ref={chartContainerRef} style={{ width: adjustedWidth+(barWidth*maxAttributes), height: adjustedHeight+50, padding: `${0}px ${10}px ${100}px ${90}px`,margin: `${chartMargin.top}px ${chartMargin.right}px ${chartMargin.bottom}px ${chartMargin.left}px`, position: 'relative' ,backgroundColor: template==='t1'?'#FFFFFF':template==='t2'?'#1F1F1F':'#0e0101',border:'1px solid black'}}>
       
       {showLegend &&<div className='legend-sidesc'>
         <Legend colors={colors} labels={uniqueKeys} />
         </div>}
         <div className='charttistafo' style={{ display: 'flex', flexDirection: 'row', height: adjustedHeight, width: `${charttistafoWidth}px` }}>
  {data.map((group, idx) => (
    <div className='groups' key={idx} style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        alignItems: 'flex-end', 
        marginRight: idx < data.length - 1 ? `${marginWidth}px` : '0' ,
        opacity: hoveredGroup === null || hoveredGroup === idx ? 1 : 0.3,
        backgroundColor: hoveredGroup === idx ? '#efefef' : 'transparent',
    
        zIndex:11,  // Set background color based on hovered group  // Set opacity based on hovered group
    }}
    onMouseEnter={(e) => {
      const content = [
          group.label,
          ...allAttributes.map(attr => ({
              color: colors[allAttributes.indexOf(attr)],
              label: attr,
              value: group.value[attr] || 0
          }))
      ];
      setTooltip({ 
          visible: true, 
          content, 
          x: e.clientX, 
          y: e.clientY 
      });
      setHoveredGroup(idx);
  }}
  onMouseLeave={() => {
      setTooltip({ visible: false, content: "", x: 0, y: 0 });
      setHoveredGroup(null);
  }}
  onMouseMove={(e) => {
    if (chartContainerRef.current) {
      const chartRect = chartContainerRef.current.getBoundingClientRect();
      setTooltip(prevTooltip => ({
        ...prevTooltip,
        x: e.clientX - chartRect.left,
        y: e.clientY - chartRect.top
      }));
    }
  }}
  

  
    >
        {/* X-axis tick for the group */}
        <div 
            style={{
                position: 'absolute',
                top: 100 + adjustedHeight,
                left:((barWidth * maxAttributes + marginWidth) * idx)+90, // Position it before the first bar of the group
                width: 1, 
                height: 15, // Length of the tick mark
                backgroundColor:  template==='t1'?'#0e0101':template==='t2'?'#D8DD2B':'#0e0101',
                
            }}
        ></div>

{allAttributes.map((attr, valueIdx) => {
    const value = group.value[attr] || 0;
    const barHeight = isInitialLoad ? 0 : (value / maxValue) * adjustedHeight;


    let valuePosition;
    switch (valueDisplayPosition) {
      case 'top':
        valuePosition = { bottom: barHeight + 5 }; // 5 pixels above the bar
        break;
      case 'bottom':
        valuePosition = { bottom: 3 }; // 3 pixels above the x-axis
        break;
      default: // middle
        valuePosition = { 
          bottom: barHeight / 2, 
          transform: 'translateX(-50%) translateY(50%)', // center the value
          left: '50%', // ensure the starting position is in the middle
          textAlign: 'center' // ensure text is centered
        };
        break;
    }
    

    return (
      <div className={`bar animateBar-sidefo`} key={valueIdx} style={{
        backgroundColor: colors[valueIdx],
        width: barWidth,
        height: barHeight,
        position: 'relative',
        fontFamily:"'inter','Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
       
    }}>
    
            {value !== 0 && showValues && <div style={{ 
    position: 'absolute', 
    left: '50%', 
    transform: 'translateX(-50%)', 
    ...valuePosition, // applying the calculated position
  
    fontSize:"14px",
    color:valuesColor
}}>
    {value}
</div>}

        </div>
    );
})}

    </div>
  ))}
</div>

      {[...Array(gridNumber)].map((_, index) => {
  const value = (index + 1) * gridInterval;
  const positionFromTop = adjustedHeight - (value / maxValue) * adjustedHeight;
  return (
    <React.Fragment key={index}>
      {/* Render grid line */}
    { grid && <div
        style={{
          position: 'absolute',
          top: 100 + positionFromTop,
          left: 90,
          width: adjustedWidth,
          height: '0.1px',
          backgroundColor: template==='t1'?'lightgray':template==='t2'?'#D8DD2B':'#0e0101',
          zIndex: 10  // This will send the grid line behind the bars
        }}
      ></div>}
      {/* Render y-axis tick for the grid line */}
      <div
        style={{
          position: 'absolute',
          top: 100 + positionFromTop , // Center the tick with respect to grid line
          left: 90 - 6, // Place it a bit to the left of y-axis
          width: 5, // Width of the tick
          height: '0.1px',
          backgroundColor: template==='t1'?'#0e0101':template==='t2'?'#D8DD2B':'#0e0101',
        }}
      ></div>
      {/* Render value for the grid line */}
      <div className='yaxisssvbcf'
        style={{
          position: 'absolute',
          top: 100 + positionFromTop -10, // Adjust this value to better position the label
          left: 90-40,
          color: template==='t1'?'#0e0101':template==='t2'?'white':'#0e0101',
          zIndex: 100,  // This will keep the label above the grid line but below the bars
          fontSize:"17px",
          fontFamily:"'inter','Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}
      >
        {Math.round(value)}
      </div>
    </React.Fragment>
  );
})}
{tooltip.visible && (
    <div 
    style={{
      position: 'absolute',
      top: tooltip.y, 
      left: tooltip.x, 
      backgroundColor: 'white',
      border: '1px solid black',
      padding: '7px',
      zIndex: 20,
      pointerEvents: 'none',
      opacity: 1,
      borderRadius:5,
      fontSize:"17px",
      maxWidth:"320px",
      minWidth:"120px",
      fontFamily:"'inter','Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  }}
    >
        <div style={{fontSize:"17px", fontWeight:"900",marginBottom:"10px"}}>{tooltip.content[0]}</div> {/* Displaying the group label */}
        {tooltip.content.slice(1).map((item, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                <div 
                    style={{ 
                        width: 10, 
                        height: 10, 
                        backgroundColor: item.color, 
                        marginRight: 5 
                    }} 
                ></div>
                <div>{item.label}: {item.value}</div>
            </div>
        ))}
    </div>
)}

      {/* X and Y Axis */}
      
      <div className='rwonow' style={{ position: 'absolute', top: 100, left: 90 - 1, width: 1, height: adjustedHeight, backgroundColor: template==='t1'?'#0e0101':template==='t2'?'#D8DD2B':'#0e0101' }}></div> {/* Y Axis */}
     
     {/* Labels for X Axis */}
     <div className='grouplabelsidecccmain'
      style={{ 
          position: 'absolute', 
          top: 100 + adjustedHeight,
          left: 90, 
          display: 'flex',
          width: adjustedWidth,
          color: template==='t1' ? '#0e0101' : template==='t2' ? 'white' : '#0e0101',
          fontSize: "17px",
          
      }}
  >
{data.map((group, idx) => {
          return (
              <div className='grouplabelsideccc'
                  key={group.label} 
                  style={{ 
                      position: 'absolute',
                      left: `${Math.min(groupCenterPositions[idx] - labelWidth / 2, adjustedWidth )}px`,
                      width: `${labelWidth}px`,
                      textAlign: 'center',
                      borderTop:`1.5px solid ${  template==='t1'?'#0e0101':template==='t2'?'#D8DD2B':'#0e0101'}`,
                      fontFamily:"'inter','Segoe UI', Tahoma, Geneva, Verdana, sans-serif",

                      
                  }}
              >
                  {group.label}
              </div>
        );
    })}
    
</div>
{/* Chart Title */}
<div className='sstitlegd' style={{ 
    position: 'absolute', 
    top: 30,  // adjust as needed
    left: '50%', 
    transform: 'translateX(-50%)', // centers the title
    fontWeight: 'bold',
    fontFamily:"'Roboto','Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color:template==='t1'?'#0e0101':template==='t2'?'#D8DD2B':'#0e0101',
    fontSize:"22px"
}}>
    {chartTitle}
</div>

{/* X-Axis Title */}
<div className='xaxissstitles' style={{ 
    position: 'absolute', 
    bottom: 25, // adjust as needed
    left: '50%', 
    transform: 'translateX(-50%)', // centers the title
    fontWeight: 'bold',
    color:template==='t1'?'#0e0101':template==='t2'?'#D8DD2B':'#0e0101',
    fontSize:"17px",
    fontFamily:"'inter','Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
}}>
    {xAxis}
</div>

{/* Y-Axis Title */}
<div className='yaxisssds' style={{ 
    position: 'absolute', 
    top: '50%', 
    left: '30px',
    transform: 'translateY(50%) rotate(-90deg)', // rotates the title
    transformOrigin: 'left', // rotates around the left side
    fontWeight: 'bold',
    color:template==='t1'?'#0e0101':template==='t2'?'#D8DD2B':'#0e0101',
    fontSize:"17px",
    fontFamily:"'inter','Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
}}>
    {yAxis}
    
</div>


       
    </div>
    
  
  );
};

export default DySideStackChart;
