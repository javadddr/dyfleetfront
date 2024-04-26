import React, { useRef, useEffect,useState } from 'react';
import * as d3 from 'd3';

import "./DyPie.css"

const DyPie = ({ 
  data,
  colors,
  chartWidth=930,
  chartHeight=700,
  chartPadding,
  donutRatio=50,
  showTotal=true,
  legendPosition,
  title='Your Title Here',
  padding={top:40,left:10,right:110,bottom:10},
  legendPos,
  showSmall=3,
  strokeWidth,
  totalSize=25,
  chartTemplate="t1",
  totalFormat="number",
 }) => {
  const svgRef = useRef();


const [chartData, setChartData] = useState(data.map(item => ({ ...item, selected: false })));
  const [clickedLabel, setClickedLabel] = useState(null);
 


  useEffect(() => {
    const svg = d3.select(svgRef.current)
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .style('border', '1px solid #a7faef') // Add border
      .style('border-radius', '10px')
      .style('background-color', chartTemplate==="t1"?"white":chartTemplate==="t2"?"rgb(31, 31, 31)":"white"); // Set background color;   // Add border radius
    svg.selectAll('*').remove();
 
    
    const radius = Math.min(chartWidth, chartHeight) / 2 - chartPadding;
    const innerRadius = radius * (donutRatio / 100);
    const pie = d3.pie().value(d => d.value);
    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius);

    const sum = chartData.reduce((total, item) => total + item.value, 0);
    const newFilteredData = chartData.filter(item => !item.selected);

  const arcs = pie(newFilteredData);
   
    const colorScale = d3.scaleOrdinal().domain(data.map(d => d.label)).range(colors);
    svg.append('text')
      .attr('x', chartWidth / 2)
      .attr('y', padding.top)
      .attr('text-anchor', 'middle')
      .style('font-size', '15px')
      .style('font-weight', 'bold')
      .style('font-family', 'inter')
      .style('fill', chartTemplate==="t1"?"black":chartTemplate==="t2"?'#D8DD2B':"black")
      .text(title);


      const chartOffsetY = padding.top + 60; // Increase if more space needed for title
      const g = svg.append('g')
        .attr('transform', `translate(${(chartWidth / 2)-60},${chartOffsetY + radius})`);
  

    if (donutRatio > 49 && showTotal) {
      const totalText = g.append('text')
        .attr('class', 'total-label')
        .attr('text-anchor', 'middle')
        .style('font-size', totalSize)
        .style('font-weight', 'bold')
        .style('font-family', 'inter');

      totalText.append('tspan')
        .attr('dy', '-0.2em')
        .style('font-family', 'inter')
        .style('fill', chartTemplate==="t1"?"black":chartTemplate==="t2"?'white':"black")
        .text('Total:');

      totalText.append('tspan')
        .attr('dy', '1.2em')
        .attr('x', 0)
        .style('font-family', 'inter')
        .style('fill', chartTemplate==="t1"?"black":chartTemplate==="t2"?'white':"black")
        .text(sum);
    }

    const tooltip = d3.select('body')
      .append('div')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'rgba(255, 255, 255, 1)')
      .style('color', 'black')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('border', '1px solid black')
      .style('font-size', '16px')
      .style('box-shadow', '0px 2px 5px rgba(0, 0, 0, 0.5)');

       g.selectAll('path')
      .data(arcs)
      .enter()
      .append('path')
      .attr('fill', d => colorScale(d.data.label))
      .attr('stroke', 'black')
      .attr('stroke-width', strokeWidth)
      .attr('d', d => arc({ ...d, endAngle: d.startAngle }))
      .transition()
      .duration(1000)
      .attrTween('d', function(d) {
        const interpolate = d3.interpolate(d.startAngle, d.endAngle);
        return function(t) {
          return arc({ ...d, endAngle: interpolate(t) });
        };
      });
      g.selectAll('path')
      .on('mouseover', (event, d) => {
        g.selectAll('path')
          .filter(slice => slice !== d)
          .style('opacity', 0.3);

        d3.select(event.currentTarget)
          .style('box-shadow', 'box-shadow: 12px 12px 2px 12px rgba(0, 0, 255, .9)');

        tooltip.html(`
          <div style="display: flex; flex-direction: column; align-items: start;font-family: inter;">
            <div style="display: flex; align-items: center;">
              <div style="width: 12px; height: 12px; background-color: ${colorScale(d.data.label)}; margin-right: 4px;"></div>
              <span>${d.data.label}</span>
            </div>
            <div>
              <span>${d.data.value}</span>
              <span style="margin-left: 4px;">(${((d.data.value / sum) * 100).toFixed(1)}%)</span>
            </div>
          </div>
        `);

        return tooltip.style('visibility', 'visible');
      })
      .on('mousemove', event => {
        return tooltip.style('top', (event.pageY - 10) + 'px').style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', (event, d) => {
        g.selectAll('path')
          .style('opacity', 1);

        d3.select(event.currentTarget)
          .style('box-shadow', 'none');

        tooltip.style('visibility', 'hidden');
      });

       // Calculate legend position based on the layout
       let legendX, legendY;
       const legendWidth = 100; // Adjust this value as needed
       
       // Since you only want the right position, you can directly assign values
       legendX = chartWidth - legendWidth - padding.right;
       legendY = chartOffsetY; // Aligns top of legend with top of the chart
       

// Continue with the legend creation...


          const legend = svg.append('g')
            .attr('class', 'legend-container') // Apply the CSS class
            .attr('transform', `translate(${legendX+30}, ${legendY})`)
            .style('display', legendPosition === 'bottom' ? 'flex' : 'initial')
            .style('flex-direction', legendPosition === 'bottom' ? 'row' : 'column'); // Apply flex layout when legend is at the bottom

          const legendItems = legend.selectAll('.legend-item')
            .data(chartData)
            .enter()
            .append('g')
            .attr('class', 'legend-item')
            .style('margin-right', legendPosition === 'bottom' ? '20px' : '0') // Add margin for spacing between items in row layout
            .attr('transform', (d, i) => `translate(0, ${i * 20})`) 
            .on('click', (event, d) => handleLegendClick(d.label));

          legendItems.append('rect')
            .attr('x', 0)
            .attr('y', -30)
            .attr('width', 15)
            .attr('height', 20)
            .attr('fill', d => (d.selected || d.label === clickedLabel) ? 'gray' : colorScale(d.label));

          legendItems.append('text')
            .attr('x', 30)
            .attr('y', -20)
            .attr('dy', '0.35em')
            .style('font-family', 'inter')
            .style('font-size', '13px')
            .style('cursor', 'pointer')
            .style('fill', chartTemplate==="t1"?"black":chartTemplate==="t2"?'white':"black")
            .text(d => d.label);

                


          const handleLegendClick = (clickedLabel) => {
            const newData = chartData.map(d => ({
              ...d,
              selected: d.label === clickedLabel ? !d.selected : d.selected
            }));
            setChartData(newData);
      };
     



      const generateLabels = () => {
        const labelsGroup = g.append('g')
          .attr('class', 'labels-group')
          .attr('transform', `translate(0, 0) rotate(-89)`);
      
        labelsGroup.selectAll('.slice-label')
          .data(arcs)
          .enter()
          .append('text')
          .attr('class', 'slice-label')
          .attr('transform', d => {
            const angle = (d.startAngle + d.endAngle) / 2;
            const rotation = 90;
            const labelRadius = radius * (0.65 + (donutRatio) / 320);
            const xOffset = labelRadius * Math.cos(angle);
            const yOffset = labelRadius * Math.sin(angle);
            return `translate(${xOffset},${yOffset}) rotate(${rotation})`;
          })
          .attr('dy', '0.55em')
          .style('text-anchor', 'middle')
          .style('font-size', '13px')
          .style('font-family', 'inter')
          .text(d => {
            const valuePercentage = ((d.data.value / sum) * 100).toFixed(1);
            return valuePercentage < showSmall ? '' : totalFormat==="number" ?d.data.value:totalFormat==="percentage"?`${valuePercentage} %`:d.data.value;
          })
          // Attach the same event handlers as the slices
          .on('mouseover', (event, d) => {
            // Same logic as in the slices' mouseover event
            g.selectAll('path')
              .style('opacity', slice => slice === d ? 1 : 0.3);
            d3.select(event.currentTarget.parentNode.querySelector('path'))
              .style('box-shadow', 'box-shadow: 12px 12px 2px 12px rgba(0, 0, 255, .2)');
              tooltip.html(`
              <div style="display: flex; flex-direction: column; align-items: start;font-family: inter;">
                <div style="display: flex; align-items: center;">
                  <div style="width: 12px; height: 12px; background-color: ${colorScale(d.data.label)}; margin-right: 4px;"></div>
                  <span>${d.data.label}</span>
                </div>
                <div>
                  <span>${d.data.value}</span>
                  <span style="margin-left: 4px;">(${((d.data.value / sum) * 100).toFixed(1)}%)</span>
                </div>
              </div>
            `);
            return tooltip.style('visibility', 'visible');
          })
          .on('mousemove', event => {
            return tooltip.style('top', (event.pageY - 10) + 'px').style('left', (event.pageX + 10) + 'px');
          })
          .on('mouseout', () => {
            // Reset opacity for all slices
            g.selectAll('path').style('opacity', 1);
            tooltip.style('visibility', 'hidden');
          });
      };

    generateLabels();

  }, [data,padding.top, colors, chartWidth, chartHeight, chartPadding, donutRatio, showTotal, legendPosition,chartData,clickedLabel,padding.right,title,legendPos,showSmall,strokeWidth,chartTemplate,totalFormat,totalSize]);

  return (
    <svg ref={svgRef} >
    {/* Include your SVG content (e.g., chart, legend, etc.) here */}
  </svg>
  );
};

export default DyPie;

