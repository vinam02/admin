import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function StockDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [ledger, setLedger] = useState([]);              
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        const res = await axios.get(`${API}/api/items/${id}/stock-ledger`);             
        setItem(res.data.item);                                                    
        setLedger(res.data.ledger);
      } catch (err) {
        console.log("Error fetching ledger:", err);  
      } finally {
        setLoading(false);
      }
    }; 
    fetchLedger();
  }, [id]);

  if (loading) return <h4 className="text-center mt-5">Loading...</h4>;

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">   
        <div>
          <h2 className="mb-0">
            {item?.itemName}{' '}
            <span className="text-muted fs-6">({item?.itemCode})</span>
          </h2>
          <small className="text-muted">
            UOM: {item?.uom} | Current Stock:{' '}
            <strong>{item?.currentStock}</strong>
          </small>
        </div>
        <Link to="/dashboard/stock-report" className="btn btn-secondary">
          ← Back
        </Link>
      </div>

      {/* Ledger Table */}
      <div className="table-responsive bg-white rounded shadow-sm">
        <table className="table table-bordered table-hover text-center mb-0">
          <thead className="table-dark">
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Party Name</th>
              <th>Bill No</th>
              <th>Qty</th>
              <th>Current Stock</th>
            </tr>
          </thead>
          <tbody>
            {ledger.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-4 text-muted">
                  Is item ki koi purchase/sale entry nahi mili.
                </td>
              </tr>
            ) : (
              ledger.map((row, i) => (
                <tr key={i}>
                  <td>{new Date(row.date).toLocaleDateString('en-GB')}</td>
                  <td
                    className={
                      row.type === 'Purchase'
                        ? 'text-success fw-bold'
                        : 'text-danger fw-bold'
                    }
                  >
                    {row.type}  
                  </td>
                  <td>{row.partyName}</td>   
                  <td>{row.billNo}</td>
                  <td>{row.qty}</td>
                  <td className="fw-bold">{row.currentStock}</td>
                </tr> 
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StockDetail;          