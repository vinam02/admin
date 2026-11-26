import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FaPlusCircle, FaListUl } from 'react-icons/fa';

const GRAD = 'linear-gradient(135deg,#667eea,#764ba2)';

const tabStyle = ({ isActive }) => ({
  padding: '8px 22px',
  borderRadius: 30,
  textDecoration: 'none',
  fontSize: 14,
  fontWeight: 600,
  background: isActive ? GRAD : '#eef0f7',
  color: isActive ? '#fff' : '#2c3e50',
  boxShadow: isActive ? '0 4px 12px rgba(118,75,162,.3)' : 'none',
});

export default function Setting() {
  return (
    <div>
      <h2 className="fw-bold mb-3" style={{ color: '#1f2d3d' }}>Settings</h2>

      <div className="d-flex gap-2 mb-4">
       <NavLink to="/dashboard/settings/create-form" style={tabStyle}>
  <FaPlusCircle className="me-2" /> Create Form
</NavLink>
<NavLink to="/dashboard/settings/all-forms" style={tabStyle}>
  <FaListUl className="me-2" /> All Forms
</NavLink>
      </div>   

      <Outlet />
    </div>
  );
}