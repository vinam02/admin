import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaPlus, FaSearch, FaPrint, FaFileInvoiceDollar } from 'react-icons/fa';

function SalesList() {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // View Invoice Modal
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  const GRAD_PURPLE = "linear-gradient(135deg,#667eea,#764ba2)";

  // Company details (localStorage se)
  const company = (() => {
    try {
      return JSON.parse(localStorage.getItem('company')) || {};
    } catch {
      return {};
    }      
  })();                   

  const fetchSales = async () => {                                   
    try {
      const res = await axios.get('http://localhost:5000/api/sales');
      setSales(res.data);
    } catch (error) {
      console.log('Error:', error);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleViewBill = (sale) => {
    setSelectedBill(sale);
    setShowBillModal(true);
  };

  // Search: party, invoice no, item name/code
  const filteredSales = sales.filter((s) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    const matchesParty = s.partyName.toLowerCase().includes(q);
    const matchesInvoice = s.invoiceNumber && s.invoiceNumber.toLowerCase().includes(q);
    const matchesItem = s.items.some(item =>
      item.itemName.toLowerCase().includes(q) ||
      (item.itemCode && item.itemCode.toLowerCase().includes(q))
    );
    return matchesParty || matchesInvoice || matchesItem;
  });

  return (
    <div className="container-fluid py-4">
      {/* HEADER SECTION (Dashboard Style) */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div style={{
            width: '50px', height: '50px', borderRadius: '14px',
            background: GRAD_PURPLE, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', boxShadow: '0 4px 12px rgba(118,75,162,0.3)'
          }}>
            <FaFileInvoiceDollar />
          </div>
          <h2 className="mb-0 fw-bold" style={{ color: '#2c3e50' }}>Sales List</h2>
        </div>

        <button 
          className="btn text-white d-flex align-items-center gap-2" 
          onClick={() => navigate('/dashboard/sales')}
          style={{ background: GRAD_PURPLE, borderRadius: '8px', padding: '10px 20px', fontWeight: '600', border: 'none' }}
        >
          <FaPlus /> Add Sales
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="mb-4 w-50 position-relative">
        <span className="position-absolute top-50 translate-middle-y ms-3 text-muted">
          <FaSearch />
        </span>
        <input
          type="text"
          className="form-control shadow-sm"
          placeholder="Search by Party Name or Invoice No..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ borderRadius: '10px', paddingLeft: '40px', height: '45px', border: '1px solid #e2e8f0' }}
        />
      </div>

      {/* TABLE SECTION (AllForms / Premium Style) */}
      <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: 16 }}>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 text-center">
            <thead style={{ background: "#f7f7fd" }}>
              <tr className="small text-uppercase" style={{ color: "#6b7280" }}>
                <th className="py-3">Sales Date</th>
                <th className="py-3">Party Name</th>
                <th className="py-3">Total Qty</th>
                <th className="py-3">Invoice No</th>
                <th className="py-3">Grand Total (₹)</th>
                <th className="py-3" style={{ width: 100 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-5 text-muted">Koi sale nahi mili.</td>
                </tr>
              ) : (
                filteredSales.map((s) => {
                  const totalQty = s.items.reduce((sum, item) => sum + Number(item.qty), 0);
                  return (
                    <tr key={s._id}>
                      <td className="text-secondary fw-semibold">{s.date}</td>
                      <td className="fw-bold" style={{ color: '#374151' }}>{s.partyName}</td>
                      <td>
                        <span className="badge bg-light text-dark border px-3 py-2" style={{ borderRadius: '20px' }}>
                          {totalQty}
                        </span>
                      </td>
                      <td className="fw-bold" style={{ color: '#667eea' }}>{s.invoiceNumber || 'N/A'}</td>
                      <td className="fw-bold text-success fs-5">₹ {Number(s.grandTotal).toFixed(2)}</td>
                      <td>
                        <button
                          className="btn btn-sm d-inline-flex align-items-center gap-1"
                          style={{ color: "#764ba2", border: "1px solid #764ba2", borderRadius: '6px' }}
                          onClick={() => handleViewBill(s)}
                          title="View Invoice"
                        >
                          <FaEye /> View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW INVOICE MODAL (Premium Real-life Look) */}
      {showBillModal && selectedBill && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,.6)", zIndex: 1050 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg" style={{ maxWidth: '850px' }}>
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16 }}>
              
              <div className="modal-header text-white d-flex justify-content-between align-items-center" style={{ background: GRAD_PURPLE, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                <h5 className="modal-title mb-0 fw-bold"><FaFileInvoiceDollar className="me-2" /> Sales Invoice</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowBillModal(false)}></button>
              </div>

              <div className="modal-body p-5 bg-white" style={{ borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
                
                {/* Invoice Header */}
                <div className="d-flex justify-content-between mb-5">
                  <div>
                    <h3 className="mb-1 fw-bold" style={{ color: '#2c3e50' }}>{company.companyName || 'Your Company'}</h3> 
                    <p className="mb-0 text-muted small">{company.address}</p>  
                    <p className="mb-0 text-muted small">{company.state}, {company.country}</p>
                    <p className="mb-0 text-muted small">Phone: {company.companyContact}</p>
                  </div>
                  <div className="text-end">
                    <h4 className="mb-2 fw-bold" style={{ color: '#764ba2' }}>INVOICE</h4>
                    <p className="mb-1 text-muted small"><strong className="text-dark">Invoice No:</strong> {selectedBill.invoiceNumber || 'N/A'}</p>
                    <p className="mb-0 text-muted small"><strong className="text-dark">Date:</strong> {selectedBill.date}</p>
                  </div>
                </div>

                {/* Billed To */}
                <div className="mb-5 p-3 rounded" style={{ background: '#f8f9fa', borderLeft: '4px solid #764ba2' }}>
                  <h6 className="text-muted mb-1 text-uppercase" style={{ fontSize: '12px', letterSpacing: '1px' }}>Billed To:</h6>
                  <h5 className="mb-0 fw-bold" style={{ color: '#2c3e50' }}>{selectedBill.partyName}</h5>
                </div>

                {/* Items Table */}
                <div className="table-responsive mb-4">
                  <table className="table table-bordered align-middle">
                    <thead style={{ background: "#f7f7fd" }}>
                      <tr className="small text-uppercase" style={{ color: "#6b7280" }}>
                        <th className="py-3">#</th>
                        <th className="py-3">Item Name</th>
                        <th className="py-3">Code</th>
                        <th className="py-3 text-center">Qty</th>
                        <th className="py-3 text-end">S.Price</th>
                        <th className="py-3 text-center">Disc</th>
                        <th className="py-3 text-center">Tax</th>
                        <th className="py-3 text-end">Net Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBill.items.map((item, i) => (
                        <tr key={i}>
                          <td className="text-muted">{i + 1}</td>
                          <td className="fw-semibold text-dark">{item.itemName}</td>
                          <td className="text-muted">{item.itemCode}</td>
                          <td className="text-center fw-bold">{item.qty}</td>
                          <td className="text-end text-muted">₹{item.sPrice}</td>
                          <td className="text-center text-muted">{item.discount}</td>
                          <td className="text-center text-muted">{item.tax}%</td>
                          <td className="text-end fw-bold" style={{ color: '#2c3e50' }}>₹{item.netAmount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Grand Total */}
                <div className="d-flex justify-content-end mb-4">
                  <div className="p-3 rounded" style={{ background: '#f0fdf4', minWidth: '250px' }}>
                    <h5 className="mb-0 d-flex justify-content-between align-items-center" style={{ color: '#166534' }}>
                      <span className="fw-semibold">Grand Total:</span> 
                      <span className="fw-bold fs-4">₹ {Number(selectedBill.grandTotal).toFixed(2)}</span>
                    </h5>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="d-flex justify-content-end gap-3 border-top pt-4 mt-2">
                  <button className="btn btn-light border px-4" style={{ borderRadius: '8px', fontWeight: '600' }} onClick={() => setShowBillModal(false)}>
                    Close
                  </button>
                  <button 
                    className="btn text-white px-4 d-flex align-items-center gap-2" 
                    style={{ background: GRAD_PURPLE, borderRadius: '8px', fontWeight: '600', border: 'none' }} 
                    onClick={() => window.print()}
                  >
                    <FaPrint /> Print Invoice
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesList;