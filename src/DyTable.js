import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './DyTable.css';


const DyTable = ({ rows, columns,colors, pagesSize,chartMaxWidth,showSearch,tableTemplate}) => {

  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [searchTerms, setSearchTerms] = useState([{ value: '', condition: 'OR' }]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pagesSize); // Default page size
  const [expandedRow, setExpandedRow] = useState(null);
  const tableRef = useRef(null);
  const pageSizeOptions = [5, 10, 25, 50, 100, 'All'];

  const getSortIndicator = (columnName) => {
    if (!sortConfig || sortConfig.key !== columnName) {
      return ' ↕'; // Use &harr; in HTML
    }
    return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'; // Use &uarr; for '↑' and &darr; for '↓' in HTML
  };
  

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      if (!sortConfig.key) return 0;
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
  }, [rows, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleSearchChange = (index, value) => {
    const newSearchTerms = [...searchTerms];
    newSearchTerms[index].value = value;
    setSearchTerms(newSearchTerms);
  };

  const handleConditionChange = (index, condition) => {
    const newSearchTerms = [...searchTerms];
    newSearchTerms[index].condition = condition;
    setSearchTerms(newSearchTerms);
  };

  const handleRowClick = (rowId) => {
    setExpandedRow(expandedRow === rowId ? null : rowId);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tableRef.current && !tableRef.current.contains(event.target)) {
        setExpandedRow(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [tableRef]);


  const filteredRows = useMemo(() => {
    return sortedRows.filter(row => {
      const rowString = Object.values(row).join(' ').toLowerCase();
      return searchTerms.reduce((acc, term, index) => {
        const match = term.value ? rowString.includes(term.value.toLowerCase()) : true;
        if (index === 0) return match;
        return term.condition === 'AND' ? acc && match : acc || match;
      }, false);
    });
  }, [sortedRows, searchTerms]);
  const resetSearch = () => {
    setSearchTerms([{ value: '', condition: 'OR' }]);
  };
  
  const totalPages = pageSize === 'All' ? 1 : Math.ceil(filteredRows.length / pageSize);
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = pageSize === 'All' ? filteredRows.length : start + pageSize;
    return filteredRows.slice(start, end);
  }, [filteredRows, currentPage, pageSize]);
const changePage = (newPage) => {
  if (newPage >= 1 && newPage <= totalPages) {
    setCurrentPage(newPage);
  }
};
const exportToXLSX = () => {
  // Create a new workbook and add a new sheet to it
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(filteredRows);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
  // Trigger the download
  XLSX.writeFile(workbook, 'DyTable.xlsx');
};

return (
  <div className='maintablea' style={{width:"100%",backgroundColor: tableTemplate==="t1"?'white':"#070606",padding: "20px"}}>
   {showSearch && <div className="search-section">
      {searchTerms.map((term, index) => (
        <div key={index}>
          {index > 0 && (
            <select
              value={term.condition}
              onChange={(e) => handleConditionChange(index, e.target.value)}
            >
              <option value="AND">AND</option>
              <option value="OR">OR</option>
            </select>
          )}
          <input
            type="text"
            placeholder='Search'
            value={term.value}
            onChange={(e) => handleSearchChange(index, e.target.value)}
          />
        </div>
      ))}
    
    <button 
  onClick={() => setSearchTerms([...searchTerms, { value: '', condition: 'OR' }])}
  style={{
    backgroundColor: tableTemplate==="t1"?'#4c60af':tableTemplate==="t1"?"#D8DD2B":tableTemplate==="t3"?"#C3F4AB":'#D8DD2B',
    color:tableTemplate==="t1"?'white':"black",
    padding: '10px 15px',
      border: tableTemplate==="t1"?'none':"1px solid black",
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  }}>
  +
</button>

<button 
  onClick={resetSearch}
  style={{
    backgroundColor: tableTemplate==="t1"?'#4c60af':tableTemplate==="t1"?"#D8DD2B":tableTemplate==="t3"?"#C3F4AB":'#D8DD2B',
    color:tableTemplate==="t1"?'white':"black",
    padding: '10px 15px',
    border: tableTemplate==="t1"?'none':"1px solid black",
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  }}>
  Reset
</button>

<button 
  className="export-button" 
  onClick={exportToXLSX}
  style={{
    backgroundColor: tableTemplate==="t1"?'#4c60af':tableTemplate==="t1"?"#D8DD2B":tableTemplate==="t3"?"#C3F4AB":'#D8DD2B',
    color:tableTemplate==="t1"?'white':"black",
    padding: '10px 15px',
    border: tableTemplate==="t1"?'none':"1px solid black",
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  }}>
  Export to XLSX
</button>

    </div>}
    <div ref={tableRef} className="dy-table-container" style={{border:"none"}}>
    <table className="dy-table" style={{backgroundColor: tableTemplate==="t1"?"#000000":tableTemplate==="t2"?"#1F1F1F":tableTemplate==="t3"?"#A7ACD9":"#000000",color: tableTemplate==="t1"?"#FFFFFF":tableTemplate==="t2"?"#D8DD2B":tableTemplate==="t3"?"#000000":"#FFFFFF"}}>
      <thead >
        <tr>
          {columns.map((column) => (
            <th
              key={column.field}
              style={{ width: column.width }}
              onClick={() => requestSort(column.field)}
              className={`sortable-header ${sortConfig.key === column.field ? sortConfig.direction : ''}`}
            >
              {column.headerName}
              <span className="sort-indicator">{getSortIndicator(column.field)}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {paginatedRows.map((row, rowIndex) => (
          <>
            <tr key={rowIndex} onClick={() => handleRowClick(row.id)} className={`table-row ${expandedRow === row.id ? 'expanded' : ''}`} style={{ cursor: 'pointer' }}>
          {columns.map((column) => (
            <td 
              key={column.field}
              style={{
                fontWeight: 400,
                color: tableTemplate==="t1"?'black':"white",
            
                backgroundColor: tableTemplate==="t1"?'white':"#1F1F1F",
               
              fontSize:"18px",
              }}
            >
              {row[column.field]}
            </td>
          ))}
   <td className='tag-cell' style={{
    backgroundColor: colors[row.tag] || (tableTemplate === "t1" ? "#FFFFFF" : "#1F1F1F"),
    textAlign: 'center',
    color: "black",
    width:"90px",
   
}}>
    {row.tag}
</td>


              </tr>
        {expandedRow === row.id && (
                <tr className="expandable-contentpowsa" style={{backgroundColor: tableTemplate==="t1"?"#FFFFFF":tableTemplate==="t2"?"#1F1F1F":tableTemplate==="t3"?"#1F1F1F":"#FFFFFF",color: tableTemplate==="t1"?"black":tableTemplate==="t2"?"#FFFFFF":tableTemplate==="t3"?"#FFFFFF":"black"}}>
                  <td colSpan={columns.length + 1}> {/* +1 for the tag cell */}
                    {Object.entries(row.value).map(([key, value]) => (
                      <div key={key} className="content-detailporxs" style={{padding: "10px"}}>
                      <span style={{color:tableTemplate==="t1"?"#4C60AF":"#D8DD2B",fontWeight: "bolder",fontSize:"18px"}}>{`${key} :   `}</span>{value}
                  </div>
                  
                    ))}
                  </td>
                </tr>
              )}
            </>
              
        ))}
      </tbody>
    </table>
    </div>
    <div 
  className="pagination"
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '10px',
    fontFamily: "'Roboto', sans-serif",
    backgroundColor: tableTemplate==="t1"?'white':"#1F1F1F",
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    borderTopLeftRadius: '0px',
    borderTopRightRadius: '0px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
    color: tableTemplate==="t1"?'black':"white",
  }}>
   <div 
  className="paginationchild" 
  style={{
    width: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    fontSize: '16px'
  }}>
      <button onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1}>&lt;</button>
      <span>Page {currentPage} of {totalPages}</span>
      <button onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages}>&gt;</button>
      <select value={pageSize} onChange={(e) => setPageSize(e.target.value === 'All' ? 'All' : Number(e.target.value))}>
        {pageSizeOptions.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      </div>
    </div>
  </div>
);

};

export default DyTable;
