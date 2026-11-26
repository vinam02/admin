import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaEye } from 'react-icons/fa';    

function StockReport() {                        
  const [stockData, setStockData] = useState([]);    
  const [searchTerm, setSearchTerm] = useState('');                                

  const fetchStock = async () => {           
    try {
      const res = await axios.get('http://localhost:5000/api/items/stock-report');               
      setStockData(res.data);
    } catch (error) {                               
      console.log("Error fetching stock:", error);       
    }      
  };                       

  useEffect(() => {            
    fetchStock();
  }, []);

  const filteredStock = stockData.filter((item) => {
    if (!searchTerm) return true;
    return (                            
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||                          
      (item.itemCode && item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()))        
    );
  });

  return (                        
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Stock Report</h2>
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search Item..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-responsive bg-white rounded shadow-sm">
        <table className="table table-bordered table-hover text-center mb-0">
          <thead className="table-dark">
            <tr>
              {/* 👇 sirf 4 data columns + 1 action */}
              <th>Item Code</th>
              <th>Item Name</th>
              <th>UOM</th>
              <th className="text-success">Current Stock</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStock.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-4 text-muted">
                  Koi item nahi mila.
                </td>
              </tr>
            ) : (
              filteredStock.map((item) => (
                <tr key={item._id}>
                  <td>{item.itemCode}</td>
                  <td>{item.itemName}</td>
                  <td>{item.uom}</td>
                  <td className="fw-bold fs-5 text-success">{item.currentStock}</td>
                  <td>
                    {/* 👇 EYE ICON → detail page */}
                    <Link
                      to={`/dashboard/stock/${item._id}`}
                      className="btn btn-sm btn-outline-primary"
                      title="View Stock History"
                    >
                      <FaEye />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StockReport;   