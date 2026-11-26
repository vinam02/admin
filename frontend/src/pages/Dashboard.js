import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import CompanyModal from '../components/CompanyModal';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Dashboard() {
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // ============ COMPANY FETCH ============
  useEffect(() => {
    const fetchCompany = async () => {
      const saved = localStorage.getItem('company');

      // localStorage me company hai? API se fresh data lo
      if (saved) {
        try {
          const { _id } = JSON.parse(saved);
          const res = await axios.get(`${API}/api/companies/${_id}`);
          setCompany(res.data);
          setLoading(false);
          return;
        } catch (err) {
          console.log(err);
          localStorage.removeItem('company');
        }
      }

      // localStorage khali → /company pe bhejo (wahan card dikhega)
      navigate('/company');
    };
    fetchCompany();
  }, [navigate]);

  // ============ CLICK OUTSIDE DROPDOWN ============
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ============ HANDLERS ============
  const openEditModal = () => {
    setShowDropdown(false);
    setShowModal(true);
  };

  const handleSuccess = (updatedCompany) => {
    setCompany(updatedCompany);
    localStorage.setItem('company', JSON.stringify(updatedCompany));
    setShowModal(false);
  };

  if (loading) return <h4 className="text-center mt-5">Loading...</h4>;

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* ============= NAVBAR ============= */}
      <nav
        className="navbar navbar-dark px-3 shadow-sm justify-content-between"
        style={{ backgroundColor: '#2c3e50' }}
      >
        <span className="navbar-brand mb-0 h1"></span>

        {company && (
          <div
            className="d-flex align-items-center gap-3 position-relative"
            ref={dropdownRef}
          >
            {/* Company Name ▾ (click → dropdown) */}
            <span
              className="text-white fw-bold"
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setShowDropdown((prev) => !prev)}
            >
              {company.companyName} ▾
            </span>

            {/* Dropdown */}
            {showDropdown && (
              <ul
                className="dropdown-menu show"
                style={{
                  position: 'absolute',
                  right: 0,
                  left: 'auto',
                  top: '100%',
                  marginTop: '8px',
                }}
              >
                <li>
                  <button className="dropdown-item" onClick={openEditModal}>
                    Update Company
                  </button>
                </li>
              </ul>
            )}
          </div>
        )}
      </nav>

      {/* ============= BODY ============= */}
      <div className="d-flex flex-column flex-md-row flex-grow-1">
        <Sidebar />
        <div className="flex-grow-1 p-3 p-md-4">
          <Outlet />
        </div>
      </div>

      {/* ============= EDIT MODAL ============= */}
      {showModal && company && (
        <CompanyModal
          mode="edit"
          company={company}
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
      
      
    </div>
    
  );
}

export default Dashboard;