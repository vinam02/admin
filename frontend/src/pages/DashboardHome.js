import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaShoppingCart, FaMoneyBillWave, FaBoxOpen, FaTruck } from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function DashboardHome() {
  const [summary, setSummary] = useState({
    purchaseQty: 0,
    saleQty: 0,
    purchaseAmount: 0,
    saleAmount: 0,
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get(`${API}/api/items/dashboard-summary`);
        setSummary(res.data);
      } catch (err) {
        console.log('Error fetching summary:', err);
      }
    };
    fetchSummary();
  }, []);

  const boxes = [
    {
      title: 'Total Purchase',
      qty: summary.purchaseQty,
      amount: summary.purchaseAmount,
      icon: <FaShoppingCart />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      iconBg: 'rgba(255,255,255,0.2)',
      label: 'Purchased Items',
    },
    {
      title: 'Total Sale',
      qty: summary.saleQty,
      amount: summary.saleAmount,
      icon: <FaMoneyBillWave />,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      iconBg: 'rgba(255,255,255,0.2)',
      label: 'Sold Items',
    },
  ];

  return (
    <div className="container-fluid py-4">
      <div className="d-flex align-items-center mb-4">
       
        <h2 className="mb-0 fw-bold">Dashboard</h2>
      </div>

      <div className="row g-4">
        {boxes.map((b) => (
          <div className="col-12 col-md-6" key={b.title}>
            <div
              className="card border-0 shadow-lg h-100"
              style={{
                borderRadius: '20px',
                background: b.gradient,
                color: '#fff',
                overflow: 'hidden',
                position: 'relative',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.15)';
              }}
            >
              {/* Decorative circle */}
              <div
                style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '-40px',
                  width: '140px',
                  height: '140px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '-30px',
                  left: '-30px',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)',
                }}
              />

              <div className="card-body p-4 d-flex align-items-center justify-content-between position-relative">
                <div>
                  <h6
                    className="text-uppercase mb-1 fw-semibold"
                    style={{ letterSpacing: '1.5px', opacity: 0.9, fontSize: '0.8rem' }}
                  >
                    {b.title}
                  </h6>
                  <h1 className="fw-bold mb-1" style={{ fontSize: '2.5rem' }}>
                    {b.qty}
                  </h1>
                  <small style={{ opacity: 0.85 }}>{b.label}</small>

                  {b.amount > 0 && (
                    <div
                      className="mt-2 px-3 py-1 d-inline-block"
                      style={{
                        background: 'rgba(255,255,255,0.18)',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                      }}
                    >
                      ₹ {Number(b.amount).toLocaleString('en-IN')}
                    </div>
                  )}
                </div>

                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '18px',
                    background: b.iconBg,
                    fontSize: '2.2rem',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                >
                  {b.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Optional extra summary row */}
      <div className="row g-4 mt-1">
        <div className="col-12 col-md-6">
          <div
            className="card border-0 shadow-sm h-100"
            style={{ borderRadius: '16px', background: '#f8f9ff' }}
          >
            <div className="card-body d-flex align-items-center p-4">
              <div
                className="d-flex align-items-center justify-content-center me-3"
                style={{
                  width: '55px',
                  height: '55px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  fontSize: '1.5rem',
                }}
              >
                <FaTruck />
              </div>
              <div>
                <small className="text-muted d-block">Purchase Amount</small>
                <h5 className="mb-0 fw-bold">
                  ₹ {Number(summary.purchaseAmount || 0).toLocaleString('en-IN')}
                </h5>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div
            className="card border-0 shadow-sm h-100"
            style={{ borderRadius: '16px', background: '#fff5f7' }}
          >
            <div className="card-body d-flex align-items-center p-4">
              <div
                className="d-flex align-items-center justify-content-center me-3"
                style={{
                  width: '55px',
                  height: '55px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: '#fff',
                  fontSize: '1.5rem',
                }}
              >
                <FaMoneyBillWave />
              </div>
              <div>
                <small className="text-muted d-block">Sale Amount</small>
                <h5 className="mb-0 fw-bold">
                  ₹ {Number(summary.saleAmount || 0).toLocaleString('en-IN')}
                </h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;